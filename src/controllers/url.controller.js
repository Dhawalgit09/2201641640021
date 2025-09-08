import ShortUrl from "../models/url.model.js";
import { generateShortCode } from "../utils/generateCode.js";
import { Log } from "../../logger-middleware/src/index.js";

export async function createShortUrl(req, res, next) {
  try {
    const { url, validity = 30, shortCode } = req.body;

    let parsedUrl;
    try {
      parsedUrl = new URL(url);
    } catch {
      Log("backend", "error", "handler", "received malformed url");
      return res.status(400).json({ message: "Invalid URL format" });
    }

    const minutes = parseInt(validity, 10);
    if (!Number.isInteger(minutes) || minutes <= 0) {
      return res.status(400).json({ message: "Validity must be a positive integer (minutes)" });
    }

    const desired = typeof shortCode === "string" ? shortCode.trim() : "";
    if (desired) {
      const ok = /^[a-zA-Z0-9]{4,32}$/.test(desired);
      if (!ok) {
        return res.status(400).json({ message: "Shortcode must be 4-32 alphanumeric characters" });
      }
      const exists = await ShortUrl.findOne({ shortCode: desired });
      if (exists) {
        return res.status(400).json({ message: "Shortcode already exists" });
      }
    }

    let code = desired || generateShortCode();
    let attempts = 0;
    while (!desired && attempts < 3) {
      const clash = await ShortUrl.findOne({ shortCode: code });
      if (!clash) break;
      code = generateShortCode();
      attempts += 1;
    }

    const expiresAt = new Date(Date.now() + minutes * 60 * 1000);

    const doc = new ShortUrl({
      shortCode: code,
      originalUrl: parsedUrl.toString(),
      expiry: expiresAt,
    });

    await doc.save();
    Log("backend", "info", "handler", `created ${code}`);

    return res.status(201).json({
      shortLink: `${req.protocol}://${req.get("host")}/${code}`,
      expiry: expiresAt.toISOString(),
    });
  } catch (err) {
    return next(err);
  }
}

export async function redirectShortUrl(req, res, next) {
  try {
    const { shortcode } = req.params;
    const record = await ShortUrl.findOne({ shortCode: shortcode });

    if (!record) {
      return res.status(404).json({ message: "Shortcode not found" });
    }

    if (new Date() > record.expiry) {
      return res.status(410).json({ message: "Short URL expired" });
    }

    record.clicks += 1;
    const ip = req.ip.trim();
    record.interactions.push({ location: ip || "unknown" });

    await record.save();
    Log("backend", "info", "route", `redirect ${shortcode}`);
    return res.redirect(record.originalUrl);
  } catch (err) {
    return next(err);
  }
}

export async function getStats(req, res, next) {
  try {
    const { shortcode } = req.params;
    const record = await ShortUrl.findOne({ shortCode: shortcode });

    if (!record) {
      return res.status(404).json({ message: "Shortcode not found" });
    }

    return res.json({
      clicks: record.clicks,
      originalUrl: record.originalUrl,
      expiry: record.expiry.toISOString(),
      interactions: record.interactions.map((i) => ({ timestamp: i.timestamp, referrer: i.referrer, location: i.location })),
    });
  } catch (err) {
    return next(err);
  }
}

