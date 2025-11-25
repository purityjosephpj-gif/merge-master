-- Create storage bucket for founder images
INSERT INTO storage.buckets (id, name, public)
VALUES ('founder-images', 'founder-images', true);

-- Create founders table
CREATE TABLE public.founders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  bio TEXT,
  image_url TEXT,
  linkedin_url TEXT,
  twitter_url TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.founders ENABLE ROW LEVEL SECURITY;

-- RLS Policies for founders
CREATE POLICY "Founders are viewable by everyone"
ON public.founders
FOR SELECT
USING (true);

CREATE POLICY "Only admins can insert founders"
ON public.founders
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update founders"
ON public.founders
FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete founders"
ON public.founders
FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- Create trigger for updated_at
CREATE TRIGGER update_founders_updated_at
BEFORE UPDATE ON public.founders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Storage policies for founder images
CREATE POLICY "Founder images are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'founder-images');

CREATE POLICY "Admins can upload founder images"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'founder-images' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update founder images"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'founder-images' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete founder images"
ON storage.objects
FOR DELETE
USING (bucket_id = 'founder-images' AND has_role(auth.uid(), 'admin'));