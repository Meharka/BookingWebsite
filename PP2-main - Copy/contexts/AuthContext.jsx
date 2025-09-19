
//Chatgpt was used to help in some of the aread in order to achieve the setting of the providers and contexts correctly
"use client";
import React, { createContext, useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";




export const AuthContext = createContext({
  user: null,
  setUser: () => {},
});


export const AuthProvider= ({children,}) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    
        const getBooking = async() => {
            const token = localStorage.getItem("token");
            const userId = localStorage.getItem("userId");

            if (!token || !userId) {
              setUser(null);
              setLoading(false);
              return;
            }
              const res = await fetch(`/api/users/${userId}`, {
                method: "GET", 
                headers: { Authorization: `Bearer ${token}` },
            })
            const data = await  res.json()
            if(!data){
              setUser(null)
            }else{
                setUser(data.user)}
                setLoading(false);
            
      ;}
      useEffect(() => {
        getBooking();
    }, []);

    const login = async (email, password) => {
        const response = await fetch("/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ "email": email, "password":password }),
        });
        
        if (response.ok) {
            const { token, user } = await response.json();
            console.log("user12: ", user, "token: ", token)
            localStorage.setItem("token", token);
            localStorage.setItem("userId", user.id);
            setUser(user);
            router.push("/dashboard")
        } else {
            alert("Login failed!");
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        setUser(null);
        router.push("/auth/login");
      };




    return (
        <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
          {children}
        </AuthContext.Provider>
      );

};

export const useAuth = () => useContext(AuthContext);