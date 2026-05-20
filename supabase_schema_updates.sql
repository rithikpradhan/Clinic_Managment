-- 1. Create the notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL,
    read BOOLEAN DEFAULT false NOT NULL
);

-- 2. Add RLS policies for notifications (assuming anon/authenticated roles can read/write for now)
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON public.notifications
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON public.notifications
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON public.notifications
    FOR UPDATE USING (true);

CREATE POLICY "Enable delete for all users" ON public.notifications
    FOR DELETE USING (true);

-- 3. Add payment_status column to appointments table
ALTER TABLE public.appointments
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'Pending'::text;

-- 4. Add consultation columns to appointments
ALTER TABLE public.appointments
ADD COLUMN IF NOT EXISTS is_consultation BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS consultation_fee INTEGER DEFAULT 0;

-- 5. Add consultation_fee to clinic_settings
ALTER TABLE public.clinic_settings
ADD COLUMN IF NOT EXISTS consultation_fee INTEGER DEFAULT 500;
