// src/app/api/classes/route.js
import { supabase } from '@/lib/supabaseClient';

export async function GET() {
  const { data, error } = await supabase.from('Classes').select('*');
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
  return new Response(JSON.stringify(data), { status: 200 });
}

export async function POST(request) {
  const body = await request.json();
  const { teacher, danceForm, timing, date } = body;
  const { data, error } = await supabase.from('Classes').insert([{ teacher, danceForm, timing, date }]);
  
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
  return new Response(JSON.stringify(data), { status: 201 });
}
