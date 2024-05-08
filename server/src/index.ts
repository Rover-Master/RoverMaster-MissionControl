/* ---------------------------------------------------------
 * Copyright (c) 2024 Yuxuan Zhang, robotics@z-yx.cc
 * This source code is licensed under the MIT license.
 * You may find the full license in project root directory.
 * ------------------------------------------------------ */

import hub from "./event";
import createUnixSocketServer from "./unix_socket";
import createHttpWebServer from "./web_server";

// Create servers
createUnixSocketServer();
createHttpWebServer();

// Close server on SIGINT
process.on("SIGINT", () => {
  console.log("[INFO]", "Received SIGINT, closing servers...");
  hub.dispatchEvent(new Event("shutdown"));
  // Reset signal handler
  process.removeAllListeners("SIGINT");
  // Exit after 1 second
  setTimeout(() => process.exit(0), 2000).unref();
});
