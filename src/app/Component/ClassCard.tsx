// src/components/ClassCard.js
import React from 'react';

const ClassCard = ({ teacher, danceForm, timing, date }) => {
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
