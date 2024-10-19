// // src/app/classes/page.tsx
// 'use client';
// import React, { useEffect, useState } from 'react';
// import { Class } from '@/app/types';
// import { supabase } from '@/app/libs/supabaseClient';
// import ClassCard from '@/app/Component/ClassCard';

// const ClassesPage: React.FC = () => {
//   const [classes, setClasses] = useState<Class[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);

//   useEffect(() => {
//     const fetchClasses = async () => {
//       setLoading(true);
//       const { data, error } = await supabase
//         .from('Classes')
//         .select('*');

//       if (error) {
//         console.error('Error fetching classes:', error.message);
//         setLoading(false);
//         return;
//       }

//       if (data && Array.isArray(data)) {
//         // Type assertion to ensure 'data' matches the expected structure
//         setClasses(data as Class[]);
//       } else {
//         console.warn('Unexpected data format:', data);
//       }

//       setLoading(false);
//     };

//     fetchClasses();
//   }, []);

//   return (
//     <div className="container mx-auto p-4">
//       <h1 className="text-2xl font-bold mb-4">Available Dance Classes</h1>
//       {loading ? (
//         <p>Loading classes...</p>
//       ) : (
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//           {classes.map((classData) => (
//             <ClassCard 
//               key={classData.id} 
//               teacher={classData.teacherName} 
//               danceForm={classData.danceForm} 
//               timing={classData.timing} 
//               date={classData.date} 
//             />
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default ClassesPage;
