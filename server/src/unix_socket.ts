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

export default function createUnixSocketServer(
  path = "/tmp/ros-web-agent.sock"
) {
  ensure_removed(path);
  // Create UNIX socket server
  const server = net.createServer((socket) => {
    const { remoteAddress } = socket;
    console.log("[INFO]", `ROS agent ${remoteAddress} connected`);
    // Attach event listener for incoming data and close event
    socket.on("data", (data) => {
      hub.dispatchEvent(new CustomEvent("robot->client", { detail: data }));
    });
    // Attach event listener for inbound data
    const listener = (event: Event) => {
      const data = (event as RosMessage).detail;
      socket.write(data, (e) => {
        console.error("[ERROR]", e, "to", remoteAddress);
        socket.destroy();
      });
    };
    hub.addEventListener("client->robot", listener);
    // Attach event listener for close event, detach event listener
    socket.on("close", () => {
      hub.removeEventListener("client->robot", listener);
      console.log("[INFO]", `ROS agent ${remoteAddress} disconnected`);
    });
  });

  // Start listening on UNIX socket
  server.listen(path, () => {
    console.log("[INFO]", `Listening unix://${path}`);
  });

  // Remove UNIX socket on server close
  server.on("close", () => {
    ensure_removed(path);
  });

  return server;
}
