-- Adicionar novos campos à tabela check_ins
ALTER TABLE check_ins 
ADD COLUMN call_summary TEXT,
ADD COLUMN call_link TEXT;