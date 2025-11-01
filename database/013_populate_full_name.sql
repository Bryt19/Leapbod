-- Migration to populate full_name from auth.users metadata
-- This will work for both new profiles and existing ones

-- Function to extract and populate full_name from auth.users metadata
CREATE OR REPLACE FUNCTION sync_profile_full_name()
RETURNS TRIGGER AS $$
DECLARE
  user_metadata JSONB;
  user_full_name TEXT;
BEGIN
  -- Get the user's metadata from auth.users
  SELECT raw_user_meta_data
  INTO user_metadata
  FROM auth.users 
  WHERE id = NEW.id;
  
  -- Extract full_name from metadata
  -- Google OAuth provides 'full_name' or 'name' in raw_user_meta_data
  -- Check multiple possible locations
  IF user_metadata IS NOT NULL THEN
    user_full_name := COALESCE(
      user_metadata->>'full_name',
      user_metadata->>'name',
      CASE 
        WHEN user_metadata->>'given_name' IS NOT NULL AND user_metadata->>'family_name' IS NOT NULL
        THEN (user_metadata->>'given_name') || ' ' || (user_metadata->>'family_name')
        ELSE NULL
      END
    );
  END IF;
  
  -- If full_name is not set in profile but available in metadata, update it
  IF (NEW.full_name IS NULL OR NEW.full_name = '') AND user_full_name IS NOT NULL AND user_full_name != '' THEN
    NEW.full_name := user_full_name;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to run before insert or update on profiles
DROP TRIGGER IF EXISTS sync_profile_full_name_trigger ON profiles;
CREATE TRIGGER sync_profile_full_name_trigger
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION sync_profile_full_name();

-- Backfill existing profiles that have null full_name
-- This updates existing profiles from auth.users metadata
UPDATE profiles p
SET full_name = COALESCE(
  (SELECT raw_user_meta_data->>'full_name' FROM auth.users WHERE id = p.id),
  (SELECT raw_user_meta_data->>'name' FROM auth.users WHERE id = p.id),
  (SELECT CONCAT(raw_user_meta_data->>'given_name', ' ', raw_user_meta_data->>'family_name') 
   FROM auth.users 
   WHERE id = p.id 
     AND raw_user_meta_data->>'given_name' IS NOT NULL 
     AND raw_user_meta_data->>'family_name' IS NOT NULL)
)
WHERE p.full_name IS NULL OR p.full_name = ''
  AND EXISTS (
    SELECT 1 FROM auth.users u 
    WHERE u.id = p.id 
    AND (
      u.raw_user_meta_data->>'full_name' IS NOT NULL 
      OR u.raw_user_meta_data->>'name' IS NOT NULL
      OR (u.raw_user_meta_data->>'given_name' IS NOT NULL AND u.raw_user_meta_data->>'family_name' IS NOT NULL)
    )
  );

