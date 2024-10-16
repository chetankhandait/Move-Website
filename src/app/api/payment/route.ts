// src/app/api/payment/route.ts
 import razorpay from '@/app/libs/razorpayConfig';
import { NextResponse } from 'next/server';
 
interface CreateOrderRequest {
  amount: number;
  currency?: string;
}

export async function POST(request: Request) {
  try {
    const { amount, currency = 'INR' }: CreateOrderRequest = await request.json();
    const options = {
      amount: amount * 100, // Amount in paise
      currency,
      receipt: `receipt_order_${Math.random() * 1000}`,
    };

    const order = await razorpay.orders.create(options);
    return NextResponse.json({ orderId: order.id, amount: order.amount, currency: order.currency });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    return NextResponse.json({ error: 'Failed to create Razorpay order' }, { status: 500 });
  }
}
