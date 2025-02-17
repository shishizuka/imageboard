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

      {/* Create Thread Form */}
      <div className="max-w-xl mx-auto bg-white p-6 rounded-lg shadow-md mt-8">
        <input
          type="text"
          placeholder="Thread Title"
          className="w-full p-3 border border-gray-300 rounded mt-4"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          placeholder="Thread Description"
          className="w-full p-3 border border-gray-300 rounded mt-4"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          type="file"
          className="w-full mt-4 text-sm"
          onChange={(e) => setImage(e.target.files[0])}
        />
        <button
          onClick={createThread}
          className="w-full bg-blue-600 text-white py-3 rounded-lg mt-6 hover:bg-blue-700 transition-all"
        >
          Post Thread
        </button>
      </div>

      {/* Threads Display */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {threads.map((thread) => (
          <a
            href={`/thread/${thread.id}`}
            key={thread.id}
            className="block bg-white p-4 rounded-lg shadow-md hover:bg-gray-100 transition-all"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800">{thread.title}</h2>
              <span className="text-xs text-gray-500">
                {new Date(thread.created_at).toLocaleDateString()}
              </span>
            </div>
            <p className="text-gray-600 mt-2">{thread.description}</p>
            {thread.image_url && (
              <img src={thread.image_url} alt="Thread image" className="w-full mt-4 rounded-lg shadow-sm" />
            )}
          </a>
        ))}
      </div>
    </div>
  );
}
