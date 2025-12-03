import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Wand2, Lightbulb, Copy, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const WritingAssistant = () => {
  const [content, setContent] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("assist");

  const sendToAI = async (type: string) => {
    if (!content.trim()) {
      toast.error("Please enter some content first");
      return;
    }

    setLoading(true);
    setResponse("");

    try {
      const { data, error } = await supabase.functions.invoke("chat-assistant", {
        body: { prompt: content, type },
      });

      if (error) throw error;
      setResponse(data.response);
    } catch (error) {
      console.error("AI error:", error);
      toast.error("Failed to get AI response. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(response);
    toast.success("Copied to clipboard!");
  };

  const insertResponse = () => {
    setContent((prev) => prev + "\n\n" + response);
    setResponse("");
    toast.success("Inserted into your content!");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          AI Writing Assistant
        </CardTitle>
        <CardDescription>
          Let AI help you with your creative writing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="assist">
              <Sparkles className="h-4 w-4 mr-2" />
              Assist
            </TabsTrigger>
            <TabsTrigger value="continue">
              <Wand2 className="h-4 w-4 mr-2" />
              Continue
            </TabsTrigger>
            <TabsTrigger value="ideas">
              <Lightbulb className="h-4 w-4 mr-2" />
              Ideas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="assist" className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Get help with your writing - ask questions, get feedback, or request improvements.
            </p>
          </TabsContent>

          <TabsContent value="continue" className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Paste your story and let AI continue it naturally.
            </p>
          </TabsContent>

          <TabsContent value="ideas" className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Get creative plot ideas and story directions based on your content.
            </p>
          </TabsContent>
        </Tabs>

        <div className="space-y-2">
          <label className="text-sm font-medium">Your Content</label>
          <Textarea
            placeholder="Enter your story content, question, or context here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            className="resize-none"
          />
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => sendToAI(activeTab)}
            disabled={loading || !content.trim()}
            className="flex-1"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                {activeTab === "assist" && "Get Help"}
                {activeTab === "continue" && "Continue Story"}
                {activeTab === "ideas" && "Generate Ideas"}
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => sendToAI("improve")}
            disabled={loading || !content.trim()}
          >
            <Wand2 className="h-4 w-4 mr-2" />
            Improve
          </Button>
        </div>

        {response && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">AI Response</label>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={copyToClipboard}>
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </Button>
                <Button variant="outline" size="sm" onClick={insertResponse}>
                  Insert
                </Button>
              </div>
            </div>
            <div className="bg-muted/50 p-4 rounded-lg border">
              <p className="whitespace-pre-wrap text-sm">{response}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
