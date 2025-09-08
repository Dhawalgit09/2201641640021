import { Log } from "../../logger-middleware/src/index.js";

export function errorHandler(err, req, res, next) {
    const status = err.status || 500;
    const msg = err.message || "Internal Server Error";
    Log("backend", status >= 500 ? "error" : "warn", "handler", msg);
    res.status(status).json({ error: true, message: msg });
  }
  
  