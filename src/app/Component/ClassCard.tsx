// src/components/ClassCard.tsx
import React from 'react';

interface ClassCardProps {
  teacher: string;
  danceForm: string;
  timing: string;
  date: string;
}

const ClassCard: React.FC<ClassCardProps> = ({ teacher, danceForm, timing, date }) => {
  return (
    <div className="class-card border p-4 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold">{danceForm}</h3>
      <p>Teacher: {teacher}</p>
      <p>Time: {timing}</p>
      <p>Date: {new Date(date).toLocaleDateString()}</p>
    </div>
  );
};

export default ClassCard;
