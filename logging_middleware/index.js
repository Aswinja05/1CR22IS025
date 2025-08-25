const axios = require("axios");

let accessToken = null;

async function getAuthToken() {
  try {
    const res = await axios.post("http://20.244.56.144/evaluation-service/auth", {
      email: "asja22ise@cmrit.ac.in",
      name: "Aswin J A",
      rollNo: "1CR22IS025",
      accessCode: "yUVQXK",
      clientID: "18373b90-3bd0-414e-b3b7-2c724201351b",
      clientSecret: "NByRcjsQFbDCRwYk"
    }, { headers: { "Content-Type": "application/json" } });

    accessToken = res.data.access_token;
    console.log("Auth token received for logging middleware");
  } catch (err) {
    console.error("Failed to get token:", err.response?.data || err.message);
  }
}
getAuthToken();

async function Log(stack, level, packageName, message) {
  try {
    const res=await axios.post(
      "http://20.244.56.144/evaluation-service/logs",
      { stack, level, package: packageName, message },
      { headers: { "Content-Type": "application/json", "Authorization": `Bearer ${accessToken}` } }
    );
    
    console.log("Auth Response:", res.data);
  } catch (err) {
    console.error("Logging failed:", err.message);
  }
}

function loggingMiddleware(req, res, next) {
  const start = Date.now();

  res.on("finish", async () => {
    const duration = Date.now() - start;
    await Log(
      "backend",
      res.statusCode >= 400 ? "error" : "info",
      "middleware",
      `${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`
    );
  });

  next();
}

module.exports = { loggingMiddleware, Log };
