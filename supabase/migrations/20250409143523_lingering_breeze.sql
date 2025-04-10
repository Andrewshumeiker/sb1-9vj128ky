/*
  # Healthcare Supply Chain Management System Schema

  1. New Tables
    - hospitals
      - id (uuid, primary key)
      - name (text)
      - location (text)
      - created_at (timestamp)
    
    - medications
      - id (uuid, primary key)
      - name (text)
      - description (text)
      - unit_cost (decimal)
      - current_stock (integer)
      - min_stock_level (integer)
      - created_at (timestamp)
    
    - patients
      - id (uuid, primary key)
      - medical_record_number (text, unique)
      - name (text)
      - admission_date (date)
      - discharge_date (date)
      - created_at (timestamp)
    
    - medication_usage
      - id (uuid, primary key)
      - patient_id (uuid, references patients)
      - medication_id (uuid, references medications)
      - quantity (integer)
      - administered_at (timestamp)
      - created_at (timestamp)
      - hospital_id (uuid, references hospitals)
      - unit_cost_at_time (decimal)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create hospitals table
CREATE TABLE hospitals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  location text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create medications table
CREATE TABLE medications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  unit_cost decimal NOT NULL,
  current_stock integer NOT NULL DEFAULT 0,
  min_stock_level integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create patients table
CREATE TABLE patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  medical_record_number text UNIQUE NOT NULL,
  name text NOT NULL,
  admission_date date NOT NULL,
  discharge_date date,
  created_at timestamptz DEFAULT now()
);

-- Create medication_usage table
CREATE TABLE medication_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES patients(id) NOT NULL,
  medication_id uuid REFERENCES medications(id) NOT NULL,
  quantity integer NOT NULL,
  administered_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  hospital_id uuid REFERENCES hospitals(id) NOT NULL,
  unit_cost_at_time decimal NOT NULL
);

-- Enable Row Level Security
ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_usage ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for authenticated users" ON hospitals
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable read access for authenticated users" ON medications
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable read access for authenticated users" ON patients
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable read access for authenticated users" ON medication_usage
  FOR SELECT TO authenticated USING (true);

-- Create policies for insert/update
CREATE POLICY "Enable insert for authenticated users" ON hospitals
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable insert for authenticated users" ON medications
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable insert for authenticated users" ON patients
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable insert for authenticated users" ON medication_usage
  FOR INSERT TO authenticated WITH CHECK (true);