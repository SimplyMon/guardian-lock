<template>
  <div class="dashboard-container">
    <sidebar @logout="emitLogout" />
    <main class="main-content">
      <slot />
    </main>
    <bottomNav @logout="emitLogout" />
  </div>
</template>

<script setup>
import { defineEmits } from "vue";
import sidebar from "../Layout/sidebar.vue";
import bottomNav from "../Layout/bottomNav.vue";

const emit = defineEmits(["logout"]);

const emitLogout = () => {
  emit("logout");
};
</script>

<style scoped>
.dashboard-container {
  min-height: 100vh;
  padding: 10px;
  background-color: #1c1c20;
}

.bottom-nav {
  display: none;
}

@media (max-width: 768px) {
  .sidebar {
    display: none;
  }

  .main-content {
    margin: 0;
    padding-bottom: 72px;
  }

  .bottom-nav {
    display: flex;
  }
}
</style>
