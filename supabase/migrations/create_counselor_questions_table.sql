-- Create counselor_questions table
CREATE TABLE IF NOT EXISTS counselor_questions (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255) NOT NULL,
  topic VARCHAR(255) NOT NULL,
  question TEXT NOT NULL,
  consent BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now()
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_counselor_questions_email ON counselor_questions(email);
CREATE INDEX IF NOT EXISTS idx_counselor_questions_topic ON counselor_questions(topic);
CREATE INDEX IF NOT EXISTS idx_counselor_questions_created_at ON counselor_questions(created_at);

-- Enable Row Level Security
ALTER TABLE counselor_questions ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (form submissions from the website)
CREATE POLICY "Allow anonymous inserts"
  ON counselor_questions
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Only authenticated users (admins) can read submissions
CREATE POLICY "Allow authenticated reads"
  ON counselor_questions
  FOR SELECT
  TO authenticated
  USING (true);
