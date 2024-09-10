import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
dotenv.config();
import { UserRouter } from "./routes/User.js";
// import { UrlRouter } from "./routes/url.js";

const app = express();
app.use(express.json());
app.use(cors());
app.use(cookieParser());
app.use("/auth", UserRouter);
// app.use('/url', UrlRouter);

mongoose.connect(
  "mongodb+srv://ragulsingh6245:yellowflash@cluster0.9eajjlf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
);

app.listen(process.env.PORT, () => {
  console.log("Server is running on port " + process.env.PORT);
});
