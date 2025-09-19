import { prisma } from '@/utils/db';
import { getQueryParams } from "@/utils/getQueryParams";
import PDFDocument from 'pdfkit';
import { NextResponse } from "next/server";
import { authenticate } from "@/utils/auth";

import path from "path";


export async function GET(request, {params}) {
    const { bookingId, userId } = getQueryParams(request.url, [
        "bookingId",
        "userId",
     ]);
    //return NextResponse.json({booking: `booking id : ${bookingId} and userid: ${userId}`})
    if(!bookingId || !userId){
        return NextResponse.json(
            {error: "Booking not found!"},
            {status: 404},
        )
    };
    const user = await authenticate(request);

    if(!user){
      return NextResponse.json({error: "User unauthorized"}, {status: 400})
    }

    const booking1 = await prisma.flightBooking.findUnique({
        where: {
            id: Number(bookingId),
            userId: Number(userId),
            },
          },);
      if (!booking1) {
        return NextResponse.json({ error: "Booking not found1" }, { status: 404 });
      }
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const params1 = new URLSearchParams();
    if(bookingId) params1.append("bookingReference", booking1.reference);
    params1.append("lastName", user.last_name);

            
    const response1 = await fetch(`https://advanced-flights-system.replit.app/api/bookings/retrieve?${params1.toString()}`,{
      method: 'GET', 
      headers: {
          'x-api-key': "6059305f870693b3539191e685362d05e4ac85960ff591900d3ca1cb2ed462bd",
          "Content-Type": "application/json",
      },
    });
    const booking = await response1.json();
    if(!booking){
      return NextResponse.json(
          {error: "Booking not found"},
          {status: 404},
      )
    };
    

    // const nextConfig = {
    //   serverExternalPackages: ["pdfkit"],
    // }

    // Some of the following code is inspired from https://pdfkit.org/docs/getting_started.html and some from chatgpt. 

    
    //console.log("PDFDocument is:", PDFDocument);
    const doc = new PDFDocument({ font: null });
    const fontPath = path.resolve(process.cwd(), "node_modules/pdfkit/js/data/Arial.ttf");
    doc.registerFont("Arial", fontPath);
    doc.font("Arial");
    //return NextResponse.json({"mssage": "PDFDocument"});
    const pdfBuffer = [];
    //doc.on("data", (chunk) => pdfBuffer.push(chunk));
    
    //const fs = await import('fs');

   // let buffers = [];

    doc.on("data", (chunk) => pdfBuffer.push(chunk));
    doc.on("end", () => {
        const pdfData = Buffer.concat(pdfBuffer);
        return NextResponse.json(pdfData, {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename=invoice-${bookingId}.pdf`,
            },
        });
    });

   //doc.pipe(fs.createWriteStream(`invoice_${bookingId}.pdf`));

  //  doc.on("end", () => {
  //   const pdfData = Buffer.concat(pdfBuffer);
  //   return NextResponse.json(pdfData, {
  //       headers: {
  //           "Content-Type": "application/pdf",
  //           "Content-Disposition": `attachment; filename=invoice-${bookingId}.pdf`,
  //       },
  //   });
  //   });

    
    doc.fontSize(16).text(`Booking Invoice`, { align: "center" });
    doc.moveDown();

    doc.text(`Booking ID: ${booking1.id}`); 
    doc.text(`Booking Reference: ${booking.bookingReference}`); 
    
    doc.text(`Passenger Name: ${user.first_name} ${user.last_name}`)


    doc 
    .text(`PassportNumber: ${user.passportNumber}`)
    .text(`email: ${user.email}`)
    .text(`Phone Number: ${user.phone_number}`)
    .text(`Booking Status:  ${booking.status}`)

    doc.text(`Booking information: ${booking}`);


    //doc.text('Some text with an embedded font!', 100, 100);
    doc.end();
    //const pdfData = Buffer.concat(pdfBuffer);

    //const pdfData = Buffer.concat(buffers);
    //return NextResponse.json({document: doc});
    // return NextResponse.json();
    
      const pdfData = Buffer.concat(pdfBuffer);
        return NextResponse.json(pdfData, {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename=invoice-${bookingId}.pdf`,
            },
        });
     return NextResponse.json({message: "pdf file was made"});
  

}


