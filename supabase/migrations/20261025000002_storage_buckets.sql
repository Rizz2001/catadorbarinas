-- ============================================================================
-- STORAGE BUCKETS (Comprobantes de Pago y Adjuntos de Chat en Vivo)
-- ============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('payment-proofs', 'payment-proofs', true),
  ('chat-attachments', 'chat-attachments', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Acceso publico a payment-proofs" ON storage.objects;
CREATE POLICY "Acceso publico a payment-proofs" ON storage.objects
  FOR ALL USING (bucket_id = 'payment-proofs');

DROP POLICY IF EXISTS "Acceso publico a chat-attachments" ON storage.objects;
CREATE POLICY "Acceso publico a chat-attachments" ON storage.objects
  FOR ALL USING (bucket_id = 'chat-attachments');
