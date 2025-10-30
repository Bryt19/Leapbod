-- Allow admins (based on profiles.role) to view and update all opportunities

-- SELECT all opportunities if the current user is an admin
DROP POLICY IF EXISTS "Admins can select all opportunities" ON opportunities;
CREATE POLICY "Admins can select all opportunities"
ON opportunities FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() AND p.role = 'admin'
  )
);

-- UPDATE any opportunity if the current user is an admin
DROP POLICY IF EXISTS "Admins can update any opportunity" ON opportunities;
CREATE POLICY "Admins can update any opportunity"
ON opportunities FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() AND p.role = 'admin'
  )
);


