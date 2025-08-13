import { useEffect, useState } from "react";

interface DownloadStatus {
  [fileName: string]: { status: string; progress: number };
}

export default function StatusBar() {
  const [downloads, setDownloads] = useState<DownloadStatus>({});

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:5000");
    ws.onmessage = (event) => {
      setDownloads(JSON.parse(event.data));
    };
    return () => ws.close();
  }, []);

  return (
    <div className="p-4 bg-gray-100 rounded shadow-md">
      <h2 className="text-lg font-bold mb-2">Download Status</h2>
      {Object.keys(downloads).length === 0 ? (
        <p>No downloads yet.</p>
      ) : (
        Object.entries(downloads).map(([fileName, { status, progress }]) => (
          <div key={fileName} className="mb-2">
            <div className="flex justify-between text-sm">
              <span>{fileName}</span>
              <span>{status} - {progress}%</span>
            </div>
            <div className="w-full bg-gray-300 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ))
      )}
    </div>
  );
}
