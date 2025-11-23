<script setup>
import { RouterView } from 'vue-router';
import NavBar from './components/NavBar.vue';
import FooterBar from './components/FooterBar.vue';
</script>

<template>
  <div>
    <NavBar />
    <RouterView />
    <FooterBar />
  </div>
</template>
