export interface DownloadTask {
  id: string;
  url: string;
  status: "pending" | "downloading" | "completed" | "error";
  progress: number;
  filename?: string;
}