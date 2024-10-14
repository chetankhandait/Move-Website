'use client'
import React, { useState } from 'react'
import { Booking } from '@/app/types'
import { supabase } from '@/app/libs/supabaseClient'
import BookingForm from '@/app/Component/BookingForm'
import PaymentButton from '@/app/Component/PaymentButtom'
 
const BookingsPage: React.FC = () => {
  const [currentBooking, setCurrentBooking] = useState<Booking | null>(null)
  const [paymentSuccessful, setPaymentSuccessful] = useState<boolean>(false)

  const handleBookingSubmit = async (bookingData: Omit<Booking, 'id' | 'paymentStatus'>) => {
    try {
      const { data, error } = await supabase
        .from('Bookings')
        .insert([{ ...bookingData, paymentStatus: 'pending' }])
        .select()

      if (error) throw error

      if (data && data.length > 0) {
        setCurrentBooking(data[0] as Booking)
      }
    } catch (error) {
      console.error('Error creating booking:', error)
    }
  }

  const handlePaymentSuccess = async (response: any) => {
    if (currentBooking) {
      try {
        const { error } = await supabase
          .from('Bookings')
          .update({ paymentStatus: 'completed' })
          .eq('id', currentBooking.id)

        if (error) throw error

        setPaymentSuccessful(true)
      } catch (error) {
        console.error('Error updating booking status:', error)
      }
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Book a Dance Class</h1>
      {!paymentSuccessful ? (
        <>
          <BookingForm onSubmit={handleBookingSubmit} />
          {currentBooking && (
            <div className="mt-4">
              <h2 className="text-xl">Complete Payment</h2>
              <PaymentButton
                amount={500} // Example amount in INR
                onSuccess={handlePaymentSuccess}
              />
            </div>
          )}
        </>
      ) : (
        <div className="text-green-600">
          <h2>Payment Successful!</h2>
          <p>Your booking is confirmed.</p>
        </div>
      )}
    </div>
  )
}

export default BookingsPage