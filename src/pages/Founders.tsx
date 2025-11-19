import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Quote } from "lucide-react";

const Founders = () => {
  const founders = [
    {
      name: "You",
      role: "Co-Founder & CEO",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop",
      bio: "Passionate about connecting writers with readers and building a platform that empowers creative storytelling. With a background in technology and literature, I envisioned a space where stories can thrive.",
      quote: "Every writer deserves a platform, and every reader deserves access to great stories."
    },
    {
      name: "Werukha",
      role: "Co-Founder & CTO",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
      bio: "Bringing technical expertise and a love for innovation to make StoryConnect the best platform for writers and readers. Dedicated to creating seamless user experiences and robust infrastructure.",
      quote: "Technology should serve creativity, not limit it. We're building the future of publishing."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-accent/10 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">Meet the Founders</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Two passionate individuals united by a vision to revolutionize how stories are shared and discovered
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="container mx-auto px-4 py-16">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl">Our Story</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-lg max-w-none">
            <p className="text-muted-foreground leading-relaxed">
              StoryConnect was born from a simple belief: every writer deserves a chance to share their story, and every reader deserves access to diverse, authentic voices. We noticed that traditional publishing often creates barriers between talented writers and eager readers.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Together, we set out to build a platform that democratizes publishing, making it easy for writers to share their work and for readers to discover new favorites. Our mission is to create a thriving community where stories connect people across the globe.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Founders Profiles */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {founders.map((founder) => (
            <Card key={founder.name} className="overflow-hidden">
              <div className="aspect-square overflow-hidden">
                <img
                  src={founder.image}
                  alt={founder.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardHeader>
                <CardTitle className="text-2xl">{founder.name}</CardTitle>
                <CardDescription className="text-lg">{founder.role}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  {founder.bio}
                </p>
                <div className="relative pl-6 border-l-4 border-primary py-2">
                  <Quote className="absolute -left-3 -top-2 h-6 w-6 text-primary opacity-50" />
                  <p className="italic text-foreground font-medium">
                    "{founder.quote}"
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Our Mission</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  To empower writers worldwide by providing them with the tools, platform, and community they need to share their stories. We believe in making publishing accessible, transparent, and rewarding for creators while connecting readers with authentic, diverse voices.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Our Vision</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  To become the world's most beloved platform for independent writers and readers. We envision a future where anyone with a story can find their audience, where readers discover their next favorite book, and where a global community celebrates the art of storytelling.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Creativity First",
                description: "We put writers and their creative vision at the heart of everything we do."
              },
              {
                title: "Community Driven",
                description: "Building a supportive space where writers and readers connect and grow together."
              },
              {
                title: "Transparency",
                description: "Clear pricing, fair royalties, and honest communication with our community."
              },
              {
                title: "Innovation",
                description: "Constantly improving our platform with the latest technology and user feedback."
              },
              {
                title: "Accessibility",
                description: "Making quality storytelling available to everyone, everywhere."
              },
              {
                title: "Integrity",
                description: "Operating with honesty, respect, and ethical standards in all we do."
              }
            ].map((value) => (
              <Card key={value.title}>
                <CardHeader>
                  <CardTitle className="text-lg">{value.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Founders;
