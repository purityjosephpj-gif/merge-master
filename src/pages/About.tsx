import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Users, TrendingUp, Award, Heart, Globe } from "lucide-react";
import { Link } from "react-router-dom";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-accent/10 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">About StoryConnect</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Empowering writers and connecting readers through the power of storytelling
          </p>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="container mx-auto px-4 py-16">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl text-center">Our Mission</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-lg max-w-none">
            <p className="text-muted-foreground text-center leading-relaxed text-lg">
              We believe every story deserves to be told and every reader deserves access to diverse, authentic voices. 
              StoryConnect is more than a platform—it's a community where writers can share their passion and readers 
              can discover their next favorite book. We're democratizing publishing, one story at a time.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* What We Offer */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">What We Offer</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                  <BookOpen className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>For Writers</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Self-publish easily, build your audience, track your analytics, and earn from your creativity. 
                  Share drafts or complete books with full control over your work.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 mx-auto mb-4 bg-reader-blue/10 rounded-full flex items-center justify-center">
                  <Users className="h-8 w-8 text-reader-blue" />
                </div>
                <CardTitle>For Readers</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Discover new stories, read free previews, support independent authors, and join a community 
                  of book lovers. Access thousands of books across all genres.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 mx-auto mb-4 bg-writer-amber/10 rounded-full flex items-center justify-center">
                  <Heart className="h-8 w-8 text-writer-amber" />
                </div>
                <CardTitle>For the Community</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Connect with fellow readers and writers, participate in discussions, share feedback, and 
                  celebrate the art of storytelling together.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* By the Numbers */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Our Impact</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
          {[
            { number: "10K+", label: "Active Writers", icon: BookOpen },
            { number: "100K+", label: "Published Books", icon: Award },
            { number: "1M+", label: "Monthly Readers", icon: Users },
            { number: "50+", label: "Countries", icon: Globe }
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <stat.icon className="h-8 w-8 text-primary" />
              </div>
              <div className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-writer-amber bg-clip-text text-transparent">
                {stat.number}
              </div>
              <p className="text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gradient-to-br from-primary/5 to-accent/5 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                step: "1",
                title: "Create an Account",
                description: "Sign up as a writer or reader in seconds. No complicated setup required."
              },
              {
                step: "2",
                title: "Share or Discover",
                description: "Writers upload their work, readers explore our catalog and preview books for free."
              },
              {
                step: "3",
                title: "Connect & Grow",
                description: "Build your audience, earn from your books, and be part of a thriving community."
              }
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary to-writer-amber rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-16 text-center">
        <Card className="max-w-3xl mx-auto bg-gradient-to-br from-primary/5 to-accent/5">
          <CardContent className="py-12">
            <h2 className="text-3xl font-bold mb-4">Ready to Join Us?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Whether you're a writer with a story to tell or a reader looking for your next adventure, 
              StoryConnect is your home.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" asChild className="bg-gradient-to-r from-primary to-writer-amber">
                <Link to="/auth?mode=register">Get Started Free</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/founders">Meet the Founders</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      <Footer />
    </div>
  );
};

export default About;
