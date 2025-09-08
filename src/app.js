import express from "express";
import mongoose from "mongoose";
import urlRouter from "./routes/url.route.js";
import { redirectShortUrl } from "./controllers/url.controller.js";
import { requestLogger } from "./middleware/logger.js";
import { errorHandler } from "./middleware/erroHandler.js";

const app = express();
app.use(express.json());

app.use(requestLogger);

app.use("/shorturls", urlRouter);
app.get("/:shortcode", redirectShortUrl);

app.use(errorHandler);

export default app;
