import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, BookOpen, Users, TrendingUp, Award, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [featuredBooks, setFeaturedBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedBooks();
  }, []);

  const fetchFeaturedBooks = async () => {
    const { data, error } = await supabase
      .from("books")
      .select(`
        *,
        profiles (full_name),
        reviews (rating)
      `)
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(4);

    if (!error && data) {
      const booksWithRating = data.map((book: any) => {
        const ratings = book.reviews?.map((r: any) => r.rating) || [];
        const avgRating = ratings.length > 0
          ? (ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length).toFixed(1)
          : "4.5";
        return {
          ...book,
          rating: avgRating,
          author: book.profiles?.full_name || "Unknown Author",
        };
      });
      setFeaturedBooks(booksWithRating);
    }
    setLoading(false);
  };

  const upcomingStories = [
    { id: 1, title: "Echoes of Tomorrow", author: "Lisa Wang", chapters: "12/20 chapters" },
    { id: 2, title: "The Hidden Garden", author: "Marcus Johnson", chapters: "8/15 chapters" },
    { id: 3, title: "Shadows of the Past", author: "Nina Patel", chapters: "15/25 chapters" }
  ];

  const featuredAuthors = [
    { name: "Sarah Mitchell", books: 5, followers: "12.5K", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop" },
    { name: "James Chen", books: 3, followers: "8.2K", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop" },
    { name: "Emma Rodriguez", books: 7, followers: "15.8K", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/10 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
              Where Stories Find Their{" "}
              <span className="bg-gradient-to-r from-primary to-writer-amber bg-clip-text text-transparent">
                Readers
              </span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Discover amazing stories, support independent writers, and join a thriving community of book lovers
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="flex gap-2">
                <Input
                  placeholder="Search books, authors, genres..."
                  className="h-12 text-base"
                />
                <Button size="lg" className="px-8">
                  <Search className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" asChild className="bg-gradient-to-r from-primary to-writer-amber">
                <Link to="/auth?mode=register">Start Reading</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/books">Browse Books</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Books */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">Featured Books</h2>
          <Button variant="ghost" asChild>
            <Link to="/books">View All →</Link>
          </Button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            <div className="col-span-full flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : featuredBooks.length === 0 ? (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              No featured books available yet
            </div>
          ) : (
            featuredBooks.map((book) => (
              <Card key={book.id} className="overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer">
                <Link to={`/books/${book.id}`}>
                  <div className="aspect-[2/3] overflow-hidden">
                    {book.cover_url ? (
                      <img
                        src={book.cover_url}
                        alt={book.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/10">
                        <BookOpen className="h-12 w-12 text-primary" />
                      </div>
                    )}
                  </div>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <CardTitle className="text-lg line-clamp-1">{book.title}</CardTitle>
                        <CardDescription className="mt-1">by {book.author}</CardDescription>
                      </div>
                      <Badge variant="secondary" className="shrink-0">{book.genre || "Fiction"}</Badge>
                    </div>
                  </CardHeader>
                  <CardFooter className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-primary text-primary" />
                      <span className="text-sm font-medium">{book.rating}</span>
                    </div>
                    <span className="text-lg font-bold text-primary">${Number(book.price).toFixed(2)}</span>
                  </CardFooter>
                </Link>
              </Card>
            ))
          )}
        </div>
      </section>

      {/* New & Upcoming Stories */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold">New & Upcoming Stories</h2>
              <p className="text-muted-foreground mt-2">Read drafts as authors write them</p>
            </div>
            <Button variant="ghost" asChild>
              <Link to="/drafts">View All →</Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {upcomingStories.map((story) => (
              <Card key={story.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <Link to={`/drafts/${story.id}`}>
                  <CardHeader>
                    <Badge className="w-fit mb-2" variant="secondary">In Progress</Badge>
                    <CardTitle>{story.title}</CardTitle>
                    <CardDescription>by {story.author}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{story.chapters} published</p>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Authors */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-8">Featured Authors</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredAuthors.map((author) => (
            <Card key={author.name} className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden">
                  <img src={author.avatar} alt={author.name} className="w-full h-full object-cover" />
                </div>
                <CardTitle>{author.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center gap-6 text-sm">
                  <div>
                    <p className="font-bold text-lg">{author.books}</p>
                    <p className="text-muted-foreground">Books</p>
                  </div>
                  <div>
                    <p className="font-bold text-lg">{author.followers}</p>
                    <p className="text-muted-foreground">Followers</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">Follow</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      {/* Why Join Section */}
      <section className="bg-gradient-to-br from-primary/5 via-background to-accent/5 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Join StoryConnect?</h2>
            <p className="text-muted-foreground text-lg">Everything you need to share and discover great stories</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Self-Publish Easily</h3>
              <p className="text-muted-foreground">
                Upload your manuscript and reach readers worldwide
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-accent/10 rounded-full flex items-center justify-center">
                <Users className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold">Join the Community</h3>
              <p className="text-muted-foreground">
                Connect with readers and fellow writers
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-writer-amber/10 rounded-full flex items-center justify-center">
                <TrendingUp className="h-8 w-8 text-writer-amber" />
              </div>
              <h3 className="text-xl font-semibold">Earn from Your Books</h3>
              <p className="text-muted-foreground">
                Get paid for your creativity and hard work
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-reader-blue/10 rounded-full flex items-center justify-center">
                <Award className="h-8 w-8 text-reader-blue" />
              </div>
              <h3 className="text-xl font-semibold">Read Free Samples</h3>
              <p className="text-muted-foreground">
                Try before you buy - first 3 chapters free
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Blog Posts */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">From Our Blog</h2>
          <Button variant="ghost" asChild>
            <Link to="/blog">Read More →</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
              <Link to={`/blog/${i}`}>
                <div className="aspect-video overflow-hidden">
                  <img
                    src={`https://images.unsplash.com/photo-${1516414447565 + i * 1000}-b14be0aeb4e6?w=600&h=400&fit=crop`}
                    alt="Blog post"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardHeader>
                  <Badge className="w-fit mb-2">Writing Tips</Badge>
                  <CardTitle className="line-clamp-2">
                    {i === 1 && "10 Tips for Writing Compelling Characters"}
                    {i === 2 && "How to Build Your Author Platform"}
                    {i === 3 && "The Art of Crafting Perfect Opening Lines"}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    Learn the essential techniques that will help you improve your writing craft...
                  </CardDescription>
                </CardHeader>
              </Link>
            </Card>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
