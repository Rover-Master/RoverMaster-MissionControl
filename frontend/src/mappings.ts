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
  return topics;
}

type RobotStateUpdater = (data: any, state: RobotState) => void;

export const topicToRobotSatates: Record<string, RobotStateUpdater> = {
  ["vel/get"](data, state) {},
  ["platform/pos/get"](data, state) {},
  ["imu/acc"](data, state) {
    const { linear, angular } = data;
    for (const k in linear) {
      linear[k] *= 9.8 * 2040;
    }
    Object.assign(state.accel.linear, linear);
    Object.assign(state.accel.angular, angular);
  },
  ["imu/att"](data, state) {
    const { angular } = data;
    angular.x *= 90 / 1000;
    angular.y *= 90 / 1000;
    console.log("attitude", angular);
    Object.assign(state.attitude.angular, angular);
  },
  ["imu"](data, state) {
    return console.log("imu", data);
    const { angular } = data;
    angular.x *= 90 / 1000;
    angular.y *= 90 / 1000;
    console.log("attitude", angular);
    Object.assign(state.attitude.angular, angular);
  },
  ["info"](data, state) {},
};
