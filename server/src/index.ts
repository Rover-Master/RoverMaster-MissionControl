/* ---------------------------------------------------------
 * Copyright (c) 2024 Yuxuan Zhang, robotics@z-yx.cc
 * This source code is licensed under the MIT license.
 * You may find the full license in project root directory.
 * ------------------------------------------------------ */

import createUnixSocketServer from "./unix_socket.js";
import createHttpWebServer from "./web_server.js";

const unix_server = createUnixSocketServer();
const http_server = createHttpWebServer();

// Close server on SIGINT
process.on("SIGINT", () => {
  console.log("[INFO]", "Received SIGINT, closing servers...");
  unix_server.close();
  http_server.close();
});
