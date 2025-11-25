import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { BookOpen, Plus, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

interface Chapter {
  id: string;
  chapter_number: number;
  title: string;
  content: string;
  is_free: boolean;
}

interface ManageChaptersDialogProps {
  bookId: string;
  bookTitle: string;
}

const ManageChaptersDialog = ({ bookId, bookTitle }: ManageChaptersDialogProps) => {
  const [open, setOpen] = useState(false);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    chapter_number: "",
    is_free: false,
  });

  useEffect(() => {
    if (open) {
      fetchChapters();
    }
  }, [open, bookId]);

  const fetchChapters = async () => {
    const { data } = await supabase
      .from("chapters")
      .select("*")
      .eq("book_id", bookId)
      .order("chapter_number");

    if (data) {
      setChapters(data);
      const nextChapter = data.length + 1;
      setFormData(prev => ({ ...prev, chapter_number: nextChapter.toString() }));
    }
  };

  const handleAddChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from("chapters").insert({
      book_id: bookId,
      chapter_number: parseInt(formData.chapter_number),
      title: formData.title,
      content: formData.content,
      is_free: formData.is_free,
    });

    setLoading(false);

    if (error) {
      toast.error("Failed to add chapter");
      return;
    }

    toast.success("Chapter added successfully!");
    setFormData({
      title: "",
      content: "",
      chapter_number: (parseInt(formData.chapter_number) + 1).toString(),
      is_free: false,
    });
    setShowAddForm(false);
    fetchChapters();
  };

  const handleDeleteChapter = async (chapterId: string) => {
    if (!confirm("Are you sure you want to delete this chapter?")) return;

    const { error } = await supabase
      .from("chapters")
      .delete()
      .eq("id", chapterId);

    if (error) {
      toast.error("Failed to delete chapter");
      return;
    }

    toast.success("Chapter deleted");
    fetchChapters();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <BookOpen className="h-4 w-4 mr-2" />
          Manage Chapters
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Chapters - {bookTitle}</DialogTitle>
          <DialogDescription>
            Add, edit, or remove chapters from your book
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!showAddForm && (
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add New Chapter
            </Button>
          )}

          {showAddForm && (
            <Card>
              <CardContent className="pt-6">
                <form onSubmit={handleAddChapter} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="chapter_number">Chapter Number</Label>
                      <Input
                        id="chapter_number"
                        type="number"
                        min="1"
                        value={formData.chapter_number}
                        onChange={(e) =>
                          setFormData({ ...formData, chapter_number: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        id="is_free"
                        checked={formData.is_free}
                        onCheckedChange={(checked) =>
                          setFormData({ ...formData, is_free: checked })
                        }
                      />
                      <Label htmlFor="is_free">Free Chapter</Label>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="title">Chapter Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      required
                      maxLength={200}
                    />
                  </div>

                  <div>
                    <Label htmlFor="content">Chapter Content</Label>
                    <Textarea
                      id="content"
                      value={formData.content}
                      onChange={(e) =>
                        setFormData({ ...formData, content: e.target.value })
                      }
                      rows={10}
                      required
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowAddForm(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? "Adding..." : "Add Chapter"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <div className="space-y-2">
            <h3 className="font-semibold">Existing Chapters ({chapters.length})</h3>
            {chapters.length === 0 ? (
              <p className="text-muted-foreground text-sm">No chapters yet</p>
            ) : (
              chapters.map((chapter) => (
                <Card key={chapter.id}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">
                          Chapter {chapter.chapter_number}: {chapter.title}
                        </span>
                        {chapter.is_free && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                            Free
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate max-w-2xl">
                        {chapter.content.substring(0, 100)}...
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteChapter(chapter.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ManageChaptersDialog;