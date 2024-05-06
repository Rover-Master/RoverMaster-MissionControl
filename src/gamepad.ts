/* ---------------------------------------------------------
 * Copyright (c) 2024 Yuxuan Zhang, robotics@z-yx.cc
 * This source code is licensed under the MIT license.
 * You may find the full license in project root directory.
 * ------------------------------------------------------
 * TODO: Add description for this file
 * ------------------------------------------------------ */

import robot from "./robot.ts";
import { gamepadToRobotTopic } from "./mappings.ts";
import { ref, watch } from "vue";
// Current gamepad device in use
export const gamepad = ref<Gamepad | null>(null),
  lStick = ref({ x: 0, y: 0 }),
  rStick = ref({ x: 0, y: 0 }),
  buttons = ref<number[]>([]);
const threshold = 0.1;
function deadzone(value: number) {
  return Math.abs(value) < threshold ? 0 : value;
}
function updateSticks() {
  if (!gamepad.value) {
    for (const device of navigator.getGamepads()) {
      if (device) {
        gamepad.value = device;
        break;
      }
    }
    return;
  }
  const device = navigator.getGamepads()[gamepad.value.index];
  if (!device) return;
  [lStick.value.x, lStick.value.y, rStick.value.x, rStick.value.y] = device.axes
    .slice(0, 4)
    .map(deadzone);
  buttons.value = device.buttons.map((b) => b.value);
}
// Update sticks every frame
(async () => {
  while (true) {
    await new Promise((res) => requestAnimationFrame(res));
    updateSticks();
  }
})();
// Upon gamepad disconnection, use another one if possible
watch(gamepad, (gp) => {
  if (gp !== null) return;
  const gamepads = navigator.getGamepads();
  if (gamepads.length > 0) gamepad.value = gamepads[0];
  else gamepad.value = null;
});
document.addEventListener("load", () => {
  const gamepads = navigator.getGamepads();
  if (gamepads.length > 0) gamepad.value = gamepads[0];
});
// Listen for gamepad connection
window.addEventListener("gamepadconnected", (e) => {
  console.log(
    e.gamepad.id,
    "connected at index",
    e.gamepad.index,
    `(`,
    e.gamepad.buttons.length,
    `buttons, `,
    e.gamepad.axes.length,
    `axes).`
  );
  gamepad.value = e.gamepad;
});
window.addEventListener("gamepaddisconnected", (e) => {
  console.log(
    "Gamepad disconnected from index %d: %s",
    e.gamepad.index,
    e.gamepad.id
  );
  if (gamepad.value?.index === e.gamepad.index) gamepad.value = null;
});
// Send gamepad data to robot
setInterval(() => {
  if (!gamepad.value) return;
  if (!robot.state.connected) return;
  for (const [topic, data] of gamepadToRobotTopic(
    lStick.value,
    rStick.value,
    buttons.value,
    gamepad.value
  )) {
    robot.send(`${topic}\t${JSON.stringify(data)}\n`);
  }
}, 1000 / 30);
