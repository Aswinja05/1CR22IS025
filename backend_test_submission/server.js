const express = require("express");
const mongoose = require("mongoose");
const shortid = require("shortid");

const { loggingMiddleware, Log } = require("../logging_middleware");
const app = express();
app.use(express.json());


app.use(loggingMiddleware);
mongoose
  .connect("mongodb://localhost:27017/urlshortener", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => {
    console.error("DB Connection Error:", err);
    Log("backend", "fatal", "db", "Database connection error");
  });

const urlSchema = new mongoose.Schema({
  url: { type: String, required: true },
  shortcode: { type: String, unique: true },
  createdAt: { type: Date, default: Date.now },
  expiry: Date,
  clicks: [
    {
      timestamp: Date,
      referrer: String,
      location: String,
    },
  ],
});

const Url = mongoose.model("Url", urlSchema);

app.post("/shorturls", async (req, res) => {
  try {
    let { url, validity = 30, shortcode } = req.body;

    if (!url) {
      await Log("backend", "error", "handler", "URL is required");
      return res.status(400).json({ error: "URL is required" });
    }

    if (!shortcode) shortcode = shortid.generate();
    const expiry = new Date(Date.now() + validity * 60 * 1000);

    const newUrl = new Url({ url, shortcode, expiry });
    await newUrl.save();

    await Log("backend", "info", "db", `Short URL created for ${url}`);
    return res.status(201).json({
      shortLink: `http://localhost:3000/${shortcode}`,
      expiry: expiry.toISOString(),
    });
  } catch (err) {
    await Log("backend", "fatal", "db", "Failed to create shortcode");
    return res
      .status(400)
      .json({ error: "Shortcode already exists or invalid input" });
  }
});

app.get("/shorturls/:shortcode", async (req, res) => {
  try {
    const { shortcode } = req.params;
    const shortUrl = await Url.findOne({ shortcode });

    if (!shortUrl) {
      await Log(
        "backend",
        "error",
        "handler",
        `Shortcode ${shortcode} not found`
      );
      return res.status(404).send("Shortcode not found");
    }

    if (new Date() > shortUrl.expiry) {
      await Log("backend", "warn", "handler", `Shortcode ${shortcode} expired`);
      return res.status(410).send("Short link expired");
    }

    return res.json({
      totalClicks: shortUrl.clicks.length,
      originalUrl: shortUrl.url,
      createdAt: shortUrl.createdAt,
      expiry: shortUrl.expiry,
      clicks: shortUrl.clicks,
    });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/:shortcode", async (req, res) => {
  try {
    const { shortcode } = req.params;
    const shortUrl = await Url.findOne({ shortcode });

    if (!shortUrl) {
      return res.status(404).send("Shortcode not found");
    }

    if (new Date() > shortUrl.expiry) {
      return res.status(410).send("Short link expired");
    }

    shortUrl.clicks.push({
      timestamp: new Date(),
      referrer: req.get("Referer") || "Direct",
      location: "Unknown",
    });

    await shortUrl.save();

    return res.redirect(shortUrl.url);
  } catch (err) {
    return res.status(500).send("Internal Server Error");
  }
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
