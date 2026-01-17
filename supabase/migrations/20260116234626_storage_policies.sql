-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('meal-photos', 'meal-photos', false, 5242880, ARRAY['image/jpeg', 'image/png']),
  ('nutrition-plans', 'nutrition-plans', false, 10485760, ARRAY['application/pdf', 'image/jpeg', 'image/png', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
ON CONFLICT (id) DO NOTHING;

-- Storage RLS policies for meal-photos bucket
CREATE POLICY "Users can upload own meal photos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'meal-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view own meal photos" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'meal-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update own meal photos" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'meal-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own meal photos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'meal-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage RLS policies for nutrition-plans bucket
CREATE POLICY "Users can upload own nutrition plans" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'nutrition-plans' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view own nutrition plans" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'nutrition-plans' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update own nutrition plans" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'nutrition-plans' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own nutrition plans" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'nutrition-plans' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
