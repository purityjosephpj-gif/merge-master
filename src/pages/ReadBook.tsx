import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ChevronLeft,
  ChevronRight,
  Bookmark,
  BookmarkCheck,
  Menu,
  X,
} from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { cn } from "@/lib/utils";

interface Chapter {
  id: string;
  chapter_number: number;
  title: string;
  content: string;
  is_free: boolean;
}

const ReadBook = () => {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [bookTitle, setBookTitle] = useState("");
  const [freeChaptersCount, setFreeChaptersCount] = useState(5);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const [showChapterList, setShowChapterList] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !bookId) {
      navigate("/auth");
      return;
    }

    fetchBookData();
    fetchBookmarks();
  }, [bookId, user]);

  const fetchBookData = async () => {
    // Fetch book info
    const { data: bookData } = await supabase
      .from("books")
      .select("title, free_chapters")
      .eq("id", bookId)
      .single();

    if (bookData) {
      setBookTitle(bookData.title);
      setFreeChaptersCount(bookData.free_chapters || 5);
    }

    // Check if user purchased the book
    const { data: purchaseData } = await supabase
      .from("book_purchases")
      .select("id")
      .eq("book_id", bookId)
      .eq("user_id", user!.id)
      .maybeSingle();

    setHasPurchased(!!purchaseData);

    // Fetch chapters
    const { data: chaptersData } = await supabase
      .from("chapters")
      .select("*")
      .eq("book_id", bookId)
      .order("chapter_number");

    if (chaptersData) {
      setChapters(chaptersData);
    }

    setLoading(false);
  };

  const fetchBookmarks = async () => {
    const { data } = await supabase
      .from("bookmarks")
      .select("chapter_id")
      .eq("book_id", bookId)
      .eq("user_id", user!.id);

    if (data) {
      setBookmarks(new Set(data.map((b) => b.chapter_id)));
    }
  };

  const updateProgress = async (chapterId: string, chapterNumber: number) => {
    const progressPercentage = Math.round(
      (chapterNumber / chapters.length) * 100
    );

    await supabase.from("reading_progress").upsert(
      {
        user_id: user!.id,
        book_id: bookId!,
        chapter_id: chapterId,
        progress_percentage: progressPercentage,
        last_read_at: new Date().toISOString(),
      },
      { onConflict: "user_id,book_id" }
    );
  };

  const toggleBookmark = async (chapterId: string) => {
    const isBookmarked = bookmarks.has(chapterId);

    if (isBookmarked) {
      const { error } = await supabase
        .from("bookmarks")
        .delete()
        .eq("chapter_id", chapterId)
        .eq("user_id", user!.id);

      if (!error) {
        setBookmarks((prev) => {
          const newSet = new Set(prev);
          newSet.delete(chapterId);
          return newSet;
        });
        toast.success("Bookmark removed");
      }
    } else {
      const { error } = await supabase.from("bookmarks").insert({
        user_id: user!.id,
        book_id: bookId!,
        chapter_id: chapterId,
      });

      if (!error) {
        setBookmarks((prev) => new Set(prev).add(chapterId));
        toast.success("Bookmark added");
      }
    }
  };

  const isChapterFree = (chapterNumber: number) => {
    return chapterNumber <= freeChaptersCount;
  };

  const navigateChapter = (direction: "prev" | "next") => {
    const newIndex =
      direction === "prev" ? currentChapterIndex - 1 : currentChapterIndex + 1;

    if (newIndex >= 0 && newIndex < chapters.length) {
      const chapter = chapters[newIndex];
      if (!isChapterFree(chapter.chapter_number) && !hasPurchased) {
        toast.error("Please purchase the book to read this chapter");
        return;
      }

      setCurrentChapterIndex(newIndex);
      updateProgress(chapter.id, chapter.chapter_number);
    }
  };

  const goToChapter = (index: number) => {
    const chapter = chapters[index];
    if (!isChapterFree(chapter.chapter_number) && !hasPurchased) {
      toast.error("Please purchase the book to read this chapter");
      return;
    }

    setCurrentChapterIndex(index);
    updateProgress(chapter.id, chapter.chapter_number);
    setShowChapterList(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  if (chapters.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">No chapters available</div>
        </div>
      </div>
    );
  }

  const currentChapter = chapters[currentChapterIndex];
  const canRead = isChapterFree(currentChapter.chapter_number) || hasPurchased;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => navigate(`/books/${bookId}`)}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Book
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowChapterList(!showChapterList)}
            >
              {showChapterList ? (
                <X className="h-4 w-4" />
              ) : (
                <Menu className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => toggleBookmark(currentChapter.id)}
              disabled={!canRead}
            >
              {bookmarks.has(currentChapter.id) ? (
                <BookmarkCheck className="h-4 w-4" />
              ) : (
                <Bookmark className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Chapter List Sidebar */}
        {showChapterList && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">{bookTitle} - Chapters</h3>
              <div className="space-y-1 max-h-[400px] overflow-y-auto">
                {chapters.map((chapter, index) => (
                  <button
                    key={chapter.id}
                    onClick={() => goToChapter(index)}
                    disabled={!isChapterFree(chapter.chapter_number) && !hasPurchased}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-md text-sm transition-colors",
                      index === currentChapterIndex
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted",
                      !isChapterFree(chapter.chapter_number) && !hasPurchased && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span>
                        {chapter.chapter_number}. {chapter.title}{" "}
                        {!isChapterFree(chapter.chapter_number) && !hasPurchased && "🔒"}
                      </span>
                      {bookmarks.has(chapter.id) && (
                        <BookmarkCheck className="h-4 w-4" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Reading Area */}
        <Card>
          <CardContent className="p-8">
            <div className="mb-6">
              <div className="text-sm text-muted-foreground mb-2">
                Chapter {currentChapter.chapter_number} of {chapters.length}
              </div>
              <h1 className="text-3xl font-bold mb-4">{currentChapter.title}</h1>
              <Separator />
            </div>

            {canRead ? (
              <div className="prose prose-lg max-w-none">
                <div className="whitespace-pre-wrap leading-relaxed">
                  {currentChapter.content}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  This chapter is locked. Purchase the book to continue reading.
                </p>
                <Button onClick={() => navigate(`/books/${bookId}`)}>
                  Purchase Book
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        {canRead && (
          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={() => navigateChapter("prev")}
              disabled={currentChapterIndex === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous Chapter
            </Button>

            <div className="text-sm text-muted-foreground self-center">
              {currentChapterIndex + 1} / {chapters.length}
            </div>

            <Button
              variant="outline"
              onClick={() => navigateChapter("next")}
              disabled={currentChapterIndex === chapters.length - 1}
            >
              Next Chapter
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReadBook;