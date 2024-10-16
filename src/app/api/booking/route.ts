// src/app/api/bookings/route.ts
import { supabase } from '@/app/libs/supabaseClient';

interface Booking {
  name: string;
  email: string;
  phone: string;
  courseName: string;
  startDate: string;
  endDate: string;
}

export async function GET(): Promise<Response> {
  const { data, error } = await supabase.from('Bookings').select('*');
  
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
  
  return new Response(JSON.stringify(data), { status: 200 });
}

export async function POST(request: Request): Promise<Response> {
  const body: Booking = await request.json();
  const { name, email, phone, courseName, startDate, endDate } = body;
  
  const { data, error } = await supabase.from('Bookings').insert([{ name, email, phone, courseName, startDate, endDate }]);
  
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
  
  return new Response(JSON.stringify(data), { status: 201 });
}
