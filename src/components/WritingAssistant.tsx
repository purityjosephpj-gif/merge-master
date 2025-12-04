import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Wand2, Lightbulb, Copy, Loader2, RefreshCw, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const WritingAssistant = () => {
  const [content, setContent] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("assist");
  const [copied, setCopied] = useState(false);

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

      if (error) {
        console.error("AI function error:", error);
        throw new Error(error.message || "Failed to connect to AI assistant");
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      if (data?.response) {
        setResponse(data.response);
        toast.success("AI response generated!");
      } else {
        throw new Error("No response received from AI");
      }
    } catch (error) {
      console.error("AI error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to get AI response";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(response);
      setCopied(true);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const insertResponse = () => {
    setContent((prev) => prev + "\n\n" + response);
    setResponse("");
    toast.success("Inserted into your content!");
  };

  const clearAll = () => {
    setContent("");
    setResponse("");
  };

  return (
    <Card className="border-primary/20">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-writer-amber/5 rounded-t-lg">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          AI Writing Assistant
        </CardTitle>
        <CardDescription>
          Let AI help you with your creative writing - continue stories, improve prose, or generate ideas
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="assist" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Assist
            </TabsTrigger>
            <TabsTrigger value="continue" className="flex items-center gap-2">
              <Wand2 className="h-4 w-4" />
              Continue
            </TabsTrigger>
            <TabsTrigger value="ideas" className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Ideas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="assist" className="mt-4">
            <div className="bg-muted/30 p-4 rounded-lg border">
              <p className="text-sm text-muted-foreground">
                <strong>Writing Help:</strong> Get assistance with your writing - ask questions about plot, characters, 
                pacing, or request specific feedback on your prose. The AI will provide constructive suggestions.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="continue" className="mt-4">
            <div className="bg-muted/30 p-4 rounded-lg border">
              <p className="text-sm text-muted-foreground">
                <strong>Story Continuation:</strong> Paste your story excerpt and let AI naturally continue 
                the narrative while matching your tone and style. Great for overcoming writer's block!
              </p>
            </div>
          </TabsContent>

          <TabsContent value="ideas" className="mt-4">
            <div className="bg-muted/30 p-4 rounded-lg border">
              <p className="text-sm text-muted-foreground">
                <strong>Creative Ideas:</strong> Share your story context and get 3-5 creative plot ideas, 
                character arcs, or story directions to inspire your writing.
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Your Content</label>
            {content && (
              <Button variant="ghost" size="sm" onClick={clearAll} className="h-7 text-xs">
                <RefreshCw className="h-3 w-3 mr-1" />
                Clear
              </Button>
            )}
          </div>
          <Textarea
            placeholder={
              activeTab === "assist" 
                ? "Enter your question or paste text you'd like help with..."
                : activeTab === "continue"
                ? "Paste your story excerpt here and I'll continue it..."
                : "Share your story context to get creative ideas..."
            }
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={10}
            className="resize-none font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground text-right">
            {content.length} characters
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => sendToAI(activeTab)}
            disabled={loading || !content.trim()}
            className="flex-1 bg-gradient-to-r from-primary to-writer-amber hover:opacity-90"
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
            title="Improve your text"
          >
            <Wand2 className="h-4 w-4 mr-2" />
            Improve
          </Button>
        </div>

        {response && (
          <div className="space-y-2 animate-in fade-in-50 duration-300">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                AI Response
              </label>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={copyToClipboard} className="h-8">
                  {copied ? (
                    <Check className="h-4 w-4 mr-1 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4 mr-1" />
                  )}
                  {copied ? "Copied!" : "Copy"}
                </Button>
                <Button variant="outline" size="sm" onClick={insertResponse} className="h-8">
                  Insert Below
                </Button>
              </div>
            </div>
            <div className="bg-gradient-to-br from-primary/5 to-writer-amber/5 p-4 rounded-lg border border-primary/20">
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{response}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
