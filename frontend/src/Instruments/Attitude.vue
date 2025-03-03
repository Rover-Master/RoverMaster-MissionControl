<!------------------------------------------------------
Copyright (c) 2024 Yuxuan Zhang, robotics@z-yx.cc
This source code is licensed under the MIT license.
You may find the full license in project root directory.
--------------------------------------------------------
Attitude Instrument Panel (Pitch & Roll)
------------------------------------------------------->

<script setup lang="ts">
import robot from "../robot";
import d from "../svg";
import { computed } from "vue";
const pitch = computed(() => `${-robot.state.attitude.angular.y}`);
const roll = computed(() => `${robot.state.attitude.angular.x}`);
const markerLines = Array.from({ length: 13 }, (_, i) => (i - 7) * 15);
const get_mask = (a: number, r: number, x: number = 0, y: number = 0) =>
  [
    [d.M(x - a, y - (a - r)), d.A(r, r, 0, 0, 1, x - (a - r), y - a)],
    [d.L(x + (a - r), y - a), d.A(r, r, 0, 0, 1, x + a, y - (a - r))],
    [d.L(x + a, y + (a - r)), d.A(r, r, 0, 0, 1, x + (a - r), y + a)],
    [d.L(x - (a - r), y + a), d.A(r, r, 0, 0, 1, x - a, y + (a - r))],
    d.Z,
  ]
    .flat()
    .map((e) => e.toString())
    .join(" ");
</script>

<template>
  <svg
    class="attitude-panel"
    viewBox="-60 -60 120 130"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <clipPath id="attitude-panel-mask">
        <path :d="get_mask(50, 20)" />
      </clipPath>
    </defs>
    <g class="panel" clip-path="url(#attitude-panel-mask)">
      <!-- Pitch Indicator -->
      <g class="pitch-indicator">
        <g
          :style="{
            transform: `translateY(${pitch}px)`,
          }"
        >
          <rect x="-50" y="-100" width="100" height="100" class="sky"></rect>
          <rect x="-50" y="0" width="100" height="100" class="ground"></rect>
          <!-- Marker lines -->
          <g v-for="a in markerLines" :key="a">
            <line
              x1="-32"
              :y1="-a"
              x2="-10"
              :y2="-a"
              stroke="white"
              stroke-width="0.5"
              opacity="0.4"
            />
            <text
              dy="0.6"
              :y="-a"
              dominant-baseline="middle"
              text-anchor="middle"
              style="opacity: 0.5; font-size: 6px"
            >
              {{ Math.abs(a) }}
            </text>
            <line
              x1="10"
              :y1="-a"
              x2="32"
              :y2="-a"
              stroke="white"
              stroke-width="0.5"
              opacity="0.4"
            />
          </g>
        </g>
      </g>
      <!-- Roll Indicator -->
      <g class="roll-indicator" :style="{ transform: `rotate(${roll}deg)` }">
        <path d="M -45 0 L -12 0 Z" />
        <path d="M 45 0 L 12 0 Z" />
        <circle r="2" />
      </g>
    </g>
    <!-- Text Annotation -->
    <text
      y="60"
      dominant-baseline="middle"
      text-anchor="middle"
      style="opacity: 0.8"
    >
      Pitch & Roll
    </text>
  </svg>
</template>

<style scoped lang="scss">
svg.attitude-panel {
  margin: 0.5em;

  .pitch-indicator {
    .sky {
      fill: hsl(200, 50%, 32%);
    }

    .ground {
      fill: hsl(34, 60%, 12%);
    }
  }

  .roll-indicator {
    path {
      stroke-width: 2px;
      stroke: hsl(32, 100%, 50%);
    }

    circle {
      fill: hsl(32, 100%, 50%);
    }
  }

  text {
    font-size: 6pt;
    font-weight: bold;
    fill: #fff;
    font-family: "Courier New", Courier, monospace;
  }
}
</style>
