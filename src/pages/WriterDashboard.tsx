import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BookOpen, TrendingUp, Users, DollarSign, Edit, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import CreateBookDialog from "@/components/CreateBookDialog";
import ManageChaptersDialog from "@/components/ManageChaptersDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Book {
  id: string;
  title: string;
  status: string;
  price: number;
  total_chapters: number;
  created_at: string;
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
  });
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

    // Fetch reviews
    const { count: reviewsCount } = await supabase
      .from("reviews")
      .select("id, books!inner(author_id)", { count: "exact", head: true })
      .eq("books.author_id", user.id);

    setStats({
      totalBooks: booksData?.length || 0,
      totalEarnings,
      totalReaders: readersCount || 0,
      totalReviews: reviewsCount || 0,
    });

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
              <CardDescription>Total Reviews</CardDescription>
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-1">{stats.totalReviews}</div>
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
        </div>

        {/* Main Content */}
        <Tabs defaultValue="books" className="space-y-6">
          <TabsList>
            <TabsTrigger value="books">My Books</TabsTrigger>
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