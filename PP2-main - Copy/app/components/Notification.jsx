'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BellIcon } from 'lucide-react'; // or your icon of choice
import { useAuth } from "@/contexts/AuthContext";


// interface Notification {
//     id: string;
//     message: string;
//     userId: string;
//     isRead: boolean;
//     createdAt: string;
    
//   }

export default function NotificationBell() {
    const [notifications, setNotifications] = useState([]);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const {loading , user, setUser} = useAuth();
    //console.log("user gotten: ", userId)
    // console.log("user from auth: ", user)
    // console.log("loading1: ", loading)
    

    useEffect(() => {
        if (!user) {
          setDropdownOpen(false) // Redirect to login if not logged in
        }
        // if (loading) return (<p>Loading...</p>);
        // if (!user) return  <p>Redirecting to login...</p>;;
      }, [ user]);

    const fetchNotifications = async () => {
        const token1 = localStorage.getItem("token")
        console.log("got here ")
        const res = await fetch(`http://localhost:3000/api/users/${user.id}/notification?userid=${user.id}`, {
            method: 'GET',
            headers: { "Content-Type": "application/json" ,
            Authorization: `Bearer ${token1}`}
        });
        if(!res.ok){
            console.log("Api response didnt work:", res)
        }
        const data = await res.json();
        //console.log("API response:", data);
        setNotifications(data.notifs);
      };
    //console.log("loading2: ", loading)
    useEffect(() => {
        if(!loading && user){
            //console.log("user from auth insider: ", user.id)
            fetchNotifications()
        }
        

    }, [user, loading])

    // useEffect(() => {
    //     if(notifications){
    //         console.log("notification: ", notifications)
    //     }else{
    //         console.log("notifs didnt render: ", notifications)
    //     }

    // }, [notifications, user, loading])
    

    const markAsRead = async (id) => {
        const token = localStorage.getItem("token")
        const res2 = await fetch(`http://localhost:3000/api/users/${user.id}/notification?notifid=${id}`, {
            method: 'PUT',
            headers: { "Content-Type": "application/json" ,
            Authorization: `Bearer ${token}`}
        });

        const data2 = await res2.json()
        //console.log("API response:", data2);
        setNotifications(data2.notifications)

        // setNotifications((prev) =>
        //     prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
        //   );

    }
    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return (
        <div className="relative">
        <button onClick={() => setDropdownOpen((prev) => !prev)} className="relative">
            <BellIcon className="hover:text-bg-blue-100"/>
            {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex h-3 w-3 items-center justify-center text-xs font-bold text-white bg-red-500 rounded-full " >{unreadCount}</span>
            )}
        </button>
        {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-xl z-50 p-2">
                <h3 className="text-sm font-bold px-2">Notifications</h3>
                <ul className="max-h-64 overflow-y-auto">
                    {notifications.length === 0 && (
                    <li className="text-sm text-gray-500 px-2 py-2">No notifications</li>
                    )}
                    {notifications.map((n) => (
                    <li
                        key={n.id}
                        className={`px-3 py-2 cursor-pointer rounded-md hover:bg-gray-100 hover:text-black ${
                        !n.isRead ? 'font-semibold' : 'text-gray-500'
                        }`}
                        onClick={() => markAsRead(n.id)}
                    >
                        {n.message}
                    <div className="text-xs text-gray-400">{new Date(n.createdAt).toLocaleString()}</div>
                    </li>
                    ))}
                </ul>
                </div>
            )}

        </div>
    )


}
