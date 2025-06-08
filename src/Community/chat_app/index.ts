import express from "express";
import messageRoutes from "./routes/message.route";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { app, server } from "./lib/socket";
import cors from 'cors';

dotenv.config();

app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

const PORT: string | undefined = process.env.PORT;

app.use("/api/messages", messageRoutes);

server.listen(5001, () => {
  console.log(`Server is running on Port ${PORT}`);
}); 