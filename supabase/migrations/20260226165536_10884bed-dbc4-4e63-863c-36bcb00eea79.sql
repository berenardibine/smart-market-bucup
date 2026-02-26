
-- Add admin full access to contact_messages
CREATE POLICY "Admin full access contact_messages"
ON public.contact_messages
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));
