<template>
  <nav class="bottom-nav">
    <router-link to="/dashboard" class="nav-item" aria-label="Home">
      <i class="fas fa-home icon"></i>
      <span class="label">Home</span>
    </router-link>

    <router-link
      v-if="userStore.role === 'admin'"
      to="/logs"
      class="nav-item"
      aria-label="Logs"
    >
      <i class="fas fa-clipboard-list icon"></i>
      <span class="label">Logs</span>
    </router-link>

    <router-link
      v-if="userStore.role === 'admin'"
      to="/users"
      class="nav-item"
      aria-label="Users"
    >
      <i class="fas fa-users icon"></i>
      <span class="label">Users</span>
    </router-link>

    <router-link to="/profile" class="nav-item" aria-label="Profile">
      <i class="fas fa-user icon"></i>
      <span class="label">Profile</span>
    </router-link>

    <button
      @click="$emit('logout')"
      class="nav-item logout-btn"
      aria-label="Logout"
    >
      <i class="fas fa-sign-out-alt icon"></i>
      <span class="label">Logout</span>
    </button>
  </nav>
</template>

<script setup>
import { useUserNameStore } from "@/Stores/useUsername";

const userStore = useUserNameStore();
</script>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 72px;
  background-color: #1e1e2f;
  display: flex;
  justify-content: space-around;
  align-items: center;
  border-top: 1px solid #34495e;
  z-index: 1000;
  padding: 0 8px;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #bdc3c7;
  text-decoration: none;
  font-size: 0.75rem;
  padding: 6px;
  flex: 1;
  border-radius: 8px;
  transition: background 0.2s, color 0.2s;
}

.nav-item:hover,
.router-link-exact-active {
  background-color: #00d8ff;
  color: #121212;
}

.icon {
  font-size: 1.2rem;
  margin-bottom: 4px;
}

.logout-btn {
  background: none;
  border: none;
  cursor: pointer;
}

.logout-btn:hover {
  background-color: #34495e;
}
</style>
