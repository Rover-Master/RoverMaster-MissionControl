/* --------------------------------------------------------
 * Copyright (c) 2024 Yuxuan Zhang, robotics@z-yx.cc
 * This source code is licensed under the MIT license.
 * You may find the full license in project root directory.
 * ---------------------------------------------------------
 * Event hub for all events
 * 1. "client->robot"
 * 2. "robot->client"
 * ------------------------------------------------------ */

const hub = new EventTarget();
// hub.addEventListener("client->robot", (event) => {
//     console.log(event.detail);
// });
// hub.dispatchEvent(
//   new CustomEvent("client->robot", { detail: "Hello, world!" })
// );
export default hub;

export type RosMessage = CustomEvent<string>;
