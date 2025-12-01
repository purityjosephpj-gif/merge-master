import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Eye, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Drafts = () => {
  const [draftStories, setDraftStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDraftBooks();

    // Real-time subscription
    const channel = supabase
      .channel('draft-books-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'books',
          filter: 'status=eq.draft'
        },
        () => {
          fetchDraftBooks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchDraftBooks = async () => {
    const { data: books, error } = await supabase
      .from('books')
      .select(`
        *,
        profiles:author_id (
          full_name,
          avatar_url
        ),
        chapters (count)
      `)
      .eq('status', 'draft')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching draft books:', error);
    } else if (books) {
      // Get stats for each book
      const booksWithStats = await Promise.all(books.map(async (book) => {
        const { count: chaptersCount } = await supabase
          .from('chapters')
          .select('*', { count: 'exact', head: true })
          .eq('book_id', book.id);

        const { count: favoritesCount } = await supabase
          .from('favorites')
          .select('*', { count: 'exact', head: true })
          .eq('book_id', book.id);

        // Mock views for now - you can add a views column later
        return {
          ...book,
          chaptersPublished: chaptersCount || 0,
          followers: favoritesCount || 0,
          views: Math.floor(Math.random() * 10000) + 1000,
        };
      }));

      setDraftStories(booksWithStats);
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
            <p className="mt-4 text-muted-foreground">Loading draft stories...</p>
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
      <section className="bg-gradient-to-br from-writer-amber/10 via-background to-primary/10 py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Draft Stories</h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Read works-in-progress as authors write them. Follow your favorite writers and be part of their creative journey.
          </p>
        </div>
      </section>

      {/* Drafts Grid */}
      <section className="container mx-auto px-4 py-12">
        {draftStories.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">No Draft Stories Yet</h2>
            <p className="text-muted-foreground mb-6">
              Check back soon for works in progress from our writers!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {draftStories.map((story) => {
              const progress = story.total_chapters > 0 
                ? (story.chaptersPublished / story.total_chapters) * 100 
                : 0;
            
              return (
                <Card key={story.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="secondary">{story.genre || 'General'}</Badge>
                      <Badge className="bg-writer-amber/20 text-writer-amber hover:bg-writer-amber/30">
                        In Progress
                      </Badge>
                    </div>
                    <CardTitle className="text-xl line-clamp-2 hover:text-primary transition-colors">
                      <Link to={`/books/${story.id}`}>
                        {story.title}
                      </Link>
                    </CardTitle>
                    
                    <div className="flex items-center gap-2 mt-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={story.profiles?.avatar_url} />
                        <AvatarFallback>{story.profiles?.full_name?.[0] || 'A'}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{story.profiles?.full_name || 'Unknown Author'}</p>
                        <p className="text-xs text-muted-foreground">
                          Updated {new Date(story.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <CardDescription className="line-clamp-2">
                      {story.description || 'An intriguing story that unfolds chapter by chapter.'}
                    </CardDescription>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">
                          {story.chaptersPublished} / {story.total_chapters || 0} chapters
                        </span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>

                  <div className="flex items-center justify-between text-sm text-muted-foreground pt-2 border-t">
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      <span>{story.views.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="h-4 w-4" />
                      <span>{story.followers.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      <span>{story.chaptersPublished} ch</span>
                    </div>
                  </div>

                    <Button variant="outline" className="w-full" asChild>
                      <Link to={`/books/${story.id}`}>
                        Start Reading
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
};

export default Drafts;
