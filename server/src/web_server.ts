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
import { createProxyMiddleware } from "http-proxy-middleware";
import WebSocket, { WebSocketServer } from "ws";
import { resolve } from "path";
import { fileURLToPath } from "url";

import hub, { type RosMessage } from "./event";

// In dist folder, web-static will be available at the same folder as this file
const webRoot = resolve(fileURLToPath(import.meta.url), "..", "web-static");

export default function createHttpWebServer(
  port = 8080,
  devHost: string | undefined = undefined,
) {
  const app = express();
  if (devHost !== undefined) {
    // Proxy web static assets to dev server
    console.log("[INFO]", "Proxying static assets to", devHost);
    app.use(
      createProxyMiddleware({
        target: `http://${devHost}/`,
        changeOrigin: true,
        // ws: true,
      }),
    );
  } else {
    // Use local static files
    console.log("[INFO]", "Serving static assets from", webRoot);
    app.use(express.static(webRoot));
  }

  const server = app.listen(port, () =>
    console.log("[INFO]", `Web server listening http://localhost:${port}`),
  );

  const sockets = new Set<WebSocket>();
  const wsServer = new WebSocketServer({
    server,
    handleProtocols(protocols, request) {
      if (protocols.has("vite-hmr")) {
        return "vite-hmr";
      }
      return false;
    },
  });

  wsServer.on("connection", (socket, req) => {
    socket.binaryType = "arraybuffer";
    const remoteAddress =
      req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    // Check for vite-hmr protocol
    if (devHost !== undefined && socket.protocol === "vite-hmr") {
      console.log("[INFO]", "Vite HMR socket forwarded to", devHost);
      const proxy = new WebSocket(`ws://${devHost}/`, socket.protocol);
      proxy.on("message", (message) => socket.send(message.toString()));
      socket.on("message", (message) => proxy.send(message.toString()));
      proxy.on("error", (e) => {
        console.error("[ERROR] HMR Socket:");
        proxy.close();
      });
      socket.on("error", (e) => {
        console.error("[ERROR] HMR Socket:");
        socket.close();
      });
      proxy.on("close", () => socket.close());
      socket.on("close", () => proxy.close());
      hub.addEventListener("shutdown", () => {
        proxy.close();
        socket.close();
      });
      return;
    }

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
      hub.dispatchEvent(
        new CustomEvent("client->robot", { detail: data.toString() }),
      );
    });

    // Attach event listener for close event, detach event listener
    socket.on("close", () => {
      console.log("[INFO]", "WebSocket disconnected from", remoteAddress);
      sockets.delete(socket);
    });
  });

  hub.addEventListener("robot->client", (event) => {
    const data = (event as RosMessage).detail.toString();
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
