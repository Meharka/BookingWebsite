import { prisma } from '@/utils/db';
import { getQueryParams } from "@/utils/getQueryParams";
import { authenticate } from "@/utils/auth";
import { NextResponse } from "next/server";
import { BookingStatus} from "@prisma/client";



export async function GET(request, {params}) {
    //const {id} = params;
    const { userid } = getQueryParams(request.url, [
            "userid",
    ]);
        
        //const {id} = params;
        // const { searchParams } = new URL(request.url);
        // const id = searchParams.get("userid");
    //return NextResponse.json({id1 : id})
    if (!userid){
        return NextResponse.json({error: "Id not found"}, {status: 404});
    }
    const user1 = await authenticate(request); 

    if(!user1){
        return NextResponse.json(
            {error: "Not Authorized"}, 
            {status : 400})
    }

    const user = await prisma.user.findUnique({
        where: { id: Number(userid) }, // Assuming you extract userId correctly
        include: {
            notifications: true, // Explicitly include the notifications list
        }
    });

    //return NextResponse.json({m: user});
    if (!user){
        return NextResponse.json({error: "user not found"}, {status: 404});
    }
    let unreadCount =0;
    //return NextResponse.json({m: user.notifications});
    for (var i = 0; i< user.notifications.length; i++){
        if(!(user.notifications[i].isRead)){
            unreadCount++;
        }
    }
     //user.notifications.filter(n => !n.isRead).length; // taken from chatGpt 
    return NextResponse.json({message: `You have ${unreadCount} notifications left unread`, notifs: user.notifications});

}


//mark a specific notification as read, must give notification id. 
export async function PUT(request, {params}) {
    // const {id} = params;

    const { notifid } = getQueryParams(request.url, [
        "notifid",
    ]);
    
    if (!notifid){
        return NextResponse.json({error: "Id not found"}, {status: 404});
    }
    const user = await authenticate(request); 
    //return NextResponse.json(notifid)
    

    if (!user){
        return NextResponse.json({error: "user not found"}, {status: 404});
        
    }

      
    //return NextResponse.json({m: user3.notifications})

    const notif = await prisma.notification.update({
        where:{
            id:Number(notifid),
        },  
        data:{
          isRead: true,
        }
      });

    
    const user3 = await prisma.user.findFirst({
        where:{
            id : user.id,
        },   
        include: {
            notifications: true
        }

      });
    var unread_notif = []
    for (var i = 0; i< user3.notifications.length; i++){
        if (!(user3.notifications[i].isRead)){
            unread_notif.push(user3.notifications[i])
            // user3.notifications.splice(i, 1);
        }
    }

    
    return NextResponse.json({message: `You have ${unread_notif.length} notifications left unread`, 
                             notifications: unread_notif
        
    });
}