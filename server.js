import {connectDB} from "./config/database.js";
import express from "express";
import app from "./app.js";
import { config } from "dotenv";
const PORT = 3000;


config({
    path:'./.env',
  });

connectDB();

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});