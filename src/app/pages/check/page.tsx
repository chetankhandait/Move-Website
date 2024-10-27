'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/libs/supabase';
import { useForm } from 'react-hook-form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PaymentFormData, PlanDetails, } from '@/app/types';


export default function PaymentPage() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<PlanDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  // Initialize useForm
  const { register, handleSubmit, setValue, getValues, formState: { errors } } = useForm<PaymentFormData>();

  useEffect(() => {
    const loadRazorpay = async () => {
      return new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;

        script.onload = () => {
          setRazorpayLoaded(true);
          resolve();
        };

        script.onerror = () => {
          reject(new Error('Failed to load Razorpay SDK'));
        };

        document.body.appendChild(script);
      });
    };

    const initializePage = async () => {
      try {
        await loadRazorpay();

        const planData = localStorage.getItem('selectedPlan');
        if (!planData) {
          router.push('/plans');
          return;
        }

        const plan: PlanDetails = JSON.parse(planData);
        setSelectedPlan(plan);
        setValue('totalAmount', plan.price.toString());
      } catch (err) {
        console.error('Initialization error:', err);
        setError('There was an error loading the payment system. Please refresh the page or try again later.');
      }
    };

    initializePage();
  }, [router, setValue]);

  const addPaymentToDatabase = async (status: string, paymentId: string | null, amount: number) => {
    try {
      const { data, error } = await supabase.from('order').insert([
        {
          uuid: crypto.randomUUID(), // Generate a UUID for the new order
          plan_id: selectedPlan?.id, // Assuming selectedPlan.id is the UUID of the plan
          amount: amount,
          status: status,
          payment_id: paymentId,
          customer_details: {
            first_name: getValues('fname'),
            last_name: getValues('lname'),
            email: getValues('email'),
            mobile: getValues('mobile'),
            address: getValues('address'),
            country: getValues('country'),
            city: getValues('city'),
            state: getValues('state'),
            pincode: getValues('pincode')
          }
        }
      ]);

      if (error) throw error;

      console.log('Payment added to database:', data);
    } catch (err) {
      console.error('Failed to add payment to database:', err);
      setError('Failed to record payment. Please try again later.');
    }
  };

  const onSubmit = async (data: PaymentFormData) => {
    setError(null);

    if (!selectedPlan) {
      setError('No plan selected. Please select a plan first.');
      return;
    }

    if (!razorpayLoaded) {
      setError('Payment system is not ready. Please refresh the page and try again.');
      return;
    }

    setLoading(true);

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: parseInt(selectedPlan?.price) * 100,
      currency: 'INR',
      name: 'Move the dance Space',
      description: 'Plan Payment',
      handler: async function (response: any) {
        const paymentId = response.razorpay_payment_id;
        await addPaymentToDatabase('Completed', paymentId, parseInt(data.totalAmount));

        // Reset form values
        Object.keys(data).forEach(key => setValue(key, ''));
        alert('Payment Successful! Payment ID: ' + paymentId);
      },
      prefill: {
        name: `${data.fname} ${data.lname}`,
        email: data.email,
        contact: data.mobile,
      },
      theme: {
        color: '#07a291db',
      },
    };

    try {
      await addPaymentToDatabase('Initiated', null, parseInt(data.totalAmount));
      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.error('Payment initiation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto mb-8 bg-teal-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-teal-800 mb-4">Selected Plan</h2>
        {selectedPlan && (
          <div className="flex justify-between items-center">
            <div>
              <p className="text-lg font-medium text-gray-800">{selectedPlan.name}</p>
              <p className="text-sm text-gray-600">{selectedPlan.description}</p>
              <p className="text-sm text-gray-600">{selectedPlan.duration}</p>
            </div>
            <div className="text-2xl font-bold text-teal-700">₹{selectedPlan.price}</div>
          </div>
        )}
      </div>

      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-semibold text-center text-teal-600 mb-6">Payment Details</h2>
        {error && (
          <Alert>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input {...register('fname', { required: true })} placeholder="First Name" className="w-full px-4 py-2 border rounded-md" />
            <input {...register('lname', { required: true })} placeholder="Last Name" className="w-full px-4 py-2 border rounded-md" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input {...register('email', { required: true })} placeholder="Email" className="w-full px-4 py-2 border rounded-md" />
            <input {...register('mobile', { required: true, pattern: /^\d{10}$/ })} placeholder="Mobile Number" className="w-full px-4 py-2 border rounded-md" />
          </div>
          <input {...register('address', { required: true })} placeholder="Address" className="w-full px-4 py-2 border rounded-md" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input {...register('country', { required: true })} placeholder="Country" className="w-full px-4 py-2 border rounded-md" />
            <input {...register('city', { required: true })} placeholder="City" className="w-full px-4 py-2 border rounded-md" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input {...register('state', { required: true })} placeholder="State" className="w-full px-4 py-2 border rounded-md" />
            <input {...register('pincode', { required: true, pattern: /^\d{6}$/ })} placeholder="Pincode" className="w-full px-4 py-2 border rounded-md" />
          </div>

          <div className="flex justify-center mt-4">
            <button type="submit" className={`w-full py-3 text-white bg-teal-600 rounded-md ${loading ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={loading}>
              {loading ? 'Processing...' : 'Pay Now'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
