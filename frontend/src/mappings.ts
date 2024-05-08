/* ---------------------------------------------------------
 * Copyright (c) 2024 Yuxuan Zhang, robotics@z-yx.cc
 * This source code is licensed under the MIT license.
 * You may find the full license in project root directory.
 * ---------------------------------------------------------
 * Mappings
 * 1. from gamepad channels to robot commands
 * 2. from incoming topic to robot states
 * ------------------------------------------------------ */

import { Vector3D, Twist, type RobotState } from "./robot.ts";

type Stick = { x: number; y: number };

export function gamepadToRobotTopic(
  lStick: Stick,
  rStick: Stick,
  buttons: number[],
  _: Gamepad, // reserved for checking gamepad type
): [string, any][] {
  const topics: [string, any][] = [],
    turn_left = buttons[6] ?? 0,
    turn_right = buttons[7] ?? 0;
  // Base velocity
  topics.push([
    "vel/set",
    new Twist({
      linear: new Vector3D({
        x: -lStick.y,
        y: -lStick.x,
      }),
      angular: new Vector3D({
        z: turn_left - turn_right,
      }),
    }),
  ]);
  // Platform attitude
  topics.push([
    "platform/pos/set",
    new Twist({
      angular: new Vector3D({
        y: 90 * rStick.y,
        z: -180 * rStick.x,
      }),
    }),
  ]);
  return topics;
}

type RobotStateUpdater = (data: any, state: RobotState) => void;

export const topicToRobotSatates: Record<string, RobotStateUpdater> = {
  ["vel/get"](data, state) {},
  ["platform/pos/get"](data, state) {},
  ["imu/acc"](data, state) {},
  ["imu/att"](data, state) {},
  ["info"](data, state) {},
};
