<!------------------------------------------------------
Copyright (c) 2024 Yuxuan Zhang, robotics@z-yx.cc
This source code is licensed under the MIT license.
You may find the full license in project root directory.
--------------------------------------------------------
TODO: Add description for this file
------------------------------------------------------->

<script setup lang="ts">
import { gamepad, lStick, rStick, buttons } from "./gamepad.ts";
import ControllerStick from "./Instruments/ControllerStick.vue";
import ControllerButton from "./Instruments/ControllerButton.vue";
</script>

<template>
  <div class="controller-view" style="width: 32rem; flex-grow: 0">
    <template v-if="gamepad">
      <div>
        <h1>{{ gamepad.id }}</h1>
      </div>
      <div class="row-layout" style="justify-content: space-evenly">
        <ControllerStick
          style="max-width: 8rem"
          :x="lStick.x"
          :y="lStick.y"
          text="L"
        />
        <ControllerStick
          style="max-width: 8rem"
          :x="rStick.x"
          :y="rStick.y"
          text="R"
        />
      </div>
      <div
        style="
          display: flex;
          flex-direction: row;
          flex-wrap: wrap;
          justify-content: flex-start;
        "
      >
        <template v-for="(v, i) in buttons" :key="i">
          <ControllerButton
            style="width: 2rem; margin: 0.4em"
            :v="v"
            :text="i.toString().padStart(2, '0')"
          />
        </template>
      </div>
    </template>
    <template v-else>
      <h1>Controller Disconnected</h1>
      <p>Press/push any key on your controller to get it connected.</p>
    </template>
  </div>
</template>

<style scoped lang="scss">
div.controller-view {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;

  & > * {
    width: 100%;
    margin: 0 0 2rem 0;
  }

  h1 {
    font-size: 1.2em;
    max-width: calc(50vw - 4rem);
    text-wrap: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    color: #888;
    margin: 0;
  }

  p {
    max-width: calc(50vw - 4rem);
    color: #555;
  }
}
</style>
./gamepad.ts
