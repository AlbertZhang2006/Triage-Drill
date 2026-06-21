-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New Query)

CREATE TABLE IF NOT EXISTS incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  join_code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  location TEXT DEFAULT '',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed')),
  started_at BIGINT NOT NULL,
  completed_at BIGINT,
  state JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_incidents_join_code ON incidents (join_code);

ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;

-- Open access for drill use (no auth required)
CREATE POLICY "Allow read" ON incidents FOR SELECT USING (true);
CREATE POLICY "Allow insert" ON incidents FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update" ON incidents FOR UPDATE USING (true) WITH CHECK (true);

-- Enable Realtime for broadcast
ALTER PUBLICATION supabase_realtime ADD TABLE incidents;
