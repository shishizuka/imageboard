import Link from "next/link";
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

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-center mb-6">📜 Imageboard Forum</h1>

      <div className="max-w-xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <input type="text" placeholder="Thread Title" className="w-full p-2 border rounded mb-2" value={title} onChange={(e) => setTitle(e.target.value)} />
        <textarea placeholder="Thread Description" className="w-full p-2 border rounded mb-2" value={description} onChange={(e) => setDescription(e.target.value)} />
        <input type="file" className="w-full mb-2" onChange={(e) => setImage(e.target.files[0])} />
        <button onClick={createThread} className="w-full bg-blue-500 text-white py-2 rounded">Post Thread</button>
      </div>

      <div className="mt-6 space-y-4">
        {threads.map((thread) => (
          <Link href={`/thread/${thread.id}`} key={thread.id} className="block bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold">{thread.title}</h2>
            <p className="text-gray-600">{thread.description}</p>
            {thread.image_url && <img src={thread.image_url} className="w-full mt-2 rounded" />}
          </Link>
        ))}
      </div>
    </div>
  );
}
