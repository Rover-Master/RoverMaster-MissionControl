/* --------------------------------------------------------
 * Copyright (c) 2024 Yuxuan Zhang, robotics@z-yx.cc
 * This source code is licensed under the MIT license.
 * You may find the full license in project root directory.
 * ---------------------------------------------------------
 * HTTP web server for:
 * 1. Serving the Single Page Application
 * 2. WebSocket server for client
 * ------------------------------------------------------ */

// Initiate HTTP/WebSocket Server for client
import express from "express";
import { WebSocketServer } from "ws";
import { resolve } from "path";
import { fileURLToPath } from "url";

import hub, { type RosMessage } from "./event";

const webRoot = resolve(fileURLToPath(import.meta.url), "..", "web-static");

export default function createHttpWebServer(port = 8080) {
  // In the dist folder, web-static will be available at the same folder as this file
  const app = express().use(express.static(webRoot));
  const server = app.listen(port, () => {
    console.log("[INFO]", `Web server listening http://localhost:${port}`);
  });
  const wsServer = new WebSocketServer({ server });

  wsServer.on("connection", function connection(ws, req) {
    const remoteAddress =
      req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    console.log("[INFO]", "WebSocket connected from", remoteAddress);
    // Error handler
    ws.on("error", (e) => {
      console.error("[ERROR]", e);
      try {
        ws.close();
      } catch (e) {}
    });
    // Incoming data handler
    ws.on("message", (data) => {
      hub.dispatchEvent(new CustomEvent("client->robot", { detail: data }));
    });
    // Outgoing data handler
    const listener = (event: Event) => {
      ws.send((event as RosMessage).detail, (e) => {
        console.error(
          "[ERROR]",
          "when sending websocket message to web client:",
          e
        );
        ws.close();
      });
    };
    hub.addEventListener("robot->client", listener);
    // Attach event listener for close event, detach event listener
    ws.on("close", () => {
      hub.removeEventListener("robot->client", listener);
      console.log("[INFO]", "WebSocket disconnected from", remoteAddress);
    });
  });

  return server;
}
