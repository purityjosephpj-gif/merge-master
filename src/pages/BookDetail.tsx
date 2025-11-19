import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, BookOpen, Clock, Users, ShoppingCart } from "lucide-react";
import { useParams, Link } from "react-router-dom";

const BookDetail = () => {
  const { id } = useParams();

  // Sample data
  const book = {
    title: "The Last Symphony",
    author: {
      name: "Sarah Mitchell",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
      books: 5,
      followers: "12.5K"
    },
    cover: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=600&h=900&fit=crop",
    genre: "Fiction",
    rating: 4.8,
    reviews: 342,
    price: "$9.99",
    pages: 342,
    readTime: "6-8 hours",
    published: "March 2024",
    description: "A captivating tale of love, loss, and redemption set against the backdrop of a world-renowned orchestra. When talented violinist Emma discovers a century-old mystery hidden within the score of an unfinished symphony, she embarks on a journey that will challenge everything she thought she knew about music, family, and herself.",
    chapters: Array.from({ length: 24 }, (_, i) => ({
      number: i + 1,
      title: `Chapter ${i + 1}`,
      isFree: i < 3
    }))
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Book Header */}
        <div className="grid md:grid-cols-[300px,1fr] gap-8 mb-12">
          {/* Book Cover */}
          <div className="space-y-4">
            <div className="aspect-[2/3] rounded-lg overflow-hidden shadow-lg">
              <img src={book.cover} alt={book.title} className="w-full h-full object-cover" />
            </div>
            
            <div className="space-y-2">
              <Button size="lg" className="w-full bg-gradient-to-r from-primary to-writer-amber">
                <ShoppingCart className="h-5 w-5 mr-2" />
                Buy Now - {book.price}
              </Button>
              <Button size="lg" variant="outline" className="w-full">
                <BookOpen className="h-5 w-5 mr-2" />
                Read Free Preview
              </Button>
            </div>

            <Card>
              <CardContent className="pt-6 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Pages</span>
                  <span className="font-medium">{book.pages}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Reading Time</span>
                  <span className="font-medium">{book.readTime}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Published</span>
                  <span className="font-medium">{book.published}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Book Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="secondary">{book.genre}</Badge>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-primary text-primary" />
                  <span className="font-semibold">{book.rating}</span>
                  <span className="text-sm text-muted-foreground">({book.reviews} reviews)</span>
                </div>
              </div>
              
              <h1 className="text-4xl font-bold mb-3">{book.title}</h1>
              
              <Link to={`/authors/${book.author.name}`} className="inline-flex items-center gap-3 hover:opacity-80 transition-opacity">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={book.author.avatar} />
                  <AvatarFallback>SM</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">by {book.author.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {book.author.books} books · {book.author.followers} followers
                  </p>
                </div>
              </Link>
            </div>

            <div className="prose prose-sm max-w-none">
              <h3 className="text-lg font-semibold mb-2">About this book</h3>
              <p className="text-muted-foreground leading-relaxed">{book.description}</p>
            </div>

            <div className="flex gap-3">
              <Button variant="outline">
                <Users className="h-4 w-4 mr-2" />
                Follow Author
              </Button>
              <Button variant="outline">Add to Wishlist</Button>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="preview" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="about">About Author</TabsTrigger>
          </TabsList>

          <TabsContent value="preview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Free Preview - First 3 Chapters</CardTitle>
                <CardDescription>
                  Get a taste of the story before you buy. Full book access available after purchase.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {book.chapters.slice(0, 5).map((chapter) => (
                    <div
                      key={chapter.number}
                      className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-sm font-semibold text-primary">
                          {chapter.number}
                        </div>
                        <span className="font-medium">{chapter.title}</span>
                      </div>
                      {chapter.isFree ? (
                        <Badge variant="secondary">Free</Badge>
                      ) : (
                        <Badge variant="outline">Locked</Badge>
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-6 text-center">
                  <p className="text-sm text-muted-foreground mb-4">
                    {book.chapters.length - 3} more chapters available after purchase
                  </p>
                  <Button className="bg-gradient-to-r from-primary to-writer-amber">
                    Buy Full Book - {book.price}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Reader Reviews</CardTitle>
                <CardDescription>{book.reviews} reviews</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="border-b border-border last:border-0 pb-6 last:pb-0">
                    <div className="flex items-start gap-4">
                      <Avatar>
                        <AvatarImage src={`https://i.pravatar.cc/150?img=${i}`} />
                        <AvatarFallback>U{i}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold">Reader {i}</span>
                          <div className="flex">
                            {Array.from({ length: 5 }, (_, j) => (
                              <Star key={j} className="h-4 w-4 fill-primary text-primary" />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Amazing book! The character development is superb and the plot keeps you engaged from start to finish. Highly recommended!
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="about" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={book.author.avatar} />
                    <AvatarFallback>SM</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle>{book.author.name}</CardTitle>
                    <CardDescription>
                      {book.author.books} published books · {book.author.followers} followers
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Sarah Mitchell is an award-winning author known for her compelling narratives and vivid character portrayals. With over a decade of experience in creative writing, she has captivated readers worldwide with her unique storytelling style.
                </p>
                <div className="flex gap-3">
                  <Button>Follow Author</Button>
                  <Button variant="outline">View All Books</Button>
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

export default BookDetail;
