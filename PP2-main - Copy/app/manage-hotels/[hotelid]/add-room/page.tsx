"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useDarkMode } from "../../../DarkModeContext";

export default function AddRoom() {
  const { hotelid } = useParams();
  const hotelId = hotelid;
  const router = useRouter();

  const [roomData, setRoomData] = useState({
    name: "",
    amenities: "",
    price_per_night: 0,
    images: [] as string[],
  });

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [imageNames, setImageNames] = useState<string[]>([]); // Use state
  const {loading, user, setUser} = useAuth();
  const { isDarkMode } = useDarkMode();

    useEffect(() => {
  
      if (!user){
        router.push("/auth/login")
      }
    }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRoomData({ ...roomData, [name]: value });
  };

  const handleImageUpload = async () => {
    if (!file || !hotelId) return;

    try {
      let uuid = self.crypto.randomUUID();
      const imageName = `${hotelId}-${uuid}`;
      const data = new FormData();
      data.set("file", file);
      data.set("name", imageName);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
      const res = await fetch(`${apiUrl}/api/upload`, {
        method: "POST",
        body: data,
      });

      if (!res.ok) throw new Error(await res.text());

      setImageNames((prev) => [...prev, imageName]); // Update state properly
    } catch (e: any) {
      console.error(e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Upload image first
    await handleImageUpload();

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
      const userid = user?.id;
      const url = `${apiUrl}/api/users/${userid}/hotels/${hotelId}/rooms`;
      const token = localStorage.getItem("token");

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
         },
        body: JSON.stringify({
          hotelId,
          name: roomData.name,
          price_per_night: roomData.price_per_night,
          amenities: roomData.amenities,
          images: imageNames, // Now correctly updated
        }),
      });

      if (!response.ok) throw new Error("Failed to create room");
      console.log("Room successfully created!", await response.json());

      router.push(`/manage-hotels/${hotelid}`);
    } catch (error) {
      console.error("Error creating room:", error);
    }
  };

  return (
    <div className={`${isDarkMode ? "bg-sky-700" : "bg-sky-100"} min-h-screen w-full`}>
    <div className={`${isDarkMode ? "bg-sky-900" : "bg-white"} max-w-lg mx-auto mt-14 p-5 border rounded-lg shadow-md`}>
    <h2 className={`${isDarkMode ? "text-sky-200" : "text-sky-700"} text-xl font-bold mb-4`}>Add Room</h2>
      <input
        type="text"
        name="name"
        placeholder="Room Name"
        value={roomData.name}
        onChange={handleChange}
        className={`${isDarkMode ? "text-sky-200" : "text-sky-700"} w-full rounded-md border border-sky-500 p-2 mb-4`}
        required
      />
      <input
        type="text"
        name="amenities"
        placeholder="Amenities"
        value={roomData.amenities}
        onChange={handleChange}
        className={`${isDarkMode ? "text-sky-200" : "text-sky-700"} w-full rounded-md border border-sky-500 p-2 mb-4`}
        required
      />
      <input
        type="number"
        name="price_per_night"
        placeholder="Price Per Night"
        value={roomData.price_per_night}
        onChange={handleChange}
        className={`${isDarkMode ? "text-sky-200" : "text-sky-700"} w-full rounded-md border border-sky-500 p-2 mb-4`}
        required
      />

<p className={`${isDarkMode ? "text-sky-200" : "text-sky-700"} my-2`}>Images: </p>
      <input
        type="file"
        name="file"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
      />

      <br></br>
      <div className="mt-4 text-center">
      <button
        type="submit"
        className="p-4 mt-4 border border-sky-600 bg-yellow-200 text-sky-700 rounded-md focus:outline-none focus:ring-2"
        onClick={handleSubmit}
      >
        Add Room
      </button>
      </div>
    </div>
    </div>
  );
}
