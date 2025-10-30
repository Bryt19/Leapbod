-- Ensure authenticated users can insert opportunities for themselves

DROP POLICY IF EXISTS "Authenticated users can create opportunities" ON opportunities;
CREATE POLICY "Authenticated users can create opportunities"
ON opportunities FOR INSERT
WITH CHECK (
  auth.role() = 'authenticated' AND submitted_by = auth.uid()
);


