 import React from 'react';

const PaymentButton = ({ amount, onSuccess }) => {
  const handlePayment = () => {
    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: amount * 100, // Razorpay takes the amount in paise
      currency: 'INR',
      name: 'Dance Classes',
      description: 'Payment for booking dance classes',
      handler: (response) => {
        onSuccess(response);
      },
      prefill: {
        name: 'Your Name',
        email: 'email@example.com',
        contact: '9999999999',
      },
      theme: {
        color: '#F37254',
      },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  };

  return (
    <button onClick={handlePayment} className="payment-button">
      Pay Now
    </button>
  );
};

export default PaymentButton;
