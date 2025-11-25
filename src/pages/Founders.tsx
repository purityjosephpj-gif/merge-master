import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BookOpen, TrendingUp, Users, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Quote } from "lucide-react";

const Founders = () => {
  const [founders, setFounders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFounders();
  }, []);

  const fetchFounders = async () => {
    const { data } = await supabase
      .from("founders")
      .select("*")
      .order("order_index");

    if (data) {
      setFounders(data);
    }
    setLoading(false);
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-accent/10 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">Meet the Founders</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Two passionate individuals united by a vision to revolutionize how stories are shared and discovered
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="container mx-auto px-4 py-16">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl">Our Story</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-lg max-w-none">
            <p className="text-muted-foreground leading-relaxed">
              StoryConnect was born from a simple belief: every writer deserves a chance to share their story, and every reader deserves access to diverse, authentic voices. We noticed that traditional publishing often creates barriers between talented writers and eager readers.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Together, we set out to build a platform that democratizes publishing, making it easy for writers to share their work and for readers to discover new favorites. Our mission is to create a thriving community where stories connect people across the globe.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Founders Profiles */}
      <section className="container mx-auto px-4 py-16">
        {founders.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">
            No founders information available yet.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {founders.map((founder) => (
              <Card key={founder.id} className="overflow-hidden">
                {founder.image_url && (
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={founder.image_url}
                      alt={founder.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl">{founder.name}</CardTitle>
                  <CardDescription className="text-lg">{founder.role}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {founder.bio && (
                    <p className="text-muted-foreground leading-relaxed">
                      {founder.bio}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Mission & Vision */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Our Mission</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  To empower writers worldwide by providing them with the tools, platform, and community they need to share their stories. We believe in making publishing accessible, transparent, and rewarding for creators while connecting readers with authentic, diverse voices.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Our Vision</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  To become the world's most beloved platform for independent writers and readers. We envision a future where anyone with a story can find their audience, where readers discover their next favorite book, and where a global community celebrates the art of storytelling.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Creativity First",
                description: "We put writers and their creative vision at the heart of everything we do."
              },
              {
                title: "Community Driven",
                description: "Building a supportive space where writers and readers connect and grow together."
              },
              {
                title: "Transparency",
                description: "Clear pricing, fair royalties, and honest communication with our community."
              },
              {
                title: "Innovation",
                description: "Constantly improving our platform with the latest technology and user feedback."
              },
              {
                title: "Accessibility",
                description: "Making quality storytelling available to everyone, everywhere."
              },
              {
                title: "Integrity",
                description: "Operating with honesty, respect, and ethical standards in all we do."
              }
            ].map((value) => (
              <Card key={value.title}>
                <CardHeader>
                  <CardTitle className="text-lg">{value.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Founders;
