-- Create blog_posts table
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  cover_image_url TEXT,
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  read_time INTEGER DEFAULT 5,
  published_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for blog_posts
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Blog posts are viewable by everyone
CREATE POLICY "Blog posts are viewable by everyone"
  ON public.blog_posts
  FOR SELECT
  USING (true);

-- Only admins can insert blog posts
CREATE POLICY "Only admins can insert blog posts"
  ON public.blog_posts
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can update blog posts
CREATE POLICY "Only admins can update blog posts"
  ON public.blog_posts
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can delete blog posts
CREATE POLICY "Only admins can delete blog posts"
  ON public.blog_posts
  FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create discussion_categories table
CREATE TABLE IF NOT EXISTS public.discussion_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT DEFAULT 'bg-primary',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for discussion_categories
ALTER TABLE public.discussion_categories ENABLE ROW LEVEL SECURITY;

-- Categories are viewable by everyone
CREATE POLICY "Categories are viewable by everyone"
  ON public.discussion_categories
  FOR SELECT
  USING (true);

-- Only admins can manage categories
CREATE POLICY "Only admins can insert categories"
  ON public.discussion_categories
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can update categories"
  ON public.discussion_categories
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can delete categories"
  ON public.discussion_categories
  FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create discussions table
CREATE TABLE IF NOT EXISTS public.discussions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES public.discussion_categories(id) ON DELETE SET NULL,
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for discussions
ALTER TABLE public.discussions ENABLE ROW LEVEL SECURITY;

-- Discussions are viewable by everyone
CREATE POLICY "Discussions are viewable by everyone"
  ON public.discussions
  FOR SELECT
  USING (true);

-- Authenticated users can create discussions
CREATE POLICY "Authenticated users can create discussions"
  ON public.discussions
  FOR INSERT
  WITH CHECK (auth.uid() = author_id);

-- Users can update their own discussions
CREATE POLICY "Users can update their own discussions"
  ON public.discussions
  FOR UPDATE
  USING (auth.uid() = author_id OR has_role(auth.uid(), 'admin'::app_role));

-- Users can delete their own discussions
CREATE POLICY "Users can delete their own discussions"
  ON public.discussions
  FOR DELETE
  USING (auth.uid() = author_id OR has_role(auth.uid(), 'admin'::app_role));

-- Create discussion_replies table
CREATE TABLE IF NOT EXISTS public.discussion_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  discussion_id UUID REFERENCES public.discussions(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for discussion_replies
ALTER TABLE public.discussion_replies ENABLE ROW LEVEL SECURITY;

-- Replies are viewable by everyone
CREATE POLICY "Replies are viewable by everyone"
  ON public.discussion_replies
  FOR SELECT
  USING (true);

-- Authenticated users can create replies
CREATE POLICY "Authenticated users can create replies"
  ON public.discussion_replies
  FOR INSERT
  WITH CHECK (auth.uid() = author_id);

-- Users can update their own replies
CREATE POLICY "Users can update their own replies"
  ON public.discussion_replies
  FOR UPDATE
  USING (auth.uid() = author_id OR has_role(auth.uid(), 'admin'::app_role));

-- Users can delete their own replies
CREATE POLICY "Users can delete their own replies"
  ON public.discussion_replies
  FOR DELETE
  USING (auth.uid() = author_id OR has_role(auth.uid(), 'admin'::app_role));

-- Create triggers for updated_at columns
CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_discussions_updated_at
  BEFORE UPDATE ON public.discussions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_discussion_replies_updated_at
  BEFORE UPDATE ON public.discussion_replies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default discussion categories
INSERT INTO public.discussion_categories (name, description, color) VALUES
  ('General Discussion', 'General topics and conversations', 'bg-primary'),
  ('Writing Help', 'Get help with your writing', 'bg-writer-amber'),
  ('Book Recommendations', 'Share and discover great books', 'bg-reader-blue'),
  ('Author Q&A', 'Ask questions to authors', 'bg-accent'),
  ('Industry News', 'Latest news in publishing', 'bg-primary')
ON CONFLICT (name) DO NOTHING;