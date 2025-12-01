import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Blog = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", "Writing Tips", "Author Interviews", "Industry News", "Reading Culture", "Publishing Advice"];

  useEffect(() => {
    fetchBlogPosts();

    // Real-time subscription
    const channel = supabase
      .channel('blog-posts-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'blog_posts'
        },
        () => {
          fetchBlogPosts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchBlogPosts = async () => {
    const { data, error } = await supabase
      .from('blog_posts')
      .select(`
        *,
        profiles:author_id (
          full_name,
          avatar_url
        )
      `)
      .order('published_at', { ascending: false });

    if (error) {
      console.error('Error fetching blog posts:', error);
    } else if (data) {
      setPosts(data);
    }
    setLoading(false);
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-12 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading blog posts...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Badge
                key={category}
                variant={category === selectedCategory ? "default" : "secondary"}
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors px-4 py-2"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="container mx-auto px-4 py-8">
        {filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">No Blog Posts Yet</h2>
            <p className="text-muted-foreground mb-6">
              Check back soon for writing tips, author interviews, and industry insights!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => (
              <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
                <Link to={`/blog/${post.id}`}>
                  {post.cover_image_url && (
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={post.cover_image_url}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <Badge className="w-fit mb-2" variant="secondary">{post.category}</Badge>
                    <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
                      {post.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {post.excerpt || post.content?.substring(0, 150) + '...'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{post.profiles?.full_name || 'Admin'}</span>
                      <span>•</span>
                      <span>{post.read_time} min read</span>
                      <span>•</span>
                      <span>{new Date(post.published_at).toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
};

export default Blog;
