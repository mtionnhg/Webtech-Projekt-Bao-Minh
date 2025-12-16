<script setup lang="ts">
import { RouterView } from 'vue-router'
import Header from "@/components/Header.vue";
</script>

<template>
  <Header></Header>
  <RouterView />
</template>

<style>
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif;
}

input {
  border: 0;
  border-radius: 8px;
  width: 100%;
  height: 20px;
}
</style>
