// src/types/index.ts

// Type for a Dance Class
export interface Class {
    id: number;
    teacherName: string;
    danceForm: string;
    timing: string;
    date: string;
  }
  
  // Type for a Booking
  export interface Booking {
    id: number;
    name: string;
    email: string;
    phone: string;
    startDate: string;
    endDate: string;
    courseName: string;
    paymentStatus: 'pending' | 'completed' | 'failed';
    paymentHistory?: PaymentHistory[];
  }
  
  // Type for Payment History
  export interface PaymentHistory {
    paymentId: string;
    amount: number;
    date: string;
    status: 'success' | 'failed';
  }
  
  // Type for Razorpay Payment Response
  export interface RazorpayResponse {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }
  
  // Props for the BookingForm component
  export interface BookingFormProps {
    onSubmit: (bookingData: Omit<Booking, 'id' | 'paymentStatus'>) => void;
  }
  
  // Props for the ClassCard component
  export interface ClassCardProps {
    classData: Class;
  }
  
  // Props for the PaymentButton component
  export interface PaymentButtonProps {
    amount: number;
    onSuccess: (response: RazorpayResponse) => void;
  }
  