import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Star, Filter } from "lucide-react";
import { Link } from "react-router-dom";

const Books = () => {
  const books = Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    title: [
      "The Last Symphony",
      "Digital Horizons",
      "Whispers in Time",
      "Mountain Echoes",
      "Ocean's Memory",
      "The Silent Garden",
      "Neon Dreams",
      "Forgotten Kingdoms",
      "Starlight Chronicles",
      "The Paper House",
      "Urban Legends",
      "Beyond the Mist"
    ][i],
    author: [
      "Sarah Mitchell",
      "James Chen",
      "Emma Rodriguez",
      "David Thompson",
      "Lisa Wang",
      "Marcus Johnson",
      "Nina Patel",
      "Alex Rivera",
      "Sophie Turner",
      "Ryan Lee",
      "Maya Singh",
      "Tom Anderson"
    ][i],
    cover: `https://images.unsplash.com/photo-${1543002588 + i * 10000}-bfa74002ed7e?w=400&h=600&fit=crop`,
    genre: ["Fiction", "Sci-Fi", "Mystery", "Adventure", "Romance", "Thriller"][i % 6],
    rating: (4.5 + Math.random() * 0.5).toFixed(1),
    price: `$${(7.99 + Math.random() * 7).toFixed(2)}`,
    reviews: Math.floor(50 + Math.random() * 450)
  }));

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
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Genre" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Genres</SelectItem>
                <SelectItem value="fiction">Fiction</SelectItem>
                <SelectItem value="sci-fi">Sci-Fi</SelectItem>
                <SelectItem value="mystery">Mystery</SelectItem>
                <SelectItem value="romance">Romance</SelectItem>
                <SelectItem value="thriller">Thriller</SelectItem>
                <SelectItem value="adventure">Adventure</SelectItem>
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
            Showing <span className="font-semibold text-foreground">{books.length}</span> books
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-6">
          {books.map((book) => (
            <Card key={book.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer">
              <Link to={`/books/${book.id}`}>
                <div className="aspect-[2/3] overflow-hidden bg-muted">
                  <img
                    src={book.cover}
                    alt={book.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <Badge variant="secondary" className="shrink-0">{book.genre}</Badge>
                    <div className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                      <span className="text-sm font-medium">{book.rating}</span>
                      <span className="text-xs text-muted-foreground">({book.reviews})</span>
                    </div>
                  </div>
                  <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
                    {book.title}
                  </CardTitle>
                  <CardDescription className="mt-1">by {book.author}</CardDescription>
                </CardHeader>
                <CardFooter className="flex items-center justify-between pt-0">
                  <span className="text-xl font-bold text-primary">{book.price}</span>
                  <Button size="sm" variant="secondary" className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    View Book
                  </Button>
                </CardFooter>
              </Link>
            </Card>
          ))}
        </div>

        {/* Load More */}
        <div className="mt-12 text-center">
          <Button size="lg" variant="outline">
            Load More Books
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Books;
