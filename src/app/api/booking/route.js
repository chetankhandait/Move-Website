
// src/app/api/bookings/route.js
import { supabase } from '@/lib/supabaseClient';

export async function GET() {
  const { data, error } = await supabase.from('Bookings').select('*');
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
  return new Response(JSON.stringify(data), { status: 200 });
}

export async function POST(request) {
  const body = await request.json();
  const { name, email, phone, courseName, startDate, endDate } = body;
  const { data, error } = await supabase.from('Bookings').insert([{ name, email, phone, courseName, startDate, endDate }]);
  
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
  return new Response(JSON.stringify(data), { status: 201 });
}
