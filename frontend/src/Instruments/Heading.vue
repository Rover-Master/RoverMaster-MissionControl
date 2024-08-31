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
const heading = computed(() => `${-robot.state.attitude.angular.z}`);
type MarkerLine = [
  angle: number,
  mark: string | undefined,
  length: number,
  bold: boolean,
];
const markerLines = Array.from({ length: 360 / 5 }, (_, i) => {
  const a = i * 5;
  // Primary Ticks - N, S, W, E
  if (a === 0) return [0, "N", 8, true];
  if (a === 90) return [90, "E", 8, true];
  if (a === 180) return [180, "S", 8, true];
  if (a === 270) return [270, "W", 8, true];
  // Secondary Ticks - 30 deg apart, shown as div by 10
  if (a % 30 === 0) return [a, (a / 10).toString().padStart(2, "0"), 6, false];
  // Tertiary Ticks - 5 deg apart, shown as short ticks
  return [a, undefined, 4, false];
}) as MarkerLine[];
const arrow = [d.M(0, -16), d.L(12, 16), d.L(0, 8), d.L(-12, 16), d.Z].join(
  " ",
);
</script>

<template>
  <svg
    class="heading-panel"
    viewBox="-60 -60 120 130"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <clipPath id="heading-panel-mask">
        <circle r="50" />
      </clipPath>
    </defs>
    <g class="panel" clip-path="url(#heading-panel-mask)">
      <!-- Background -->
      <rect x="-60" y="-60" width="120" height="120" fill="#FFF1" />
      <!-- Pitch Indicator -->
      <g class="swatch">
        <!-- Marker lines -->
        <g v-for="([angle, mark, length, bold], i) in markerLines" :key="i">
          <g :style="{ transform: `rotate(${angle}deg)` }">
            <line
              :y1="50 - length"
              y2="50"
              stroke="white"
              :stroke-width="bold ? 0.8 : 0.6"
              :opacity="bold ? 0.8 : 0.6"
            />
            <text
              :y="bold ? -36 : -40"
              dy="0.6"
              dominant-baseline="middle"
              text-anchor="middle"
              :style="{
                fontSize: bold ? '8px' : '6px',
                fontWeight: bold ? 'bolder' : 'bold',
                opacity: bold ? 0.8 : 0.6,
              }"
              v-if="mark !== undefined"
            >
              {{ mark }}
            </text>
          </g>
        </g>
      </g>
      <!-- Arrow Mark -->
      <g class="arrow" :style="{ transform: `rotate(${heading}deg)` }">
        <path :d="arrow" fill="none" stroke="white" opacity="0.8" />
        <path d="M 0 -30 L 0 -21 Z" stroke="white" opacity="0.6" />
        <path d="M 0 30 L 0 16 Z" stroke="white" opacity="0.6" />
      </g>
    </g>
    <!-- Text Annotation -->
    <text
      y="60"
      dominant-baseline="middle"
      text-anchor="middle"
      style="opacity: 0.8"
    >
      HEADING
    </text>
  </svg>
</template>

<style scoped lang="scss">
svg.heading-panel {
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
