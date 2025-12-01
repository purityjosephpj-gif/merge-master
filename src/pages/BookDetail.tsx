import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, BookOpen, Clock, Users, ShoppingCart } from "lucide-react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import ReviewForm from "@/components/ReviewForm";
import { toast } from "sonner";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  profiles: {
    full_name: string;
    avatar_url: string | null;
  };
}

const BookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [book, setBook] = useState<any>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchBookDetails();
      fetchReviews();
      trackBookView();
      if (user) {
        checkPurchaseStatus();
      }
    }
  }, [id, user]);

  const trackBookView = async () => {
    // Track book view for analytics
    await supabase.from('book_views').insert({
      book_id: id,
      user_id: user?.id || null,
      session_id: sessionStorage.getItem('session_id') || crypto.randomUUID(),
    });
    
    // Store session ID if not exists
    if (!sessionStorage.getItem('session_id')) {
      sessionStorage.setItem('session_id', crypto.randomUUID());
    }
  };

  const fetchBookDetails = async () => {
    const { data, error } = await supabase
      .from("books")
      .select(`
        *,
        profiles:author_id (
          id,
          full_name,
          avatar_url,
          bio
        ),
        chapters (
          id,
          chapter_number,
          title,
          is_free
        )
      `)
      .eq("id", id)
      .single();

    if (data) {
      setBook(data);
    }
    setLoading(false);
  };

  const fetchReviews = async () => {
    const { data } = await supabase
      .from("reviews")
      .select(`
        id,
        rating,
        comment,
        created_at,
        profiles:user_id (
          full_name,
          avatar_url
        )
      `)
      .eq("book_id", id)
      .order("created_at", { ascending: false });

    if (data) {
      setReviews(data as any);
    }
  };

  const checkPurchaseStatus = async () => {
    const { data } = await supabase
      .from("book_purchases")
      .select("id")
      .eq("book_id", id)
      .eq("user_id", user!.id)
      .maybeSingle();

    setHasPurchased(!!data);
  };

  const handleReadBook = () => {
    if (!user) {
      toast.error("Please sign in to read this book");
      navigate("/auth");
      return;
    }
    navigate(`/read/${id}`);
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Book not found</div>
        </div>
      </div>
    );
  }

  const avgRating = calculateAverageRating();
  const freeChapters = book.chapters?.filter((c: any) => c.is_free) || [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Book Header */}
        <div className="grid md:grid-cols-[300px,1fr] gap-8 mb-12">
          {/* Book Cover */}
          <div className="space-y-4">
            <div className="aspect-[2/3] rounded-lg overflow-hidden shadow-lg">
              <img src={book.cover} alt={book.title} className="w-full h-full object-cover" />
            </div>
            
            <div className="space-y-2">
              {hasPurchased ? (
                <Button size="lg" className="w-full" onClick={handleReadBook}>
                  <BookOpen className="h-5 w-5 mr-2" />
                  Continue Reading
                </Button>
              ) : (
                <>
                  <Button size="lg" className="w-full bg-gradient-to-r from-primary to-writer-amber">
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Buy Now - ${book.price}
                  </Button>
                  <Button size="lg" variant="outline" className="w-full" onClick={handleReadBook}>
                    <BookOpen className="h-5 w-5 mr-2" />
                    Read Free Preview
                  </Button>
                </>
              )}
            </div>

            <Card>
              <CardContent className="pt-6 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Chapters</span>
                  <span className="font-medium">{book.total_chapters}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Free Chapters</span>
                  <span className="font-medium">{book.free_chapters}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Published</span>
                  <span className="font-medium">{book.published_at ? new Date(book.published_at).toLocaleDateString() : "Not published"}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Book Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                {book.genre && <Badge variant="secondary">{book.genre}</Badge>}
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-primary text-primary" />
                  <span className="font-semibold">{avgRating || "No ratings"}</span>
                  <span className="text-sm text-muted-foreground">({reviews.length} reviews)</span>
                </div>
              </div>
              
              <h1 className="text-4xl font-bold mb-3">{book.title}</h1>
              
              <div className="inline-flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={book.profiles?.avatar_url || ""} />
                  <AvatarFallback>{book.profiles?.full_name?.[0] || "A"}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">by {book.profiles?.full_name || "Unknown Author"}</p>
                </div>
              </div>
            </div>

            <div className="prose prose-sm max-w-none">
              <h3 className="text-lg font-semibold mb-2">About this book</h3>
              <p className="text-muted-foreground leading-relaxed">{book.description}</p>
            </div>

            <div className="flex gap-3">
              <Button variant="outline">
                <Users className="h-4 w-4 mr-2" />
                Follow Author
              </Button>
              <Button variant="outline">Add to Wishlist</Button>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="preview" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="about">About Author</TabsTrigger>
          </TabsList>

          <TabsContent value="preview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Free Preview - First 3 Chapters</CardTitle>
                <CardDescription>
                  Get a taste of the story before you buy. Full book access available after purchase.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {book.chapters?.slice(0, 5).map((chapter: any) => (
                    <div
                      key={chapter.id}
                      className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-sm font-semibold text-primary">
                          {chapter.chapter_number}
                        </div>
                        <span className="font-medium">{chapter.title}</span>
                      </div>
                      {chapter.is_free ? (
                        <Badge variant="secondary">Free</Badge>
                      ) : (
                        <Badge variant="outline">Locked</Badge>
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-6 text-center">
                  <p className="text-sm text-muted-foreground mb-4">
                    {book.total_chapters - freeChapters.length} more chapters available after purchase
                  </p>
                  {!hasPurchased && (
                    <Button className="bg-gradient-to-r from-primary to-writer-amber">
                      Buy Full Book - ${book.price}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-4">
            {user && hasPurchased && (
              <ReviewForm bookId={id!} onReviewSubmitted={fetchReviews} />
            )}
            
            <Card>
              <CardHeader>
                <CardTitle>Reader Reviews</CardTitle>
                <CardDescription>{reviews.length} reviews</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {reviews.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No reviews yet. Be the first to review this book!
                  </p>
                ) : (
                  reviews.map((review) => (
                    <div key={review.id} className="border-b border-border last:border-0 pb-6 last:pb-0">
                      <div className="flex items-start gap-4">
                        <Avatar>
                          <AvatarImage src={review.profiles?.avatar_url || ""} />
                          <AvatarFallback>{review.profiles?.full_name?.[0] || "U"}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold">{review.profiles?.full_name || "Anonymous"}</span>
                            <div className="flex">
                              {Array.from({ length: 5 }, (_, j) => (
                                <Star
                                  key={j}
                                  className={`h-4 w-4 ${
                                    j < review.rating ? "fill-primary text-primary" : "text-muted"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {new Date(review.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          {review.comment && (
                            <p className="text-sm text-muted-foreground">{review.comment}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="about" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={book.profiles?.avatar_url || ""} />
                    <AvatarFallback>{book.profiles?.full_name?.[0] || "A"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle>{book.profiles?.full_name || "Unknown Author"}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  {book.profiles?.bio || "No bio available."}
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
};

export default BookDetail;
