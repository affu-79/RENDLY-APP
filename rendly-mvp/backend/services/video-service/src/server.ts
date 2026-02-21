import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3005;

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "OK", service: "video-service" });
});

app.get("/api/video/status", (_req, res) => {
  res.json({ message: "Video service is running" });
});

app.use((_err: unknown, _req: express.Request, res: express.Response) => {
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Video service running on port ${PORT}`);
});
