import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import type {DownloadTask} from '../types';
export default function DownloadList() {
  const [tasks, setTasks] = useState<DownloadTask[]>([]);

  useEffect(() => {
    const socket = io("http://localhost:5000");

    socket.on("task_update", (task: DownloadTask) => {
      setTasks((prev) => {
        const exists = prev.find((t) => t.id === task.id);
        if (exists) {
          return prev.map((t) => (t.id === task.id ? task : t));
        }
        return [...prev, task];
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="mt-6">
      {tasks.map((task) => (
        <div key={task.id} className="p-4 border rounded-lg mb-2">
          <p className="font-semibold">{task.filename || task.url}</p>
          <p>Status: {task.status}</p>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
            <div
              className="bg-green-500 h-2 rounded-full"
              style={{ width: `${task.progress}%` }}
            />
          </div>
          {task.status === "completed" && (
            <a
              href={`http://localhost:5000/files/${task.filename}`}
              className="text-blue-600 underline mt-2 block"
              target="_blank"
              rel="noopener noreferrer"
            >
              Open File
            </a>
          )}
        </div>
      ))}
    </div>
  );
}
