import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, TrendingUp, Plus, Eye, Heart } from "lucide-react";
import { Link } from "react-router-dom";

const TalkZone = () => {
  const categories = [
    { name: "General Discussion", count: 234, color: "bg-primary" },
    { name: "Writing Help", count: 156, color: "bg-writer-amber" },
    { name: "Book Recommendations", count: 189, color: "bg-reader-blue" },
    { name: "Author Q&A", count: 98, color: "bg-accent" },
    { name: "Industry News", count: 67, color: "bg-primary" }
  ];

  const trendingTopics = [
    {
      id: 1,
      title: "What are your favorite books of 2024?",
      author: {
        name: "Sarah M.",
        avatar: "https://i.pravatar.cc/150?img=1"
      },
      category: "General Discussion",
      replies: 45,
      views: 892,
      likes: 23,
      lastActivity: "2 hours ago"
    },
    {
      id: 2,
      title: "Tips for overcoming writer's block?",
      author: {
        name: "James T.",
        avatar: "https://i.pravatar.cc/150?img=2"
      },
      category: "Writing Help",
      replies: 32,
      views: 567,
      likes: 18,
      lastActivity: "4 hours ago"
    },
    {
      id: 3,
      title: "How do you build tension in mystery novels?",
      author: {
        name: "Emma R.",
        avatar: "https://i.pravatar.cc/150?img=3"
      },
      category: "Writing Help",
      replies: 28,
      views: 453,
      likes: 15,
      lastActivity: "6 hours ago"
    },
    {
      id: 4,
      title: "Best platforms for book marketing?",
      author: {
        name: "David L.",
        avatar: "https://i.pravatar.cc/150?img=4"
      },
      category: "Industry News",
      replies: 41,
      views: 789,
      likes: 31,
      lastActivity: "8 hours ago"
    }
  ];

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
              {trendingTopics.map((topic) => (
                <Card key={topic.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <Link to={`/talk-zone/${topic.id}`}>
                    <CardHeader>
                      <div className="flex items-start gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={topic.author.avatar} />
                          <AvatarFallback>{topic.author.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary">{topic.category}</Badge>
                            <span className="text-sm text-muted-foreground">
                              Posted by {topic.author.name}
                            </span>
                          </div>
                          <CardTitle className="text-xl hover:text-primary transition-colors line-clamp-2">
                            {topic.title}
                          </CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MessageCircle className="h-4 w-4" />
                            <span>{topic.replies} replies</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            <span>{topic.views} views</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Heart className="h-4 w-4" />
                            <span>{topic.likes} likes</span>
                          </div>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          Last activity {topic.lastActivity}
                        </span>
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </div>

            {/* Load More */}
            <div className="text-center pt-4">
              <Button size="lg" variant="outline">
                Load More Discussions
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default TalkZone;
