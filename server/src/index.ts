/* ---------------------------------------------------------
 * Copyright (c) 2024 Yuxuan Zhang, robotics@z-yx.cc
 * This source code is licensed under the MIT license.
 * You may find the full license in project root directory.
 * ------------------------------------------------------ */

import { ArgumentParser } from "argparse";
import process from "process";

import hub from "./event";
import createUnixSocketServer from "./unix_socket";
import createHttpWebServer from "./web_server";

// Initiate argument parser
const parser = new ArgumentParser({
  description: "RoverMaster Mission Control Server",
});
parser.add_argument("-p", "--port", {
  help: "Server listen port",
  default: 8080,
  type: Number,
});
parser.add_argument("-s", "--socket", {
  help: "Local unix socket path",
  default: "/tmp/ros-agent.sock",
  type: String,
});
parser.add_argument("-d", "--dev", {
  help: "Development mode, proxy static assets to given location",
  default: undefined,
  type: String,
});
const args = parser.parse_args(process.argv.slice(2));

// Create servers
createHttpWebServer(args.port, args.dev);
createUnixSocketServer(args.socket);

// Close server on SIGINT
process.on("SIGINT", () => {
  console.log("[INFO]", "Received SIGINT, closing servers...");
  hub.dispatchEvent(new Event("shutdown"));
  // Reset signal handler
  process.removeAllListeners("SIGINT");
  // Exit after 1 second
  setTimeout(() => process.exit(0), 1000).unref();
});
