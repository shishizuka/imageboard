import { useState, useEffect } from "react";
import supabase from "../lib/supabase";

export default function Home() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [threads, setThreads] = useState([]);

  useEffect(() => {
    fetchThreads();
  }, []);

  async function fetchThreads() {
    const { data } = await supabase.from("threads").select("*").order("created_at", { ascending: false });
    setThreads(data);
  }

  async function createThread() {
    if (!title || !description || !image) return alert("Please fill out all fields");

    const fileName = `${Date.now()}_${image.name}`;
    const { data, error } = await supabase.storage.from("images").upload(fileName, image);
    if (error) return alert("Error uploading image");

    const { publicURL } = supabase.storage.from("images").getPublicUrl(fileName);
    await supabase.from("threads").insert([{ title, description, image_url: publicURL }]);

    setTitle("");
    setDescription("");
    setImage(null);
    fetchThreads();
  }

  // ✅ THIS IS THE ONLY `return` NEEDED:
  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
      <img
        src="https://i.imgur.com/FOI59cJ.jpg" // Direct image link
        alt="Temporary Image"
        className="rounded-lg shadow-lg"
      />
    </div>
  );
}
