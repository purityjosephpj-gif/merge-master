import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Eye, Heart } from "lucide-react";
import { Link } from "react-router-dom";

const Drafts = () => {
  const draftStories = Array.from({ length: 9 }, (_, i) => ({
    id: i + 1,
    title: [
      "Echoes of Tomorrow",
      "The Hidden Garden",
      "Shadows of the Past",
      "Crimson Sunset",
      "The Lost Library",
      "Midnight Tales",
      "River of Dreams",
      "The Silent Observer",
      "Beyond the Stars"
    ][i],
    author: {
      name: [
        "Lisa Wang",
        "Marcus Johnson",
        "Nina Patel",
        "Alex Rivera",
        "Sophie Turner",
        "Ryan Lee",
        "Maya Singh",
        "Tom Anderson",
        "Emily Chen"
      ][i],
      avatar: `https://i.pravatar.cc/150?img=${i + 1}`
    },
    genre: ["Sci-Fi", "Fantasy", "Mystery", "Romance", "Thriller", "Adventure"][i % 6],
    chaptersPublished: Math.floor(8 + Math.random() * 15),
    totalChapters: Math.floor(20 + Math.random() * 15),
    followers: Math.floor(500 + Math.random() * 2000),
    views: Math.floor(5000 + Math.random() * 15000),
    lastUpdate: `${Math.floor(1 + Math.random() * 7)} days ago`,
    synopsis: "An intriguing story that unfolds chapter by chapter. Follow along as the author crafts this tale in real-time, and be part of the creative journey."
  }));

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {draftStories.map((story) => {
            const progress = (story.chaptersPublished / story.totalChapters) * 100;
            
            return (
              <Card key={story.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="secondary">{story.genre}</Badge>
                    <Badge className="bg-writer-amber/20 text-writer-amber hover:bg-writer-amber/30">
                      In Progress
                    </Badge>
                  </div>
                  <CardTitle className="text-xl line-clamp-2 hover:text-primary transition-colors">
                    <Link to={`/drafts/${story.id}`}>
                      {story.title}
                    </Link>
                  </CardTitle>
                  
                  <div className="flex items-center gap-2 mt-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={story.author.avatar} />
                      <AvatarFallback>{story.author.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{story.author.name}</p>
                      <p className="text-xs text-muted-foreground">Updated {story.lastUpdate}</p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <CardDescription className="line-clamp-2">
                    {story.synopsis}
                  </CardDescription>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">
                        {story.chaptersPublished} / {story.totalChapters} chapters
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
                    <Link to={`/drafts/${story.id}`}>
                      Start Reading
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Load More */}
        <div className="mt-12 text-center">
          <Button size="lg" variant="outline">
            Load More Stories
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Drafts;
