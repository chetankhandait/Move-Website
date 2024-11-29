import React, { useEffect, useState } from 'react';

interface PaymentButtonProps {
  amount: number;
  onSuccess: (response: any) => void;
  onError: (error: Error) => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

const PaymentButton: React.FC<PaymentButtonProps> = ({ amount, onSuccess, onError }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRazorpay = async () => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => setLoading(false);
      script.onerror = () => {
        setLoading(false);
        onError(new Error('Failed to load Razorpay SDK'));
      };
      document.body.appendChild(script);
    };

    loadRazorpay();
  }, [onError]);

  const handlePayment = async () => {
    if (typeof window.Razorpay === 'undefined') {
      onError(new Error('Razorpay SDK not loaded'));
      return;
    }

    try {
      const response = await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create order: ${await response.text()}`);
      }

      const { orderId } = await response.json();

      const options = {
        key: process.env.RAZORPAY_KEY_ID,
        amount: amount * 100,
        currency: 'INR',
        name: 'Dance Classes',
        description: 'Payment for booking dance classes',
        order_id: orderId,
        handler: (response: any) => {
          onSuccess(response);
        },
        prefill: {
          name: 'John Doe',
          email: 'johndoe@example.com',
          contact: '9999999999',
        },
        theme: { color: '#F37254' },
        modal: {
          ondismiss: () => {
            onError(new Error('Payment cancelled by user'));
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', (response: any) => {
        onError(new Error(`Payment failed: ${response.error.description}`));
      });
      razorpay.open();
    } catch (error) {
      onError(error instanceof Error ? error : new Error('Unknown error occurred'));
    }
  };

  return (
    <button onClick={handlePayment} className="payment-button" disabled={loading}>
      {loading ? 'Loading...' : 'Pay Now'}
    </button>
  );
};

export default PaymentButton;