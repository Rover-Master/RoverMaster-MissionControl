<!------------------------------------------------------
Copyright (c) 2024 Yuxuan Zhang, robotics@z-yx.cc
This source code is licensed under the MIT license.
You may find the full license in project root directory.
--------------------------------------------------------
TODO: Add description for this file
------------------------------------------------------->

<script setup lang="ts">
const props = defineProps({
  x: Number,
  y: Number,
  text: {
    type: String,
    default: "",
  },
});
function x() {
  return 50 * (props.x ?? 0);
}
function y() {
  return 50 * (props.y ?? 0);
}
</script>

<template>
  <svg
    class="controller-stick"
    viewBox="-90 -90 180 180"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle class="active-area" cx="0" cy="0" r="90" style="opacity: 0.1" />
    <circle class="outer-ring" cx="0" cy="0" r="74" />
    <circle class="stick-head" :cx="x()" :cy="y()" r="24" />
    <text
      :x="x()"
      dy="4"
      :y="y()"
      dominant-baseline="middle"
      text-anchor="middle"
      v-if="text"
    >
      {{ text }}
    </text>
  </svg>
</template>

<style scoped lang="scss">
svg.controller-stick {
  margin: 0 1em;

  .outer-ring {
    stroke-width: 2pt;
    stroke: #444;
    fill: none;
  }

  .stick-head {
    stroke-width: 4pt;
    stroke: #aaa;
    fill: #eee;
  }

  text {
    font-size: 24pt;
    font-weight: bold;
    fill: #123;
  }
}
</style>
