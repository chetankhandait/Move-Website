// src/app/bookings/page.tsx
'use client'
import PaymentButton from '@/app/Component/PaymentButtom';
import React, { useState } from 'react';
 
const BookingsPage: React.FC = () => {
  const [amount, setAmount] = useState<number>(1000); // Set your desired amount here

  const handlePaymentSuccess = (response: any) => {
    console.log('Payment Successful:', response);
    // Handle post-payment success actions, like saving to the database or updating the UI
  };

  return (
    <div>
      <h1>Book a Dance Class</h1>
      <PaymentButton amount={amount} onSuccess={handlePaymentSuccess} />
    </div>
  );
};

export default BookingsPage;
