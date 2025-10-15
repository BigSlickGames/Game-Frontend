/*
  # Create game data table

  1. New Tables
    - `game_data`
      - `id` (uuid, primary key) - Unique identifier for each record
      - `message` (text) - Message content
      - `created_at` (timestamptz) - Timestamp when record was created
      - `updated_at` (timestamptz) - Timestamp when record was last updated

  2. Security
    - Enable RLS on `game_data` table
    - Add policy for public read access (anyone can view data)
    - Add policy for public insert access (anyone can create data)
    - Add policy for public update access (anyone can update data)
    - Add policy for public delete access (anyone can delete data)

  Note: These policies allow public access for demo purposes. In production,
  you would restrict access based on authentication and user ownership.
*/

CREATE TABLE IF NOT EXISTS game_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE game_data ENABLE ROW LEVEL SECURITY;

-- Public access policies for demo purposes
CREATE POLICY "Anyone can read game data"
  ON game_data
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert game data"
  ON game_data
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update game data"
  ON game_data
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete game data"
  ON game_data
  FOR DELETE
  USING (true);