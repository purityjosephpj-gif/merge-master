import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, TrendingUp, Plus, Eye, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const TalkZone = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [discussions, setDiscussions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();

    // Real-time subscriptions
    const discussionsChannel = supabase
      .channel('discussions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'discussions'
        },
        () => {
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(discussionsChannel);
    };
  }, []);

  const fetchData = async () => {
    // Fetch categories with discussion counts
    const { data: categoriesData } = await supabase
      .from('discussion_categories')
      .select('*')
      .order('name');

    if (categoriesData) {
      const categoriesWithCounts = await Promise.all(
        categoriesData.map(async (category) => {
          const { count } = await supabase
            .from('discussions')
            .select('*', { count: 'exact', head: true })
            .eq('category_id', category.id);
          
          return {
            ...category,
            count: count || 0
          };
        })
      );
      setCategories(categoriesWithCounts);
    }

    // Fetch discussions with replies count
    const { data: discussionsData } = await supabase
      .from('discussions')
      .select(`
        *,
        profiles:author_id (
          full_name,
          avatar_url
        ),
        discussion_categories (
          name
        )
      `)
      .order('updated_at', { ascending: false })
      .limit(20);

    if (discussionsData) {
      const discussionsWithStats = await Promise.all(
        discussionsData.map(async (discussion) => {
          const { count: repliesCount } = await supabase
            .from('discussion_replies')
            .select('*', { count: 'exact', head: true })
            .eq('discussion_id', discussion.id);
          
          return {
            ...discussion,
            replies: repliesCount || 0
          };
        })
      );
      setDiscussions(discussionsWithStats);
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-12 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading discussions...</p>
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-4">Talk Zone</h1>
              <p className="text-muted-foreground text-lg">
                Connect with writers and readers. Share ideas, ask questions, and grow together.
              </p>
            </div>
            <Button size="lg" className="bg-gradient-to-r from-primary to-writer-amber">
              <Plus className="h-5 w-5 mr-2" />
              New Topic
            </Button>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-[300px,1fr] gap-8">
          {/* Sidebar - Categories */}
          <aside className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Categories</CardTitle>
                <CardDescription>Browse discussions by topic</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.name}
                    className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${category.color}`} />
                      <span className="font-medium">{category.name}</span>
                    </div>
                    <Badge variant="secondary">{category.count}</Badge>
                  </button>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Trending Now
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {["#WritingTips", "#BookReviews", "#NewReleases", "#AuthorLife", "#IndiePublishing"].map((tag) => (
                  <Badge key={tag} variant="secondary" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">
                    {tag}
                  </Badge>
                ))}
              </CardContent>
            </Card>
          </aside>

          {/* Main Content */}
          <div className="space-y-6">
            {/* Filter Bar */}
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Button variant="default" size="sm">Latest</Button>
                <Button variant="outline" size="sm">Popular</Button>
                <Button variant="outline" size="sm">Unanswered</Button>
              </div>
            </div>

            {/* Discussion Threads */}
            <div className="space-y-4">
              {discussions.length === 0 ? (
                <div className="text-center py-12">
                  <MessageCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h2 className="text-2xl font-bold mb-2">No Discussions Yet</h2>
                  <p className="text-muted-foreground mb-6">
                    Be the first to start a conversation!
                  </p>
                  <Button className="bg-gradient-to-r from-primary to-writer-amber">
                    <Plus className="h-5 w-5 mr-2" />
                    Start a Discussion
                  </Button>
                </div>
              ) : (
                <>
                  {discussions.map((discussion) => (
                    <Card key={discussion.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                      <Link to={`/talk-zone/${discussion.id}`}>
                        <CardHeader>
                          <div className="flex items-start gap-4">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={discussion.profiles?.avatar_url} />
                              <AvatarFallback>{discussion.profiles?.full_name?.[0] || 'U'}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="secondary">
                                  {discussion.discussion_categories?.name || 'General'}
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                  Posted by {discussion.profiles?.full_name || 'Unknown'}
                                </span>
                              </div>
                              <CardTitle className="text-xl hover:text-primary transition-colors line-clamp-2">
                                {discussion.title}
                              </CardTitle>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-6 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <MessageCircle className="h-4 w-4" />
                                <span>{discussion.replies} replies</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Eye className="h-4 w-4" />
                                <span>{discussion.views} views</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Heart className="h-4 w-4" />
                                <span>{discussion.likes} likes</span>
                              </div>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {new Date(discussion.updated_at).toLocaleDateString()}
                            </span>
                          </div>
                        </CardContent>
                      </Link>
                    </Card>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default TalkZone;
