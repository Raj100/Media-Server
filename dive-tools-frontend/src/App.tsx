// import DownloadForm from "./ components/DownloadForm";
// import DownloadList from "./ components/DownloadList";

// export default function App() {
//   return (
//     <div className="max-w-2xl mx-auto p-6">
//       <h1 className="text-3xl font-bold mb-4">Dive Tools Dashboard</h1>
//       <DownloadForm />
//       <DownloadList />
//     </div>
//   );
// }


import { useState } from "react";
import StatusBar from "./ components/StatusBar";

function App() {
  const [webUrl, setWebUrl] = useState("");
  const [telegramUrl, setTelegramUrl] = useState("");

  const startWebDownload = async () => {
    await fetch("http://localhost:5000/download/web", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: webUrl }),
    });
  };

  const startTelegramDownload = async () => {
    await fetch("http://localhost:5000/download/telegram", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ telegramLink: telegramUrl }),
    });
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Dive Tools</h1>

      <div className="space-y-4">
        <div>
          <input
            type="text"
            placeholder="Enter web URL"
            value={webUrl}
            onChange={(e) => setWebUrl(e.target.value)}
            className="border p-2 rounded w-full"
          />
          <button
            onClick={startWebDownload}
            className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
          >
            Download from Web
          </button>
        </div>

        <div>
          <input
            type="text"
            placeholder="Enter Telegram link"
            value={telegramUrl}
            onChange={(e) => setTelegramUrl(e.target.value)}
            className="border p-2 rounded w-full"
          />
          <button
            onClick={startTelegramDownload}
            className="bg-green-500 text-white px-4 py-2 rounded mt-2"
          >
            Download from Telegram
          </button>
        </div>
      </div>

      <StatusBar />

      <div className="space-y-4">
        <h2 className="text-lg font-bold">Live Streaming</h2>
        <video controls className="w-full max-w-lg border rounded" src="http://localhost:5000/stream/sample.mp4"></video>
      </div>
    </div>
  );
}

export default App;
