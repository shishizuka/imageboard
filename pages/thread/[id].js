import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import supabase from "../../lib/supabase";

export default function ThreadPage() {
  const router = useRouter();
  const { id } = router.query;
  const [thread, setThread] = useState(null);
  const [replies, setReplies] = useState([]);
  const [reply, setReply] = useState("");

  useEffect(() => {
    if (id) {
      fetchThread();
      fetchReplies();
    }
  }, [id]);

  async function fetchThread() {
    const { data } = await supabase.from("threads").select("*").eq("id", id).single();
    setThread(data);
  }

  async function fetchReplies() {
    const { data } = await supabase.from("replies").select("*").eq("thread_id", id);
    setReplies(data);
  }

  async function postReply() {
    if (!reply) return;
    await supabase.from("replies").insert([{ thread_id: id, content: reply }]);
    setReply("");
    fetchReplies();
  }

  return thread ? (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-gray-800">{thread.title}</h1>
        <p className="text-gray-600 mt-2">{thread.description}</p>
        {thread.image_url && (
          <img src={thread.image_url} alt="Thread image" className="w-full mt-4 rounded-lg shadow-sm" />
        )}
      </div>

      <div className="max-w-2xl mx-auto mt-8">
        <h2 className="text-2xl font-semibold text-gray-700">Replies</h2>
        {replies.map((r) => (
          <div key={r.id} className="bg-white p-4 mt-4 rounded-lg shadow-sm">
            <p>{r.content}</p>
          </div>
        ))}

        <textarea
          className="w-full p-3 border border-gray-300 rounded mt-6"
          placeholder="Write a reply..."
          value={reply}
          onChange={(e) => setReply(e.target.value)}
        />
        <button
          className="w-full bg-blue-600 text-white py-3 rounded-lg mt-4 hover:bg-blue-700 transition-all"
          onClick={postReply}
        >
          Post Reply
        </button>
      </div>
    </div>
  ) : (
    <p>Loading...</p>
  );
}
