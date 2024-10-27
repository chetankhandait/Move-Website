// pages/plans/page.tsx
'use client'

import { useEffect, useState } from 'react';
import { supabase } from '@/app/libs/supabase';
import { PlanDetails } from '@/app/types';
import { useRouter } from 'next/navigation';

export default function PlansPage() {
  const [plans, setPlans] = useState<PlanDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
const router = useRouter()
  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('plans')
        .select('*');

      if (error) throw error;

      setPlans(data);
    } catch (err) {
      console.error('Error fetching plans:', err);
      setError('Failed to load plans. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handlePlanSelect = (plan: PlanDetails) => {
    localStorage.setItem('selectedPlan', JSON.stringify(plan));
    // Navigate to payment page
    router.push('/pages/check');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Choose Your Plan</h1>
      
      {error && (
        <div className="text-red-600 text-center mb-4">{error}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div key={plan.id} className="border rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-semibold">{plan.name}</h2>
            <p className="text-gray-600 mt-2">{plan.description}</p>
            <p className="text-2xl font-bold mt-4">₹{plan.price}</p>
            <p className="text-gray-600">{plan.duration}</p>
            <button
              onClick={() => handlePlanSelect(plan)}
              className="w-full mt-4 bg-teal-600 text-white py-2 rounded-md hover:bg-teal-700"
            >
              Select Plan
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}