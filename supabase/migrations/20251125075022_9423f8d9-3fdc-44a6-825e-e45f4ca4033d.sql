-- Add reading_progress table for tracking reader progress
CREATE TABLE public.reading_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  chapter_id UUID NOT NULL REFERENCES public.chapters(id) ON DELETE CASCADE,
  progress_percentage INTEGER NOT NULL DEFAULT 0,
  last_read_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, book_id)
);

-- Add bookmarks table
CREATE TABLE public.bookmarks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  chapter_id UUID NOT NULL REFERENCES public.chapters(id) ON DELETE CASCADE,
  position TEXT,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.reading_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for reading_progress
CREATE POLICY "Users can view their own progress"
ON public.reading_progress
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own progress"
ON public.reading_progress
FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own progress"
ON public.reading_progress
FOR UPDATE
USING (user_id = auth.uid());

-- RLS Policies for bookmarks
CREATE POLICY "Users can view their own bookmarks"
ON public.bookmarks
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own bookmarks"
ON public.bookmarks
FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own bookmarks"
ON public.bookmarks
FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own bookmarks"
ON public.bookmarks
FOR DELETE
USING (user_id = auth.uid());

-- Add indexes for performance
CREATE INDEX idx_reading_progress_user_book ON public.reading_progress(user_id, book_id);
CREATE INDEX idx_bookmarks_user_book ON public.bookmarks(user_id, book_id);