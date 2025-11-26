import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Users, BookOpen, DollarSign, TrendingUp, Shield, Trash2, Edit } from "lucide-react";
import { toast } from "sonner";
import AdminFoundersTab from "@/components/AdminFoundersTab";

const AdminDashboard = () => {
  const { user, hasRole, loading } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<any[]>([]);
  const [books, setBooks] = useState<any[]>([]);
  const [founders, setFounders] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBooks: 0,
    totalRevenue: 0,
    activeWriters: 0,
  });
  const [showFounderForm, setShowFounderForm] = useState(false);
  const [founderForm, setFounderForm] = useState({
    name: "",
    role: "",
    bio: "",
    linkedin_url: "",
    twitter_url: "",
    order_index: 0,
  });
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (!loading && (!user || !hasRole("admin"))) {
      toast.error("Access denied. Admin privileges required.");
      navigate("/");
    }
  }, [user, hasRole, loading, navigate]);

  useEffect(() => {
    if (user && hasRole("admin")) {
      fetchDashboardData();

      // Set up real-time subscriptions
      const usersChannel = supabase
        .channel("users-changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "profiles",
          },
          () => {
            fetchDashboardData();
          }
        )
        .subscribe();

      const booksChannel = supabase
        .channel("books-changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "books",
          },
          () => {
            fetchDashboardData();
          }
        )
        .subscribe();

      const foundersChannel = supabase
        .channel("founders-changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "founders",
          },
          () => {
            fetchDashboardData();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(usersChannel);
        supabase.removeChannel(booksChannel);
        supabase.removeChannel(foundersChannel);
      };
    }
  }, [user, hasRole]);

  const fetchDashboardData = async () => {
    // Fetch users with their roles
    const { data: usersData } = await supabase
      .from("profiles")
      .select(`
        *,
        user_roles (role)
      `)
      .order("created_at", { ascending: false });

    if (usersData) {
      setUsers(usersData);
    }

    // Fetch books
    const { data: booksData } = await supabase
      .from("books")
      .select(`
        *,
        profiles (full_name)
      `)
      .order("created_at", { ascending: false });

    if (booksData) {
      setBooks(booksData);
    }

    // Fetch founders
    const { data: foundersData } = await supabase
      .from("founders")
      .select("*")
      .order("order_index");

    if (foundersData) {
      setFounders(foundersData);
    }

    // Calculate stats
    const { count: profilesCount } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });

    const { count: booksCount } = await supabase
      .from("books")
      .select("*", { count: "exact", head: true });

    const { data: purchases } = await supabase
      .from("book_purchases")
      .select("amount");

    const totalRevenue = purchases?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

    const { count: writersCount } = await supabase
      .from("user_roles")
      .select("*", { count: "exact", head: true })
      .eq("role", "writer");

    setStats({
      totalUsers: profilesCount || 0,
      totalBooks: booksCount || 0,
      totalRevenue,
      activeWriters: writersCount || 0,
    });
  };

  const deleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    const { error } = await supabase
      .from("profiles")
      .delete()
      .eq("id", userId);

    if (error) {
      toast.error("Failed to delete user");
    } else {
      toast.success("User deleted successfully");
      fetchDashboardData();
    }
  };

  const deleteBook = async (bookId: string) => {
    if (!confirm("Are you sure you want to delete this book?")) return;

    const { error } = await supabase
      .from("books")
      .delete()
      .eq("id", bookId);

    if (error) {
      toast.error("Failed to delete book");
    } else {
      toast.success("Book deleted successfully");
      fetchDashboardData();
    }
  };

  const updateBookStatus = async (bookId: string, status: "draft" | "published" | "archived") => {
    const { error } = await supabase
      .from("books")
      .update({ status })
      .eq("id", bookId);

    if (error) {
      toast.error("Failed to update book status");
    } else {
      toast.success("Book status updated");
      fetchDashboardData();
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    setUploadingImage(true);

    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("founder-images")
      .upload(filePath, file);

    if (uploadError) {
      toast.error("Failed to upload image");
      setUploadingImage(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from("founder-images")
      .getPublicUrl(filePath);

    setFounderForm({ ...founderForm, image_url: publicUrl } as any);
    setUploadingImage(false);
    toast.success("Image uploaded successfully");
  };

  const handleAddFounder = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase.from("founders").insert({
      name: founderForm.name,
      role: founderForm.role,
      bio: founderForm.bio || null,
      image_url: (founderForm as any).image_url || null,
      linkedin_url: founderForm.linkedin_url || null,
      twitter_url: founderForm.twitter_url || null,
      order_index: founderForm.order_index,
    });

    if (error) {
      toast.error("Failed to add founder");
      return;
    }

    toast.success("Founder added successfully");
    setShowFounderForm(false);
    setFounderForm({
      name: "",
      role: "",
      bio: "",
      linkedin_url: "",
      twitter_url: "",
      order_index: founders.length,
    });
    fetchDashboardData();
  };

  const deleteFounder = async (founderId: string, imageUrl: string | null) => {
    if (!confirm("Are you sure you want to delete this founder?")) return;

    // Delete image from storage if exists
    if (imageUrl) {
      const fileName = imageUrl.split("/").pop();
      if (fileName) {
        await supabase.storage.from("founder-images").remove([fileName]);
      }
    }

    const { error } = await supabase.from("founders").delete().eq("id", founderId);

    if (error) {
      toast.error("Failed to delete founder");
    } else {
      toast.success("Founder deleted successfully");
      fetchDashboardData();
    }
  };

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

  if (!user || !hasRole("admin")) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="bg-gradient-to-br from-primary/10 via-background to-accent/10 py-8 border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          </div>
          <p className="text-muted-foreground">Manage users, books, and platform settings</p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardDescription>Total Users</CardDescription>
              <Users className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">Registered accounts</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardDescription>Total Books</CardDescription>
              <BookOpen className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalBooks}</div>
              <p className="text-xs text-muted-foreground">Published & drafts</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardDescription>Total Revenue</CardDescription>
              <DollarSign className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardDescription>Active Writers</CardDescription>
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.activeWriters}</div>
              <p className="text-xs text-muted-foreground">Content creators</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="books">Books</TabsTrigger>
            <TabsTrigger value="founders">Founders</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>View and manage all platform users</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Roles</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.full_name}</TableCell>
                        <TableCell>{user.id}</TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-wrap">
                            {user.user_roles?.map((ur: any, idx: number) => (
                              <Badge key={idx} variant="secondary">
                                {ur.role}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => deleteUser(user.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="books">
            <Card>
              <CardHeader>
                <CardTitle>Book Management</CardTitle>
                <CardDescription>Manage all books on the platform</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {books.map((book) => (
                      <TableRow key={book.id}>
                        <TableCell className="font-medium">{book.title}</TableCell>
                        <TableCell>{book.profiles?.full_name || "Unknown"}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              book.status === "published"
                                ? "default"
                                : book.status === "draft"
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {book.status}
                          </Badge>
                        </TableCell>
                        <TableCell>${Number(book.price).toFixed(2)}</TableCell>
                        <TableCell>{new Date(book.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                updateBookStatus(
                                  book.id,
                                  book.status === "published" ? "archived" : "published"
                                )
                              }
                            >
                              {book.status === "published" ? "Archive" : "Publish"}
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => deleteBook(book.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="founders">
            <AdminFoundersTab
              founders={founders}
              showFounderForm={showFounderForm}
              setShowFounderForm={setShowFounderForm}
              founderForm={founderForm}
              setFounderForm={setFounderForm}
              uploadingImage={uploadingImage}
              handleImageUpload={handleImageUpload}
              handleAddFounder={handleAddFounder}
              deleteFounder={deleteFounder}
            />
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Platform Analytics</CardTitle>
                <CardDescription>Detailed statistics and insights</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                  Analytics charts and detailed metrics will be displayed here
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Platform Settings</CardTitle>
                <CardDescription>Configure platform-wide settings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                    Platform settings and configuration options will be displayed here
                  </div>
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

export default AdminDashboard;
