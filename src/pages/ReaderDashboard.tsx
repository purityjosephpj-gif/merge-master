import { useEffect } from "react";
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

const ReaderDashboard = () => {
  const { user, hasRole, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;

    if (!user || !hasRole("reader")) {
      if (!user) {
        navigate("/auth");
      } else {
        toast.error("Access denied. Reader role required.");
        navigate("/");
      }
    }
  }, [user, hasRole, loading, navigate]);
  const currentlyReading = [
    { id: 1, title: "The Last Symphony", author: "Sarah Mitchell", progress: 65, chapter: "Chapter 16 of 24" },
    { id: 2, title: "Digital Horizons", author: "James Chen", progress: 30, chapter: "Chapter 5 of 18" }
  ];

  const favorites = [
    { id: 1, title: "Whispers in Time", author: "Emma Rodriguez", rating: 5 },
    { id: 2, title: "Mountain Echoes", author: "David Thompson", rating: 4.5 },
    { id: 3, title: "Ocean's Memory", author: "Lisa Wang", rating: 5 }
  ];

  const followedAuthors = [
    { name: "Sarah Mitchell", books: 5, avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150" },
    { name: "James Chen", books: 3, avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150" },
    { name: "Emma Rodriguez", books: 7, avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150" }
  ];

  if (loading) {
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
              <div className="text-3xl font-bold">23</div>
              <p className="text-xs text-muted-foreground">+3 this month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardDescription>Reading Time</CardDescription>
              <Clock className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">142h</div>
              <p className="text-xs text-muted-foreground">This year</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardDescription>Favorites</CardDescription>
              <Heart className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">18</div>
              <p className="text-xs text-muted-foreground">Books saved</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardDescription>Authors Followed</CardDescription>
              <Star className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">+2 this month</p>
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
                {currentlyReading.map((book) => (
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
                ))}
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
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/books/${book.id}`}>View</Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {followedAuthors.map((author) => (
                    <div
                      key={author.name}
                      className="p-4 border border-border rounded-lg text-center hover:shadow-md transition-shadow"
                    >
                      <div className="w-20 h-20 mx-auto mb-3 rounded-full overflow-hidden">
                        <img src={author.avatar} alt={author.name} className="w-full h-full object-cover" />
                      </div>
                      <h3 className="font-semibold mb-1">{author.name}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{author.books} books</p>
                      <Button variant="outline" size="sm" className="w-full">
                        View Profile
                      </Button>
                    </div>
                  ))}
                </div>
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
