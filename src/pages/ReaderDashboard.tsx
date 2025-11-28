import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Heart, Star, Clock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const ReaderDashboard = () => {
  const { user, hasRole, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    booksRead: 0,
    readingTime: 0,
    favoritesCount: 0,
    followedAuthorsCount: 0,
  });
  const [currentlyReading, setCurrentlyReading] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [followedAuthors, setFollowedAuthors] = useState<any[]>([]);

  useEffect(() => {
    if (authLoading) return;

    if (!user || !hasRole("reader")) {
      if (!user) {
        navigate("/auth");
      } else {
        toast.error("Access denied. Reader role required.");
        navigate("/");
      }
      return;
    }

    fetchDashboardData();
  }, [user, hasRole, authLoading, navigate]);

  const fetchDashboardData = async () => {
    if (!user) return;

    // Fetch reading progress (currently reading)
    const { data: progressData } = await supabase
      .from("reading_progress")
      .select(`
        *,
        books!inner(id, title, author_id, profiles!inner(full_name)),
        chapters!inner(id, chapter_number, title)
      `)
      .eq("user_id", user.id)
      .order("last_read_at", { ascending: false })
      .limit(10);

    if (progressData) {
      const formattedProgress = progressData.map((item: any) => ({
        id: item.books.id,
        title: item.books.title,
        author: item.books.profiles.full_name,
        progress: item.progress_percentage,
        chapter: `Chapter ${item.chapters.chapter_number}`,
      }));
      setCurrentlyReading(formattedProgress);
    }

    // Fetch favorites
    const { data: favoritesData } = await supabase
      .from("favorites")
      .select(`
        *,
        books!inner(id, title, author_id, profiles!inner(full_name))
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (favoritesData) {
      const favBooks = await Promise.all(
        favoritesData.map(async (fav: any) => {
          const { data: reviewData } = await supabase
            .from("reviews")
            .select("rating")
            .eq("book_id", fav.books.id)
            .eq("user_id", user.id)
            .single();

          return {
            id: fav.books.id,
            title: fav.books.title,
            author: fav.books.profiles.full_name,
            rating: reviewData?.rating || 0,
          };
        })
      );
      setFavorites(favBooks);
    }

    // Fetch followed authors
    const { data: followsData } = await supabase
      .from("follows")
      .select(`
        *,
        profiles!follows_author_id_fkey(id, full_name, avatar_url)
      `)
      .eq("follower_id", user.id);

    if (followsData) {
      const authorsWithBooks = await Promise.all(
        followsData.map(async (follow: any) => {
          const { count } = await supabase
            .from("books")
            .select("*", { count: "exact", head: true })
            .eq("author_id", follow.profiles.id);

          return {
            id: follow.profiles.id,
            name: follow.profiles.full_name,
            books: count || 0,
            avatar: follow.profiles.avatar_url || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
          };
        })
      );
      setFollowedAuthors(authorsWithBooks);
    }

    // Calculate stats
    const { count: purchasesCount } = await supabase
      .from("book_purchases")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

    const { count: favCount } = await supabase
      .from("favorites")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

    const { count: followsCount } = await supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("follower_id", user.id);

    setStats({
      booksRead: purchasesCount || 0,
      readingTime: (purchasesCount || 0) * 6,
      favoritesCount: favCount || 0,
      followedAuthorsCount: followsCount || 0,
    });

    setLoading(false);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !hasRole("reader")) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Header */}
      <section className="bg-gradient-to-br from-reader-blue/10 via-background to-primary/10 py-8 border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Reader Dashboard</h1>
              <p className="text-muted-foreground">Your personal reading space</p>
            </div>
            <Button size="lg" variant="outline" asChild>
              <Link to="/books">
                <BookOpen className="h-5 w-5 mr-2" />
                Browse Books
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardDescription>Books Read</CardDescription>
              <BookOpen className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.booksRead}</div>
              <p className="text-xs text-muted-foreground">Books purchased</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardDescription>Reading Time</CardDescription>
              <Clock className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.readingTime}h</div>
              <p className="text-xs text-muted-foreground">Estimated</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardDescription>Favorites</CardDescription>
              <Heart className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.favoritesCount}</div>
              <p className="text-xs text-muted-foreground">Books saved</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardDescription>Authors Followed</CardDescription>
              <Star className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.followedAuthorsCount}</div>
              <p className="text-xs text-muted-foreground">Writers you follow</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="reading" className="space-y-6">
          <TabsList>
            <TabsTrigger value="reading">Currently Reading</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
            <TabsTrigger value="authors">Followed Authors</TabsTrigger>
            <TabsTrigger value="history">Reading History</TabsTrigger>
          </TabsList>

          <TabsContent value="reading" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Currently Reading</CardTitle>
                <CardDescription>Pick up where you left off</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentlyReading.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No books in progress</p>
                    <Button variant="outline" className="mt-4" asChild>
                      <Link to="/books">Browse Books</Link>
                    </Button>
                  </div>
                ) : (
                  currentlyReading.map((book) => (
                    <div
                      key={book.id}
                      className="flex items-center gap-4 p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="w-16 h-24 bg-primary/10 rounded flex items-center justify-center">
                        <BookOpen className="h-8 w-8 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">{book.title}</h3>
                        <p className="text-sm text-muted-foreground mb-2">by {book.author}</p>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">{book.chapter}</span>
                            <span className="font-medium">{book.progress}% complete</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-primary to-reader-blue h-2 rounded-full transition-all"
                              style={{ width: `${book.progress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      <Button asChild>
                        <Link to={`/books/${book.id}`}>Continue</Link>
                      </Button>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="favorites">
            <Card>
              <CardHeader>
                <CardTitle>Your Favorites</CardTitle>
                <CardDescription>Books you've loved</CardDescription>
              </CardHeader>
              <CardContent>
                {favorites.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No favorites yet</p>
                    <Button variant="outline" className="mt-4" asChild>
                      <Link to="/books">Discover Books</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {favorites.map((book) => (
                      <div
                        key={book.id}
                        className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <Heart className="h-5 w-5 fill-red-500 text-red-500" />
                          <div>
                            <h3 className="font-semibold">{book.title}</h3>
                            <p className="text-sm text-muted-foreground">by {book.author}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {book.rating > 0 && (
                            <div className="flex items-center gap-1">
                              {Array.from({ length: 5 }, (_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < Math.floor(book.rating)
                                      ? "fill-primary text-primary"
                                      : "text-muted"
                                  }`}
                                />
                              ))}
                            </div>
                          )}
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/books/${book.id}`}>View</Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="authors">
            <Card>
              <CardHeader>
                <CardTitle>Followed Authors</CardTitle>
                <CardDescription>Stay updated with your favorite writers</CardDescription>
              </CardHeader>
              <CardContent>
                {followedAuthors.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Not following any authors yet</p>
                    <Button variant="outline" className="mt-4" asChild>
                      <Link to="/books">Find Authors</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {followedAuthors.map((author) => (
                      <div
                        key={author.id}
                        className="p-4 border border-border rounded-lg text-center hover:shadow-md transition-shadow"
                      >
                        <div className="w-20 h-20 mx-auto mb-3 rounded-full overflow-hidden bg-muted">
                          <img src={author.avatar} alt={author.name} className="w-full h-full object-cover" />
                        </div>
                        <h3 className="font-semibold mb-1">{author.name}</h3>
                        <p className="text-sm text-muted-foreground mb-3">{author.books} books</p>
                        <Button variant="outline" size="sm" className="w-full" asChild>
                          <Link to="/books">View Books</Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Reading History</CardTitle>
                <CardDescription>Your reading journey</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                  Reading history and statistics will be displayed here
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
};

export default ReaderDashboard;
