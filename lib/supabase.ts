
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cdqcqzmgphwpyuqmybrq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkcWNxem1ncGh3cHl1cW15YnJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5MjE0NzksImV4cCI6MjA4NjQ5NzQ3OX0.sokWKH-GTNvDlsLQIEHwij1fX9wWgz3PwbX8TcZRzis';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
