/* ---------------------------------------------------------
 * Copyright (c) 2024 Yuxuan Zhang, robotics@z-yx.cc
 * This source code is licensed under the MIT license.
 * You may find the full license in project root directory.
 * ---------------------------------------------------------
 * TODO: Add description for this file
 * ------------------------------------------------------ */

import { ref } from "vue";
import { topicToRobotSatates } from "./mappings";
export const connected = ref(false);

export class Vector3D {
  x: number = 0;
  y: number = 0;
  z: number = 0;
  constructor(vec: { x?: number; y?: number; z?: number } = {}) {
    Object.assign(this, vec);
  }
}

export class Twist {
  linear: Vector3D = new Vector3D();
  angular: Vector3D = new Vector3D();
  constructor(twist: { linear?: Vector3D; angular?: Vector3D } = {}) {
    Object.assign(this, twist);
  }
}

export interface RobotState {
  connected: boolean;
  battery: number;
  cpu: number;
  memory: number;
  disk: number;
  accel: Twist;
  attitude: Twist;
  joints: number[];
}

function init_state() {
  return {
    connected: false,
    battery: 0,
    cpu: 1,
    memory: 1,
    disk: 1,
    accel: new Twist(),
    attitude: new Twist(),
    joints: [],
  };
}

class Robot extends EventTarget {
  #state = ref<RobotState>(init_state()) as any as RobotState;
  get state() {
    return this.#state;
  }

  constructor(create_ws: () => WebSocket) {
    super();
    this.#configure(create_ws);
  }

  #line_buffer = "";
  handle_message(data: string) {
    this.#line_buffer += data;
    const lines = this.#line_buffer.split("\n");
    while (lines.length > 1) {
      const line = lines.shift()?.trim();
      if (!line) continue;
      const i = this.#line_buffer.indexOf("\n");
      if (i < 0) {
        console.warn("Invalid line from robot server:", line);
        continue;
      }
      const [topic, data] = [line.slice(0, i), JSON.parse(line.slice(i + 1))];
      if (topic in topicToRobotSatates) {
        topicToRobotSatates[topic](data, this.#state);
      } else {
        console.warn("Received unknown topic from robot server:", topic, data);
      }
    }
    this.#line_buffer = lines.join("\n");
  }

  #retry_count = 0;
  #configure(create_ws: () => WebSocket) {
    const ws = (this.#ws = create_ws());
    ws.addEventListener("open", () => {
      console.log("Connected to robot server");
      this.#state.connected = true;
      this.#retry_count = 0;
    });
    ws.addEventListener("close", () => {
      this.#ws = null;
      this.#state.connected = false;
      // Retry connection after a timeout
      const timeout = Math.min(1000 * 2 ** this.#retry_count, 64_000);
      this.#retry_count++;
      // Report scheduled retry attempt
      console.warn(
        "Disconnected from robot server,",
        `reconnecting in ${timeout / 1000}s...`
      );
      setTimeout(() => this.#configure(create_ws), timeout);
    });
    ws.addEventListener("message", (e) => this.handle_message(e.data));
  }

  #ws: WebSocket | null = null;
  send(...data: (string | ArrayBufferLike | Blob | ArrayBufferView)[]) {
    const out_buf = data
      .map((d) => (typeof d === "string" ? d : JSON.stringify(d)))
      .join("");
    if (this.#state.connected && this.#ws) {
      this.#ws.send(out_buf);
    } else {
      console.warn("Robot server is not connected, message dropped:", out_buf);
    }
  }
}
// Check if current page is in HTTPS
const isSecure = window.location.protocol === "https:";
const wsProtocol = isSecure ? "wss" : "ws";
// Try to connect to websocket server
// Export robot instance
const robot = new Robot(
  () => new WebSocket(`${wsProtocol}://${window.location.host}/`)
);
export default robot;
