import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, TrendingUp, Users, DollarSign, Plus, Edit, Eye } from "lucide-react";

const WriterDashboard = () => {
  const stats = [
    { label: "Total Books", value: "5", icon: BookOpen, change: "+1 this month" },
    { label: "Total Readers", value: "12.5K", icon: Users, change: "+2.3K this month" },
    { label: "Monthly Views", value: "45.2K", icon: Eye, change: "+12% from last month" },
    { label: "Earnings", value: "$1,234", icon: DollarSign, change: "+$234 this month" }
  ];

  const myBooks = [
    { id: 1, title: "The Last Symphony", status: "Published", chapters: 24, views: "15.2K", earnings: "$456" },
    { id: 2, title: "Digital Dreams", status: "Published", chapters: 18, views: "8.9K", earnings: "$289" },
    { id: 3, title: "Echoes of Tomorrow", status: "Draft", chapters: "12/20", views: "3.4K", earnings: "$0" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Header */}
      <section className="bg-gradient-to-br from-writer-amber/10 via-background to-primary/10 py-8 border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Writer Dashboard</h1>
              <p className="text-muted-foreground">Manage your books and track your success</p>
            </div>
            <Button size="lg" className="bg-gradient-to-r from-primary to-writer-amber">
              <Plus className="h-5 w-5 mr-2" />
              New Book
            </Button>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardDescription>{stat.label}</CardDescription>
                <stat.icon className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.change}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <Tabs defaultValue="books" className="space-y-6">
          <TabsList>
            <TabsTrigger value="books">My Books</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="earnings">Earnings</TabsTrigger>
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
          </TabsList>

          <TabsContent value="books" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Your Books</CardTitle>
                <CardDescription>Manage your published and draft books</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {myBooks.map((book) => (
                    <div
                      key={book.id}
                      className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-16 bg-primary/10 rounded flex items-center justify-center">
                          <BookOpen className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{book.title}</h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <span>{book.chapters} chapters</span>
                            <span>•</span>
                            <span>{book.views} views</span>
                            <span>•</span>
                            <span className="text-primary font-medium">{book.earnings}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Analytics Overview</CardTitle>
                <CardDescription>Track your performance and reader engagement</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                  Analytics charts and graphs will be displayed here
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="earnings">
            <Card>
              <CardHeader>
                <CardTitle>Earnings Report</CardTitle>
                <CardDescription>View your earnings history and payment details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                  Earnings breakdown and payment history will be displayed here
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="feedback">
            <Card>
              <CardHeader>
                <CardTitle>Reader Feedback</CardTitle>
                <CardDescription>Comments and reviews from your readers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                  Comments and feedback will be displayed here
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

export default WriterDashboard;
