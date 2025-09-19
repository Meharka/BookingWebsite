"use client";
import React, { useEffect,  useState, useContext, } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";



const Signup = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setlastName] = useState("");
    const [role, setRole] = useState("");
    const [phoneNum, setPhone] = useState("");


    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const response = await fetch("http://localhost:3000/api/users/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            { 
                "first_name": firstName,
                "last_name": lastName,
                "email": email,
                "password": password,
                "phone_number": phoneNum, 
                "role": role
            }),
        });
        const store= await response.json()
        console.log("response:", response)
        if(response.ok){
            alert("Registration successful! Please log in.");
            router.push("/auth/login")
        }else{
            alert("Error while registering!!!")
        }

        
    }
    return (
        <div className="mt-14">
            
            <form onSubmit={handleSubmit}>

            <input 
                type="text" 
                className="border-red"
                label="firstName"
                placeholder="First Name" 
                value={firstName} 
                onChange={(e) => setFirstName(e.target.value)} required />

            <input 
                type="text" label="lastName"
                placeholder="Last Name" 
                value={lastName} 
                onChange={(e) => setlastName(e.target.value)} required />

            <input 
                type="text" label="role"
                placeholder="Role: User/HotelOwner" 
                value={role} 
                onChange={(e) => setRole(e.target.value)} required />

            <input 
                type="text" label="Phone"
                placeholder="Phone Number" 
                value={phoneNum} 
                onChange={(e) => setPhone(e.target.value)} required />

            <input 
                type="email" label="email"
                placeholder="Email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} required />

            <input type="password"  
            label="password" 
            placeholder="Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} required />

            <button type="submit" className="bg ">Register</button>

            
            </form>
            <br></br>
            <p>Already Have an Account?</p>
            <Link href="/auth/login">Login</Link>
        </div>
    )
}

export default Signup; 