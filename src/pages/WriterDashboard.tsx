import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BookOpen, TrendingUp, Users, DollarSign, Trash2, Eye, Star, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import CreateBookDialog from "@/components/CreateBookDialog";
import ManageChaptersDialog from "@/components/ManageChaptersDialog";
import EditBookDialog from "@/components/EditBookDialog";
import { AuthorProfile } from "@/components/AuthorProfile";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Book {
  id: string;
  title: string;
  status: string;
  price: number;
  total_chapters: number;
  created_at: string;
  description: string | null;
  genre: string | null;
  cover_url: string | null;
  free_chapters: number;
}

interface BookPerformance {
  book_id: string;
  book_title: string;
  purchases: number;
  revenue: number;
  avg_rating: number;
  reviews_count: number;
}

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  profiles: {
    full_name: string;
  };
  books: {
    title: string;
  };
}

const WriterDashboard = () => {
  const { user, hasRole, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [books, setBooks] = useState<Book[]>([]);
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalEarnings: 0,
    totalReaders: 0,
    totalReviews: 0,
    avgRating: 0,
  });
  const [bookPerformance, setBookPerformance] = useState<BookPerformance[]>([]);
  const [recentReviews, setRecentReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!user || !hasRole("writer")) {
      if (!user) {
        navigate("/auth");
      } else {
        toast.error("Access denied. Writer role required.");
        navigate("/");
      }
      return;
    }

    fetchDashboardData();
  }, [user, hasRole, authLoading, navigate]);

  const fetchDashboardData = async () => {
    if (!user) return;

    // Fetch books
    const { data: booksData } = await supabase
      .from("books")
      .select("*")
      .eq("author_id", user.id)
      .order("created_at", { ascending: false });

    if (booksData) {
      setBooks(booksData);
    }

    // Fetch earnings
    const { data: purchasesData } = await supabase
      .from("book_purchases")
      .select("amount, books!inner(author_id)")
      .eq("books.author_id", user.id);

    const totalEarnings = purchasesData?.reduce(
      (sum, p) => sum + parseFloat(p.amount.toString()),
      0
    ) || 0;

    // Fetch unique readers
    const { count: readersCount } = await supabase
      .from("book_purchases")
      .select("user_id, books!inner(author_id)", { count: "exact", head: true })
      .eq("books.author_id", user.id);

    // Fetch reviews and calculate average rating
    const { data: reviewsData, count: reviewsCount } = await supabase
      .from("reviews")
      .select("rating, books!inner(author_id)", { count: "exact" })
      .eq("books.author_id", user.id);

    const avgRating = reviewsData && reviewsData.length > 0
      ? reviewsData.reduce((sum, r) => sum + r.rating, 0) / reviewsData.length
      : 0;

    // Fetch book performance
    const bookIds = booksData?.map(b => b.id) || [];
    const performance: BookPerformance[] = await Promise.all(
      booksData?.map(async (book) => {
        const { count: purchases } = await supabase
          .from("book_purchases")
          .select("*", { count: "exact", head: true })
          .eq("book_id", book.id);

        const { data: bookPurchases } = await supabase
          .from("book_purchases")
          .select("amount")
          .eq("book_id", book.id);

        const revenue = bookPurchases?.reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0) || 0;

        const { data: bookReviews, count: reviewsCount } = await supabase
          .from("reviews")
          .select("rating", { count: "exact" })
          .eq("book_id", book.id);

        const avgRating = bookReviews && bookReviews.length > 0
          ? bookReviews.reduce((sum, r) => sum + r.rating, 0) / bookReviews.length
          : 0;

        return {
          book_id: book.id,
          book_title: book.title,
          purchases: purchases || 0,
          revenue,
          avg_rating: avgRating,
          reviews_count: reviewsCount || 0,
        };
      }) || []
    );

    // Fetch recent reviews
    const { data: recentReviewsData } = await supabase
      .from("reviews")
      .select(`
        id,
        rating,
        comment,
        created_at,
        profiles!inner(full_name),
        books!inner(title, author_id)
      `)
      .eq("books.author_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);

    setStats({
      totalBooks: booksData?.length || 0,
      totalEarnings,
      totalReaders: readersCount || 0,
      totalReviews: reviewsCount || 0,
      avgRating,
    });

    setBookPerformance(performance);
    setRecentReviews(recentReviewsData || []);
    setLoading(false);
  };

  const updateBookStatus = async (bookId: string, status: string) => {
    const { error } = await supabase
      .from("books")
      .update({ 
        status: status as "draft" | "published" | "archived",
        published_at: status === "published" ? new Date().toISOString() : null
      })
      .eq("id", bookId);

    if (error) {
      toast.error("Failed to update book status");
      return;
    }

    toast.success("Book status updated");
    fetchDashboardData();
  };

  const deleteBook = async (bookId: string) => {
    if (!confirm("Are you sure you want to delete this book? This action cannot be undone.")) {
      return;
    }

    const { error } = await supabase.from("books").delete().eq("id", bookId);

    if (error) {
      toast.error("Failed to delete book");
      return;
    }

    toast.success("Book deleted");
    fetchDashboardData();
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

  if (!user || !hasRole("writer")) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Header */}
      <section className="bg-gradient-to-br from-writer-amber/10 via-background to-primary/10 py-8 border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Writer Dashboard</h1>
              <p className="text-muted-foreground">Manage your books and track your success</p>
            </div>
            <CreateBookDialog onBookCreated={fetchDashboardData} />
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardDescription>Total Books</CardDescription>
              <BookOpen className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-1">{stats.totalBooks}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardDescription>Total Readers</CardDescription>
              <Users className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-1">{stats.totalReaders}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardDescription>Avg Rating</CardDescription>
              <Star className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-1">{stats.avgRating.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground">{stats.totalReviews} reviews</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardDescription>Total Earnings</CardDescription>
              <DollarSign className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-1">${stats.totalEarnings.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardDescription>Engagement</CardDescription>
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-1">
                {stats.totalBooks > 0 ? Math.round(stats.totalReaders / stats.totalBooks) : 0}
              </div>
              <p className="text-xs text-muted-foreground">Readers per book</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="books" className="space-y-6">
          <TabsList>
            <TabsTrigger value="books">My Books</TabsTrigger>
            <TabsTrigger value="profile">Author Profile</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="reviews">Recent Reviews</TabsTrigger>
            <TabsTrigger value="earnings">Earnings</TabsTrigger>
          </TabsList>

          <TabsContent value="books" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Your Books</CardTitle>
                <CardDescription>Manage your published and draft books</CardDescription>
              </CardHeader>
              <CardContent>
                {books.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No books yet. Create your first book to get started!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {books.map((book) => (
                      <div
                        key={book.id}
                        className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-12 h-16 bg-primary/10 rounded flex items-center justify-center">
                            <BookOpen className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{book.title}</h3>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                              <span>{book.total_chapters} chapters</span>
                              <span>•</span>
                              <span>{book.free_chapters} free</span>
                              <span>•</span>
                              <span>${book.price}</span>
                              <span>•</span>
                              <Badge variant={book.status === "published" ? "default" : "secondary"}>
                                {book.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Select
                            value={book.status}
                            onValueChange={(value) => updateBookStatus(book.id, value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="draft">Draft</SelectItem>
                              <SelectItem value="published">Published</SelectItem>
                              <SelectItem value="archived">Archived</SelectItem>
                            </SelectContent>
                          </Select>
                          <EditBookDialog book={book} onBookUpdated={fetchDashboardData} />
                          <ManageChaptersDialog bookId={book.id} bookTitle={book.title} />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteBook(book.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-4">
            <AuthorProfile />
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Book Performance</CardTitle>
                <CardDescription>Track how each book is performing</CardDescription>
              </CardHeader>
              <CardContent>
                {bookPerformance.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No performance data yet</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Book Title</TableHead>
                        <TableHead className="text-center">Purchases</TableHead>
                        <TableHead className="text-center">Revenue</TableHead>
                        <TableHead className="text-center">Avg Rating</TableHead>
                        <TableHead className="text-center">Reviews</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bookPerformance.map((perf) => (
                        <TableRow key={perf.book_id}>
                          <TableCell className="font-medium">{perf.book_title}</TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Eye className="h-4 w-4 text-muted-foreground" />
                              {perf.purchases}
                            </div>
                          </TableCell>
                          <TableCell className="text-center font-semibold">
                            ${perf.revenue.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                              {perf.avg_rating > 0 ? perf.avg_rating.toFixed(1) : "N/A"}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-1">
                              <MessageSquare className="h-4 w-4 text-muted-foreground" />
                              {perf.reviews_count}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Reviews</CardTitle>
                <CardDescription>Latest feedback from your readers</CardDescription>
              </CardHeader>
              <CardContent>
                {recentReviews.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No reviews yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentReviews.map((review) => (
                      <div
                        key={review.id}
                        className="p-4 border border-border rounded-lg space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{review.profiles.full_name}</span>
                            <Badge variant="secondary" className="text-xs">
                              {review.books.title}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating
                                    ? "text-yellow-500 fill-yellow-500"
                                    : "text-muted-foreground"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        {review.comment && (
                          <p className="text-sm text-muted-foreground">{review.comment}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {new Date(review.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="earnings">
            <Card>
              <CardHeader>
                <CardTitle>Earnings Overview</CardTitle>
                <CardDescription>Track your book sales and revenue</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <div className="text-3xl font-bold mb-2">${stats.totalEarnings.toFixed(2)}</div>
                  <p className="text-muted-foreground">Total earnings from {stats.totalReaders} readers</p>
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

export default WriterDashboard;