import app from "./app.js";
import mongoose from "mongoose";

const PORT = process.env.PORT || 8080;
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://zrfabhi:Abhi321@cluster0.zauhush.mongodb.net/shorturl?retryWrites=true&w=majority&appName=Cluster0";

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB ");
    app.listen(PORT, () => {
      console.log(`Short URL service running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection failed ", err);
  });
