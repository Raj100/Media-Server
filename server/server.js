import express from "express";
import { WebSocketServer } from "ws";
import cors from "cors";
import fetch from "node-fetch";
import fs from "fs";
import path from "path";
import { spawn } from "child_process";

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// Store download statuses
let downloads = {};
let clients = [];

// WebSocket server for live updates
const wss = new WebSocketServer({ noServer: true });

wss.on("connection", (ws) => {
  clients.push(ws);
  ws.on("close", () => {
    clients = clients.filter((c) => c !== ws);
  });
});

function broadcastUpdate() {
  const data = JSON.stringify(downloads);
  clients.forEach((client) => client.send(data));
}

// Web download endpoint
app.post("/download/web", async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).send("URL required");

  const fileName = path.basename(url.split("?")[0]);
  const filePath = path.join("downloads", fileName);

  downloads[fileName] = { status: "Downloading", progress: 0 };
  broadcastUpdate();

  const response = await fetch(url);
  const fileStream = fs.createWriteStream(filePath);
  let downloaded = 0;
  const total = Number(response.headers.get("content-length")) || 0;

  response.body.on("data", (chunk) => {
    downloaded += chunk.length;
    downloads[fileName].progress = ((downloaded / total) * 100).toFixed(2);
    broadcastUpdate();
  });

  response.body.pipe(fileStream);

  fileStream.on("finish", () => {
    downloads[fileName].status = "Completed";
    downloads[fileName].progress = 100;
    broadcastUpdate();
  });

  res.json({ message: "Download started", fileName });
});

// Telegram file download endpoint
app.post("/download/telegram", (req, res) => {
  const { telegramLink } = req.body;
  if (!telegramLink) return res.status(400).send("Telegram link required");

  const fileName = `telegram_${Date.now()}.mp4`;
  const filePath = path.join("downloads", fileName);

  downloads[fileName] = { status: "Downloading", progress: 0 };
  broadcastUpdate();

  // Example using youtube-dl for telegram public links
  const ytdl = spawn("yt-dlp", ["-o", filePath, telegramLink]);

  ytdl.stdout.on("data", (data) => {
    const str = data.toString();
    const match = str.match(/(\d+\.\d+)%/);
    if (match) {
      downloads[fileName].progress = parseFloat(match[1]);
      broadcastUpdate();
    }
  });

  ytdl.on("close", () => {
    downloads[fileName].status = "Completed";
    downloads[fileName].progress = 100;
    broadcastUpdate();
  });

  res.json({ message: "Telegram download started", fileName });
});

// Serve downloads & stream media
app.use("/files", express.static("downloads"));

// Live streaming endpoint
app.get("/stream/:fileName", (req, res) => {
  const filePath = path.join("downloads", req.params.fileName);
  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunkSize = end - start + 1;
    const file = fs.createReadStream(filePath, { start, end });
    res.writeHead(206, {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunkSize,
      "Content-Type": "video/mp4",
    });
    file.pipe(res);
  } else {
    res.writeHead(200, {
      "Content-Length": fileSize,
      "Content-Type": "video/mp4",
    });
    fs.createReadStream(filePath).pipe(res);
  }
});

const server = app.listen(port, () =>
  console.log(`Server running at http://localhost:${port}`)
);

server.on("upgrade", (req, socket, head) => {
  wss.handleUpgrade(req, socket, head, (ws) => {
    wss.emit("connection", ws, req);
  });
});
