-- Create book_views table for tracking real-time book views
CREATE TABLE IF NOT EXISTS public.book_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  session_id TEXT,
  ip_address TEXT
);

-- Create index for faster queries
CREATE INDEX idx_book_views_book_id ON public.book_views(book_id);
CREATE INDEX idx_book_views_viewed_at ON public.book_views(viewed_at);

-- Enable RLS
ALTER TABLE public.book_views ENABLE ROW LEVEL SECURITY;

-- Anyone can view book views (for analytics)
CREATE POLICY "Book views are viewable by everyone"
  ON public.book_views
  FOR SELECT
  USING (true);

-- Anyone can track a view
CREATE POLICY "Anyone can track book views"
  ON public.book_views
  FOR INSERT
  WITH CHECK (true);

-- Add a function to get view count for a book
CREATE OR REPLACE FUNCTION get_book_view_count(book_id_param UUID)
RETURNS BIGINT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::BIGINT
  FROM public.book_views
  WHERE book_id = book_id_param;
$$;