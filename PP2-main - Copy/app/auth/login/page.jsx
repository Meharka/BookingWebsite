"use client";
import React, { useEffect,  useState, useContext, } from "react";

import { useSearchParams, useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";


const LoginPage = () => {
    const { login, loading, user } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [redirect, setRedirectTo] = useState("")
    const router = useRouter();

    // useEffect(() => {
    //     // Only runs on the client
    //     const params = new URLSearchParams(window.location.search);
    //     const redirect = params.get("redirectTo") || "/";
    //     setRedirectTo(redirect);
    //   }, [loading]);

    const handleLogin = (e) => {
        e.preventDefault();
        login(email, password);
        router.push("/manage-bookings");
      };

      //console.log("user", user)


    return (
        <div className="mt-20">
        <form onSubmit={handleLogin} >
            <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            className="w p-2 border border-gray-500 rounded-md"
             />
            <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            className="w p-2 border border-gray-500 rounded-md"
            />
            <button type="submit">Login</button>
        </form>
        </div>
    )
  


}

export default LoginPage;
