import type { Database } from "./types";

declare global {
  interface Window {
    supabase: {
      createClient: <T = any>(url: string, key: string) => any;
    };
  }
}

const supabaseUrl = 'https://tbcvbxvqicowjtbggkfa.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRiY3ZieHZxaWNvd2p0Ymdna2ZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5MTY0MjYsImV4cCI6MjA3NDQ5MjQyNn0.IVT3hOlS12XePDC-hFQIoR79FXdyNxHivpR--Gro8GA';

export const supabase = window.supabase.createClient<Database>(
  supabaseUrl,
  supabaseAnonKey
);
