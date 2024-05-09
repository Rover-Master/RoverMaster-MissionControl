/* --------------------------------------------------------
 * Copyright (c) 2024 Yuxuan Zhang, robotics@z-yx.cc
 * This source code is licensed under the MIT license.
 * You may find the full license in project root directory.
 * ---------------------------------------------------------
 * TODO: Add description for this file
 * ------------------------------------------------------ */

import { existsSync, unlinkSync } from "fs";
import net from "net";
import hub, { type RosMessage } from "./event";

function ensure_removed(path: string) {
  // Remove existing UNIX socket if exists
  if (existsSync(path)) {
    console.log("[INFO]", "Removing socket", path);
    unlinkSync(path);
  }
}

export default function createUnixSocketServer(path = "/tmp/ros-agent.sock") {
  ensure_removed(path);
  const sockets = new Set<net.Socket>();
  // Create UNIX socket server
  const server = net.createServer((socket) => {
    const { remoteAddress = "<unix socket>" } = socket;

    // Register socket
    console.log("[INFO]", `ROS agent ${remoteAddress} connected`);
    sockets.add(socket);

    // Attach error handler
    socket.on("error", (e) => {
      console.error("[ERROR]", remoteAddress, e.message);
      try {
        socket.destroy();
      } catch (e) {}
    });

    // Attach incoming data handler
    socket.on("data", (data) => {
      hub.dispatchEvent(new CustomEvent("robot->client", { detail: data }));
    });

    // Remove hub event listener upon socket close
    socket.on("close", () => {
      console.log("[INFO]", `ROS agent ${remoteAddress} disconnected`);
      sockets.delete(socket);
    });
  });

  // Listen for outbound message
  hub.addEventListener("client->robot", (event) => {
    const data = (event as RosMessage).detail;
    for (const socket of sockets) {
      socket.write(data, (e) => {
        if (e instanceof Error) {
          console.error("[ERROR]", "when sending data to ROS agent:", e);
          try {
            socket.destroy();
          } catch (e) {}
        }
      });
    }
  });

  // Add listener for server termination
  hub.addEventListener("shutdown", () => {
    for (const socket of sockets) {
      socket.destroy();
    }
    server.close();
  });

  // Start listening on UNIX socket
  server.listen(path, () => {
    console.log("[INFO]", `Listening unix://${path}`);
  });

  // Remove UNIX socket on server close
  server.on("close", () => {
    ensure_removed(path);
  });
}
