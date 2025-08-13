import { useState } from "react";
import axios from "axios";

export default function DownloadForm() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const submitDownload = async () => {
    if (!url.trim()) return;
    setLoading(true);
    try {
      await axios.post("http://localhost:5000/api/download", { url });
      setUrl("");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-2 w-full">
      <input
        type="text"
        placeholder="Enter file/telegram link..."
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className="flex-1 px-4 py-2 border rounded-lg focus:outline-none"
      />
      <button
        onClick={submitDownload}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
      >
        {loading ? "Adding..." : "Add"}
      </button>
    </div>
  );
}
