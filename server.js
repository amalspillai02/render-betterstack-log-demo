const http = require("node:http");

const PORT = Number(process.env.PORT || 3000);

function log(level, message, fields = {}) {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    service: "render-betterstack-log-demo",
    message,
    ...fields
  }));
}

const server = http.createServer((req, res) => {
  const requestId = crypto.randomUUID();
  const startedAt = Date.now();
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);

  if (url.pathname === "/health") {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ status: "ok" }));
    log("info", "Health check requested", {
      requestId,
      method: req.method,
      path: url.pathname,
      statusCode: 200,
      durationMs: Date.now() - startedAt
    });
    return;
  }

  if (url.pathname === "/demo-error") {
    res.writeHead(500, { "content-type": "application/json" });
    res.end(JSON.stringify({ error: "Intentional demo error", requestId }));
    log("error", "Intentional demo error endpoint called", {
      requestId,
      method: req.method,
      path: url.pathname,
      statusCode: 500,
      durationMs: Date.now() - startedAt
    });
    return;
  }

  if (url.pathname === "/") {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({
      message: "Render → Better Stack log demo is running",
      endpoints: ["/", "/health", "/demo-error"]
    }));
    log("info", "Homepage requested", {
      requestId,
      method: req.method,
      path: url.pathname,
      statusCode: 200,
      durationMs: Date.now() - startedAt
    });
    return;
  }

  res.writeHead(404, { "content-type": "application/json" });
  res.end(JSON.stringify({ error: "Not found", path: url.pathname, requestId }));
  log("warn", "Route not found", {
    requestId,
    method: req.method,
    path: url.pathname,
    statusCode: 404,
    durationMs: Date.now() - startedAt
  });
});

const crypto = require("node:crypto");

server.listen(PORT, "0.0.0.0", () => {
  log("info", "Server started", { port: PORT, nodeVersion: process.version });
});

// Emit a small heartbeat periodically so log forwarding can be tested without
// needing someone to make requests. This is deliberately low-volume.
const heartbeat = setInterval(() => {
  log("info", "Heartbeat", { uptimeSeconds: Math.floor(process.uptime()) });
}, 30000);

function shutdown(signal) {
  log("info", "Shutdown requested", { signal });
  clearInterval(heartbeat);
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
