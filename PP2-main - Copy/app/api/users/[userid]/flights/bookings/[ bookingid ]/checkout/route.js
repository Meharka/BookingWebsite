import { prisma } from '@/utils/db';
import { getQueryParams } from "@/utils/getQueryParams";
import { authenticate } from "@/utils/auth";
import { NextResponse } from "next/server";
import { BookingStatus} from "@prisma/client";
import { NEXT_BODY_SUFFIX } from 'next/dist/lib/constants';

function validateCreditCard(cardNumber) { // This function for validating credit card number uses the Luhn's algorithm and has been taken from ChatGptAI. 
  // Remove non-numeric characters (e.g., spaces, dashes)
  cardNumber = cardNumber.replace(/\D/g, '');

  let sum = 0;
  let shouldDouble = false;

  // Process each digit from right to left
  for (let i = cardNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cardNumber[i], 10);

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9; // Equivalent to summing digits of numbers ≥ 10
      }
    }

    sum += digit;
    shouldDouble = !shouldDouble; // Flip flag for next digit
  }

  return sum % 10 === 0; // ✅ Valid if sum is divisible by 10
}



export async function PUT(request, {params}){

    const {booking_id} = getQueryParams(request.url, ["booking_id"]);
    const { cardNum, cardExpiry, passportNumber} = await request.json();

    if(!booking_id || !cardExpiry || !cardNum){
      return NextResponse.json(
          {error: "Booking not found!"},
          {status: 404},
      )
  };
    const user1 = await authenticate(request);
    if(!user1){
      return NextResponse.json({error: "User unauthorized"}, {status: 400})
    }
    
    const user = await prisma.user.findUnique({
      where: { id: user1.id }, // Assuming you extract userId correctly
      include: {
          notifications: true, // Explicitly include the notifications list
      }
  });

    const valid_card = validateCreditCard(cardNum);
    if (!valid_card){
        return NextResponse.json(

            {error: "The card is invalid"}, 
            {status: 400},
        );
    }
    const dateToday = new Date();
    const new_date = new Date(cardExpiry);
    if (dateToday > new_date){
        return NextResponse.json(
            {error: "The card is invalid"}, 
            {status: 400},
        );
    }
    // return NextResponse.json({mesage: booking_id});
    const booking_find = await prisma.flightBooking.findUnique({
      where : {
        id: Number(booking_id)}, 
        include: {  //  Include flights in the response
          flights: true
      }

      });


      if((booking_find.status) === BookingStatus.CONFIRMED){
          return NextResponse.json({message: "The booking was already confirmed. "})

      }
      const user_find = await prisma.user.update({
        where : {
          id: user1.id}, 
        data:{
          passportNumber: passportNumber,
        }
        
        });
        
        
       // return NextResponse.json({m: user_find.role})

    
    //return NextResponse.json({store: booking_find.flights});

    const flight_ids = booking_find.flights.map(flight => flight.id);

    //return NextResponse.json({store: flight_ids});
    const response2 = await fetch(`https://advanced-flights-system.replit.app/api/bookings`,{
      method: 'POST', 
      headers: {
          'x-api-key': "6059305f870693b3539191e685362d05e4ac85960ff591900d3ca1cb2ed462bd",
          "Content-Type": "application/json",
      },
      body: JSON.stringify({
              firstName: user.first_name, 
              lastName: user.last_name,
              email: user.email,
              passportNumber: String(user.passportNumber).trim(), 
              flightIds: flight_ids,
          }
      ),
    });
    const booking2 = await response2.json();

    if(!booking2){
      return NextResponse.json(
          {error: "Booking couldn't be confirmed"},
          {status: 404},
      )
    };
    //return NextResponse.json({booking: booking2.bookingReference})

    const confirmed_booking = await prisma.flightBooking.update({
        where : {id: Number(booking_id)}, 
        data: { 
          status: BookingStatus.CONFIRMED,
          reference: booking2.bookingReference,       
          }
          , 
          include: {
            flights: true,
          }

        });
    
    const notif = await prisma.notification.create({
      data:{
        userId: user1.id,
        message: "Your Flight booking was successfully created",

      },

    });
    //return NextResponse.json({m: user.notifications})
    const user_found = await prisma.user.findUnique({
      where: { id: user1.id }, // Assuming you extract userId correctly
      include: {
          notifications: true, // Explicitly include the notifications list
      }
  });
  //return NextResponse.json(({m: user_found.notifications}));

    return NextResponse.json({
      booking: confirmed_booking,
      notification: user_found.notifications}, 
  { status: 200 });


}
