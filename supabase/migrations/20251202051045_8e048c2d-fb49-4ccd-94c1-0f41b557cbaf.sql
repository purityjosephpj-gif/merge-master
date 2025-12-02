-- Update books table to have 5 free chapters by default
ALTER TABLE public.books 
ALTER COLUMN free_chapters SET DEFAULT 5;

-- Create storage bucket for profile images
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-images', 'profile-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for profile images
CREATE POLICY "Profile images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-images');

CREATE POLICY "Users can upload their own profile image"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'profile-images' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own profile image"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'profile-images' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own profile image"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'profile-images' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Add writer approval status to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS writer_approved BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS writer_requested_at TIMESTAMP WITH TIME ZONE;

-- Create notifications table for admin alerts
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB
);

-- Enable RLS on notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Notifications policies
CREATE POLICY "Users can view their own notifications"
ON public.notifications FOR SELECT
USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'));

CREATE POLICY "System can create notifications"
ON public.notifications FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can update their own notifications"
ON public.notifications FOR UPDATE
USING (user_id = auth.uid());

-- Function to notify admins when a writer registers
CREATE OR REPLACE FUNCTION public.notify_admin_writer_request()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Only trigger if writer role was just added
  IF NEW.role = 'writer' THEN
    -- Create notification for all admins
    FOR admin_user_id IN 
      SELECT user_id FROM user_roles WHERE role = 'admin'
    LOOP
      INSERT INTO notifications (user_id, type, title, message, metadata)
      VALUES (
        admin_user_id,
        'writer_approval',
        'New Writer Registration',
        'A new user has requested writer access and needs approval.',
        jsonb_build_object('writer_user_id', NEW.user_id)
      );
    END LOOP;
    
    -- Update profile to mark request
    UPDATE profiles 
    SET writer_requested_at = now()
    WHERE id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for writer registration notifications
DROP TRIGGER IF EXISTS on_writer_role_added ON user_roles;
CREATE TRIGGER on_writer_role_added
  AFTER INSERT ON user_roles
  FOR EACH ROW
  EXECUTE FUNCTION notify_admin_writer_request();