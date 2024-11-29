'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/libs/supabase';
import { useForm } from 'react-hook-form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PaymentFormData, PlanDetails } from '@/app/types';
import Link from 'next/link';

// Define status types to match database constraints
const ORDER_STATUS = {
  PENDING: 'pending',
  SUCCESS: 'completed',
  FAILED: 'failed'
} as const;

export default function PaymentPage() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<PlanDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  console.log(selectedPlan)
  const { register, handleSubmit, setValue, getValues, formState: { errors } } = useForm<PaymentFormData>();

  // ... (keep the useEffect and loadRazorpay functions the same)

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
  
  const createOrder = async (formData: PaymentFormData) => {
    try {
      const newOrder = {
        plan_id: selectedPlan?.id,
        amount: parseInt(formData.totalAmount),
        status: ORDER_STATUS.PENDING, // Using predefined status
        payment_id: null,
        customer_details: {
          first_name: formData.fname,
          last_name: formData.lname,
          email: formData.email,
          mobile: formData.mobile,
          address: formData.address,
          country: formData.country,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode
        }
      };

      const { data, error } = await supabase
        .from('orders')
        .insert([newOrder])
        .select();

      if (error) throw error;
      
      if (data && data[0]) {
        setOrderId(data[0].id);
        return data[0].id;
      } else {
        throw new Error('No data returned from order creation');
      }
    } catch (err) {
      console.error('Failed to create order:', err);
      throw new Error('Failed to create order in database');
    }
  };

  const updateOrderStatus = async (orderId: string, status: typeof ORDER_STATUS[keyof typeof ORDER_STATUS], paymentId: string | null) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: status,
          payment_id: paymentId,
        })
        .eq('id', orderId);

      if (error) throw error;
    } catch (err) {
      console.error('Failed to update order status:', err);
      throw new Error('Failed to update order status');
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

    try {
      // Create initial order in Supabase
      const orderId = await createOrder(data);

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: parseInt(selectedPlan?.price) * 100,
        currency: 'INR',
        name: 'Move the dance Space',
        description: 'Plan Payment',
        handler: async function (response: any) {
          try {
            const paymentId = response.razorpay_payment_id;
            // Update order status to success
            await updateOrderStatus(orderId, ORDER_STATUS.SUCCESS, paymentId);
            
            // Reset form values
            Object.keys(data).forEach(key => setValue(key, ''));
            alert('Payment Successful! Payment ID: ' + paymentId);
          } catch (err) {
            console.error('Error updating order after payment:', err);
            setError('Payment successful but failed to update order status. Please contact support.');
          }
        },
        prefill: {
          name: `${data.fname} ${data.lname}`,
          email: data.email,
          contact: data.mobile,
        },
        theme: {
          color: '#07a291db',
        },
        modal: {
          ondismiss: async function() {
            // Update order status to failed if payment modal is dismissed
            if (orderId) {
              await updateOrderStatus(orderId, ORDER_STATUS.FAILED, null);
            }
          }
        }
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();
    } catch (err) {
      console.error('Payment process failed:', err);
      setError('Failed to process payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  return(
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto mb-8 bg-teal-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-teal-800 mb-4">Selected Plan</h2>
        <Link href={'/pages/plans'}>
        
        <button>
          go back to plan 

        </button>
        </Link>
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
  )

  // ... (keep the return JSX the same)
}