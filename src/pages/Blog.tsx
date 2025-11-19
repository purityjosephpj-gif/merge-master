import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Link } from "react-router-dom";

const Blog = () => {
  const categories = ["All", "Writing Tips", "Author Interviews", "Industry News", "Reading Culture", "Publishing Advice"];

  const posts = Array.from({ length: 9 }, (_, i) => ({
    id: i + 1,
    title: [
      "10 Tips for Writing Compelling Characters",
      "How to Build Your Author Platform",
      "The Art of Crafting Perfect Opening Lines",
      "Interview with Bestselling Author Sarah Mitchell",
      "Understanding Book Marketing in 2024",
      "Creating Tension in Your Story",
      "The Power of Reader Communities",
      "Self-Publishing vs Traditional Publishing",
      "Writing Realistic Dialogue"
    ][i],
    excerpt: "Discover essential techniques and insights that will help you improve your writing craft and connect with your audience...",
    category: categories[(i % 5) + 1],
    image: `https://images.unsplash.com/photo-${1516414447565 + i * 10000}-b14be0aeb4e6?w=800&h=500&fit=crop`,
    author: "Editorial Team",
    date: `${Math.floor(1 + Math.random() * 14)} days ago`,
    readTime: `${Math.floor(3 + Math.random() * 7)} min read`
  }));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Header */}
      <section className="bg-gradient-to-br from-primary/5 to-accent/5 py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Blog</h1>
          <p className="text-muted-foreground text-lg">
            Tips, insights, and stories from the world of writing and reading
          </p>
        </div>
      </section>

      {/* Search & Categories */}
      <section className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search articles..."
              className="pl-10 h-12"
            />
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Badge
                key={category}
                variant={category === "All" ? "default" : "secondary"}
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors px-4 py-2"
              >
                {category}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Post */}
      <section className="container mx-auto px-4 py-8">
        <Card className="overflow-hidden max-w-6xl mx-auto hover:shadow-lg transition-shadow">
          <Link to="/blog/1">
            <div className="grid md:grid-cols-2 gap-0">
              <div className="aspect-video md:aspect-auto overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&h=600&fit=crop"
                  alt="Featured post"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-8 flex flex-col justify-center">
                <Badge className="w-fit mb-4">Featured</Badge>
                <CardTitle className="text-3xl mb-4 hover:text-primary transition-colors">
                  The Complete Guide to Self-Publishing in 2024
                </CardTitle>
                <CardDescription className="text-base mb-6">
                  Everything you need to know about self-publishing your book, from manuscript preparation to marketing strategies. Learn from successful indie authors and industry experts.
                </CardDescription>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>Editorial Team</span>
                  <span>•</span>
                  <span>10 min read</span>
                  <span>•</span>
                  <span>2 days ago</span>
                </div>
              </div>
            </div>
          </Link>
        </Card>
      </section>

      {/* Blog Posts Grid */}
      <section className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
              <Link to={`/blog/${post.id}`}>
                <div className="aspect-video overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <CardHeader>
                  <Badge className="w-fit mb-2" variant="secondary">{post.category}</Badge>
                  <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
                    {post.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {post.excerpt}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{post.author}</span>
                    <span>•</span>
                    <span>{post.readTime}</span>
                    <span>•</span>
                    <span>{post.date}</span>
                  </div>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>

        {/* Load More */}
        <div className="mt-12 text-center">
          <Button size="lg" variant="outline">
            Load More Articles
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Blog;
