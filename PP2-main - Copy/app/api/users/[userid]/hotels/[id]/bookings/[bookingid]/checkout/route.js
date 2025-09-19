import { prisma } from '@/utils/db';
import { getQueryParams } from "@/utils/getQueryParams";
import { authenticate } from "@/utils/auth";
import { NextResponse } from "next/server";
import { BookingStatus} from "@prisma/client";

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

export async function GET(request, {params}){
    const {booking_id} = params;
  
    // const { cardNum, cardExpiry} = await request.json();
    const user = await authenticate(request);

    const booking1 = await prisma.hotelBooking.findUnique({
        where: {
            id : Number(booking_id),
        },
    });

    if (!booking1) {
        return NextResponse.json({ message: "Hotel booking not found" }, { status: 404 });
      }

    return NextResponse.json(booking1);

}


export async function PUT(request, {params}){
  const {booking_id} = getQueryParams(request.url, ["booking_id"]);
    
    const { cardNum, cardExpiry} = await request.json();

    const user = await authenticate(request);
    if(!user){
      return NextResponse.json({error: "User unauthorized"}, {status: 400})
    }


    const userId = user.id;
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

    const confirmed_booking = await prisma.hotelBooking.update({
        where : { 
          id: Number(booking_id) }, 
        data: { status: BookingStatus.CONFIRMED},
        include: {  //  Include hotels in the response
          hotel: true
      }
    });
    //return NextResponse.json({confirm: confirmed_booking});
    const hotel1 = await prisma.hotel.findUnique({
      where:{id : Number(confirmed_booking.hotelId)},    
    });
    if(!hotel1){
      return NextResponse.json(
          {error: "Hotel not found"},
          {status: 404},
      )
      };
    const owner1 = await prisma.user.findUnique({
        where:{id : Number(hotel1.ownerId)},    
    });
    if(!owner1){
      return NextResponse.json(
          {error: "Owner not found"},
          {status: 404},
      )
      };
      var owner= "";
      var user2="";
 
      //return NextResponse.json({m: booking.userId})

      if(user.role === "HOTEL_OWNER"){
        return NextResponse.json({message: "You cannot create a booking as a HOTEL_OWNER"})
  
      }


    const notif = await prisma.notification.create({
        data:{
          userId: owner1.id,
          message: `A booking was made for ${hotel1.name}`,
          creator: "USER",
        },
      });
      owner = await prisma.user.findUnique({
        where: { id: owner1.id }, // Assuming you extract userId correctly
        include: {
             notifications: true, // Explicitly include the notifications list
        }
      });



      const notif2 = await prisma.notification.create({
        data:{
          userId: user.id,
          message: `A booking was made for ${hotel1.name}`,
          creator: "USER"
        },
      });
      user2 = await prisma.user.findUnique({
        where: { id: Number(userId) }, // Assuming you extract userId correctly

        include: {
            notifications: true, // Explicitly include the notifications list
        }
    });
    
      
    return NextResponse.json(
      {booking: confirmed_booking, usernotif: user2.notifications, hotel_ownernotif: owner.notifications}, 
        {status: 200},
    );


}