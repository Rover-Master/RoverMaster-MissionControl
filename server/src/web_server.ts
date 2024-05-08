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
import { WebSocketServer, type WebSocket } from "ws";
import { resolve } from "path";
import { fileURLToPath } from "url";

import hub, { type RosMessage } from "./event";

// In dist folder, web-static will be available at the same folder as this file
const webRoot = resolve(fileURLToPath(import.meta.url), "..", "web-static");

export default function createHttpWebServer(port = 8080) {
  const app = express().use(express.static(webRoot));
  const server = app.listen(port, () =>
    console.log("[INFO]", `Web server listening http://localhost:${port}`),
  );

  const sockets = new Set<WebSocket>();
  const wsServer = new WebSocketServer({ server });

  wsServer.on("connection", (socket, req) => {
    const remoteAddress =
      req.headers["x-forwarded-for"] || req.socket.remoteAddress;

    // Register Socket
    console.log("[INFO]", "WebSocket connected from", remoteAddress);
    sockets.add(socket);

    // Attach error handler
    socket.on("error", (e) => {
      console.error("[ERROR]", e);
      try {
        socket.close();
      } catch (e) {}
    });

    // Attach incoming data handler
    socket.on("message", (data) => {
      hub.dispatchEvent(new CustomEvent("client->robot", { detail: data }));
    });

    // Attach event listener for close event, detach event listener
    socket.on("close", () => {
      console.log("[INFO]", "WebSocket disconnected from", remoteAddress);
      sockets.delete(socket);
    });
  });

  hub.addEventListener("robot->client", (event) => {
    const data = (event as RosMessage).detail;
    for (const socket of sockets) {
      socket.send(data, (e) => {
        if (e instanceof Error) {
          console.error(
            "[ERROR]",
            "when sending websocket message to web client:",
            e,
          );
          socket.close();
        }
      });
    }
  });

  hub.addEventListener("shutdown", () => {
    for (const socket of sockets) {
      socket.close();
    }
    wsServer.close();
  });
}
