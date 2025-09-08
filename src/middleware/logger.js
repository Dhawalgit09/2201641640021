import { Log } from "../../logger-middleware/src/index.js";

export function requestLogger(req, res, next) {
    const started = Date.now();
    res.on("finish", () => {
      const ms = Date.now() - started;
      const msg = `${req.method} ${req.originalUrl || req.url} -> ${res.statusCode} in ${ms}ms`;
      Log("backend", "info", "route", msg);
    });
    next();
  }
  
  