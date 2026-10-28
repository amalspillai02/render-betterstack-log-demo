# Render → Better Stack Log Demo

A minimal Node.js HTTP server for verifying that Render logs arrive in Better Stack. It uses Node's built-in modules and has no third-party dependencies.

## Endpoints

- `/` — returns a success response and writes an `info` log.
- `/health` — health check endpoint and an `info` log.
- `/demo-error` — intentionally returns HTTP 500 and writes an `error` log.
- Unknown paths — return HTTP 404 and write a `warn` log.
- Every 30 seconds — writes a low-volume heartbeat log.

Logs are emitted as JSON to standard output, which Render captures.

## Run locally

Requires Node.js 20 or newer.

```bash
npm start
```

Then open:

- http://localhost:3000/
- http://localhost:3000/health
- http://localhost:3000/demo-error

You should see JSON log lines in the terminal.

## Deploy to Render

1. Push this folder to a personal GitHub repository.
2. In Render, create **New → Web Service** and connect that repository.
3. Use these settings:
   - Runtime: **Node**
   - Build command: `npm install`
   - Start command: `npm start`
   - Health check path (optional): `/health`
4. Deploy the service.
5. Open the Render service's Logs tab and confirm you see `Server started` and `Heartbeat`.
6. Configure Render Log Streams to send logs to the Better Stack source, using the exact endpoint and source token shown by Better Stack. Keep the token out of GitHub and application code.
7. Open the deployed service URL, then check Better Stack's Live tail / Logs view for `Homepage requested` or `Health check requested`.
8. To test an error log, visit `/demo-error` on the deployed service and search for `Intentional demo error endpoint called`.

## Safety and cost notes

- Do not put Better Stack source tokens in this repository or in frontend code.
- The `/demo-error` route is intentionally included only to test log levels; remove it if you later reuse this app.
- The heartbeat emits one log every 30 seconds. Stop or delete the test service when you're finished to avoid unnecessary usage.
