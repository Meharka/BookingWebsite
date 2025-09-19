"use client";
import { SetStateAction, useEffect, useState } from "react";
import { useSearchParams, useParams, useRouter } from "next/navigation";
import StarRating from "../../components/starRating";
import CityAutocomplete from "../../components/cityAutocomplete";
import { useDarkMode } from "../../DarkModeContext";
import { useAuth } from "@/contexts/AuthContext";

export default function AddHotel() {
  const [hotelData, setHotelData] = useState<{
    name: string;
    logo: File | null;
    address: string;
    city: string;
    star_rating: number;
    images: File[];
  }>({
    name: "",
    logo: null,
    address: "",
    city: "",
    star_rating: 0,
    images: [],
  });

  const {loading, user, setUser} = useAuth();
  const router = useRouter();
  const [starRating, setStarRating] = useState(0);
  const [cityHotel, setCityHotel] = useState("");
  const [addressHotel, setAddressHotel] = useState("");
  const [nameHotel, setNameHotel] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imageNames, setImageNames] = useState<string[]>([]);
  const [logoName, setLogoName] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const { isDarkMode } = useDarkMode();

  useEffect(()=> {
    if (!user){
      router.push("/auth/login");
    }
  }, [user])

  const handleChange = (e: { target: { name: any; value: any; }; }) => {
    const { name, value } = e.target;
    setHotelData({ ...hotelData, [name]: value });
  };

  const handleImageUpload = async () => {
    if (!file) return;

    try {
      let uuid = self.crypto.randomUUID();
      const imageName = `${uuid}.jpg`;
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

  const handleLogoUpload = async () => {
    if (!logoFile) return;

    try {
      let uuid = self.crypto.randomUUID();
      const logo_name = `logo-${uuid}.jpg`;
      const data = new FormData();
      data.set("file", logoFile);
      data.set("name", logo_name);
      setLogoName(logo_name); 
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
      const res = await fetch(`${apiUrl}/api/upload`, {
        method: "POST",
        body: data,
      });

      if (!res.ok) throw new Error(await res.text());

      // Update state properly
    } catch (e: any) {
      console.error(e);
    }
  };

  const handleUpload = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    await handleLogoUpload();
    await handleImageUpload();
  }

    const handleSubmit = async (e: { preventDefault: () => void; }) => {
    try {

      const hotelParams = new URLSearchParams({
        city: cityHotel,
        name: nameHotel,
        address: addressHotel,
        logo: logoName,
        starRating: String(starRating),
      }).toString();

      const token = localStorage.getItem("token");
      const userid = user?.id;
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
      const url = `${apiUrl}/api/users/${userid}/hotels/`;
      const formData = new FormData();
      formData.append("name", hotelData.name);
  

      formData.append("address", hotelData.address);
      formData.append("city", cityHotel);
      formData.append("star_rating", String(starRating));
  
      // Append image files (if any)
      imageFiles.forEach((file) => {
        formData.append("images", file, file.name); // Append each image file
      });
  
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`},
        
        body: 
        
        JSON.stringify({
          name: hotelData.name,
          address: hotelData.address,
          city: cityHotel,
          logo: logoName,
          star_rating: starRating,
          images: imageNames, // Now correctly updated
        }),
      });
  
      if (!response.ok) throw new Error("Failed to create hotel");
      const data = await response.json();
      console.log("Hotel successfully created!", data);
      router.push("/manage-hotels");
    } catch (error) {
      console.error("Error creating hotel:", error);
    }
  };
  

  return (
    <div className={`${isDarkMode ? "bg-sky-700" : "bg-sky-100"} min-h-screen w-full`}>
    <div className={`${isDarkMode ? "bg-sky-900" : "bg-white"} max-w-lg mx-auto mt-14 p-5 border rounded-lg shadow-md`}>
      <h2 className={`${isDarkMode ? "text-sky-200" : "text-sky-700"} text-xl font-bold mb-4`}>Add Hotel</h2>
        <input
          type="text"
          name="name"
          placeholder="Hotel Name"
          value={hotelData.name}
          onChange={handleChange}
          className={`${isDarkMode ? "text-sky-200" : "text-sky-700"} w-full rounded-md border border-sky-500 p-2 mb-4`}
          required
        />
        <br></br>
        <input
          type="text"
          name="address"
          placeholder="Address"
          value={hotelData.address}
          onChange={handleChange}
          className={`${isDarkMode ? "text-sky-200" : "text-sky-700"} w-full rounded-md border border-sky-500 p-2 mb-4`}
          required
        />
        <CityAutocomplete
          value={cityHotel}
          onChange={(cityHotel) => setCityHotel(cityHotel)}
          placeholder="City"
        />
        <br></br>
        <StarRating onRatingChange={(rating) => setStarRating(rating)} />

      <p className={`${isDarkMode ? "text-sky-200" : "text-sky-700"} my-2`}>Logo: </p>
      <input
        type="file"
        name="file"
        onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)}
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
        onClick={handleUpload}
        className="p-4 mt-4 border border-sky-600 bg-yellow-200 text-sky-700 rounded-md focus:outline-none focus:ring-2">
          Upload Images
        </button>
      </div>

      <div className="mt-4 text-center">
        <button 
        onClick={handleSubmit}
        className="p-4 mt-4 border border-sky-600 bg-yellow-200 text-sky-700 rounded-md focus:outline-none focus:ring-2">
          Add Hotel
        </button>
      </div>

    </div>
    </div>
  );
}