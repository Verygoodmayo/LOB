import express from "express";
import cors from "cors";
import pageRouter from "./routes/page";
import searchRouter from "./routes/search";

const app = express();
const PORT = process.env["PORT"] ?? 3001;

const allowedOrigins = process.env["ALLOWED_ORIGINS"]
  ? process.env["ALLOWED_ORIGINS"].split(",")
  : ["http://localhost:3000"];

app.use(cors({ origin: allowedOrigins, methods: ["GET", "POST"] }));
app.use(express.json());

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.use("/page", pageRouter);
app.use("/search", searchRouter);

app.listen(PORT, () => {
  console.log(`LOB backend running on port ${PORT}`);
});
