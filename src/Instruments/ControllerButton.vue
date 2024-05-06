<!------------------------------------------------------
Copyright (c) 2024 Yuxuan Zhang, robotics@z-yx.cc
This source code is licensed under the MIT license.
You may find the full license in project root directory.
--------------------------------------------------------
TODO: Add description for this file
------------------------------------------------------->

<script setup lang="ts">
defineProps({
    v: Number,
    text: {
        type: String,
        default: ''
    }
})
const r = 10;
function arc(p: number) {
    return [
        'M', 0, 0,
        'L', 0, -r,
        'A', r, r, 0,
        p > 0.5 ? 1 : 0, 1,
        +r * Math.sin(p * Math.PI * 2),
        -r * Math.cos(p * Math.PI * 2),
        'L', 0, 0,
        'Z'
    ].join(' ')
}
</script>

<template>
    <svg class="controller-button" viewBox="-10 -10 20 20" xmlns="http://www.w3.org/2000/svg">
        <circle class="stroke" v-if="v && v >= 1" :r="r"></circle>
        <path class="stroke" v-else-if="v && v > 0" :d="arc(v)"></path>
        <text dy="1" dominant-baseline="middle" text-anchor="middle" v-if="text">{{ text }}</text>
        <circle class="active-area" r="9.5" fill="none" stroke="#ccc" />
    </svg>
</template>

<style scoped lang="scss">
svg.controller-button {
    margin: 0.5em;

    .stroke {
        // stroke-width: 4pt;
        // stroke: hsl(239, 46%, 50%);
        fill: hsl(174, 100%, 32%);
    }

    text {
        font-size: 6pt;
        font-weight: bold;
        fill: #FFF;
    }
}
</style>
