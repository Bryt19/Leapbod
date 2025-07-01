-- Remove image-related storage policies
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own images" ON storage.objects;

-- Remove images bucket
DELETE FROM storage.buckets WHERE id = 'images';

-- Remove image_urls column from opportunities table
ALTER TABLE opportunities DROP COLUMN IF EXISTS image_urls; 