-- REQ-001: Characters, Conversations, Messages tables with RLS
-- Prague Phase 2 schema, designed for 10k users

-- Characters table: one row per girl
CREATE TABLE characters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE characters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "characters_select_authenticated"
  ON characters FOR SELECT
  TO authenticated
  USING (true);

-- Conversations table: links a user to a character
CREATE TABLE conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  character_id uuid NOT NULL REFERENCES characters (id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "conversations_select_own"
  ON conversations FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "conversations_insert_own"
  ON conversations FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "conversations_update_own"
  ON conversations FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE INDEX idx_conversations_user_character
  ON conversations (user_id, character_id);

-- Messages table: stores every message turn
-- user_id denormalized for RLS performance (avoids join at 10k scale)
CREATE TABLE messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations (id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "messages_select_own"
  ON messages FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "messages_insert_own"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE INDEX idx_messages_conversation_created
  ON messages (conversation_id, created_at);

-- Seed 12 characters from wireframe
INSERT INTO characters (name) VALUES
  ('Valentina'),
  ('Jiwoo'),
  ('Sophie'),
  ('Avery'),
  ('Sara'),
  ('Nadia'),
  ('Hina'),
  ('Adaeze'),
  ('Lina'),
  ('Reva'),
  ('Kaya'),
  ('Zuri');
