import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Star, Filter } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Books = () => {
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("all");

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    setLoading(true);
    let query = supabase
      .from("books")
      .select(`
        *,
        profiles (full_name),
        reviews (rating)
      `)
      .eq("status", "published");

    const { data, error } = await query;

    if (!error && data) {
      // Calculate average rating for each book
      const booksWithRating = data.map((book: any) => {
        const ratings = book.reviews?.map((r: any) => r.rating) || [];
        const avgRating = ratings.length > 0
          ? (ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length).toFixed(1)
          : "0.0";
        return {
          ...book,
          rating: avgRating,
          reviewCount: ratings.length,
          author: book.profiles?.full_name || "Unknown Author",
        };
      });
      setBooks(booksWithRating);
    }
    setLoading(false);
  };

  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      searchQuery === "" ||
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = selectedGenre === "all" || book.genre === selectedGenre;
    return matchesSearch && matchesGenre;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Header */}
      <section className="bg-gradient-to-br from-primary/5 to-accent/5 py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Browse Books</h1>
          <p className="text-muted-foreground text-lg">Discover your next favorite read from our collection</p>
        </div>
      </section>

      {/* Filters & Search */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search books or authors..."
                className="pl-10 h-12"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Select value={selectedGenre} onValueChange={setSelectedGenre}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Genre" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Genres</SelectItem>
                <SelectItem value="Fiction">Fiction</SelectItem>
                <SelectItem value="Sci-Fi">Sci-Fi</SelectItem>
                <SelectItem value="Mystery">Mystery</SelectItem>
                <SelectItem value="Romance">Romance</SelectItem>
                <SelectItem value="Thriller">Thriller</SelectItem>
                <SelectItem value="Adventure">Adventure</SelectItem>
              </SelectContent>
            </Select>

            <Select defaultValue="popular">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="icon" className="shrink-0">
              <Filter className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Books Grid */}
      <section className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <p className="text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{filteredBooks.length}</span> books
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading books...</p>
            </div>
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">No books found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-6">
            {filteredBooks.map((book) => (
              <Card key={book.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer">
                <Link to={`/books/${book.id}`}>
                  <div className="aspect-[2/3] overflow-hidden bg-muted">
                    {book.cover_url ? (
                      <img
                        src={book.cover_url}
                        alt={book.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/10">
                        <span className="text-muted-foreground">No cover</span>
                      </div>
                    )}
                  </div>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <Badge variant="secondary" className="shrink-0">{book.genre || "General"}</Badge>
                      <div className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                        <span className="text-sm font-medium">{book.rating}</span>
                        <span className="text-xs text-muted-foreground">({book.reviewCount})</span>
                      </div>
                    </div>
                    <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
                      {book.title}
                    </CardTitle>
                    <CardDescription className="mt-1">by {book.author}</CardDescription>
                  </CardHeader>
                  <CardFooter className="flex items-center justify-between pt-0">
                    <span className="text-xl font-bold text-primary">KSH {Number(book.price).toFixed(2)}</span>
                    <Button size="sm" variant="secondary" className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      View Book
                    </Button>
                  </CardFooter>
                </Link>
              </Card>
            ))}
          </div>
        )}

        {/* Load More */}
        {!loading && filteredBooks.length > 0 && (
          <div className="mt-12 text-center">
            <Button size="lg" variant="outline">
              Load More Books
            </Button>
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
};

export default Books;
