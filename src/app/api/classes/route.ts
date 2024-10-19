// // src/app/api/classes/route.ts

// import { supabase } from "@/app/libs/supabaseClient";

 
// interface DanceClass {
//   teacher: string;
//   danceForm: string;
//   timing: string;
//   date: string;
// }

// export async function GET(): Promise<Response> {
//   const { data, error } = await supabase.from('Classes').select('*');
  
//   if (error) {
//     return new Response(JSON.stringify({ error: error.message }), {
//       status: 500,
//     });
//   }
  
//   return new Response(JSON.stringify(data), { status: 200 });
// }

// export async function POST(request: Request): Promise<Response> {
//   const body: DanceClass = await request.json();
//   const { teacher, danceForm, timing, date } = body;
  
//   const { data, error } = await supabase.from('Classes').insert([{ teacher, danceForm, timing, date }]);
  
//   if (error) {
//     return new Response(JSON.stringify({ error: error.message }), {
//       status: 500,
//     });
//   }
  
//   return new Response(JSON.stringify(data), { status: 201 });
// }
