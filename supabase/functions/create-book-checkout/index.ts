import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    const { bookId, bookTitle, price } = await req.json();
    
    if (!bookId || !bookTitle || price === undefined) {
      throw new Error("Book ID, title, and price are required");
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Check if customer exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    // Create a checkout session with dynamic price in KSH
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: "kes",
            product_data: {
              name: bookTitle,
              description: `Full access to "${bookTitle}"`,
            },
            unit_amount: Math.round(price * 100), // Convert to cents (KES uses smallest unit)
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/book/${bookId}?purchase=success`,
      cancel_url: `${req.headers.get("origin")}/book/${bookId}?purchase=canceled`,
      metadata: {
        book_id: bookId,
        user_id: user.id,
      },
    });

    // Record the purchase in the database
    const { error: purchaseError } = await supabaseClient
      .from("book_purchases")
      .insert({
        book_id: bookId,
        user_id: user.id,
        amount: price,
        payment_method: "stripe",
        transaction_id: session.id,
      });

    if (purchaseError) {
      console.error("Failed to record purchase:", purchaseError);
    }

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Checkout error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
