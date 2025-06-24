<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <img
        src="../../Assets/images/logo2.png"
        alt="Guardian Lock Logo"
        class="logo"
      />
      <h1 class="app-name">Guardian Lock</h1>
    </div>

    <nav>
      <ul class="menu">
        <li>
          <router-link to="/dashboard" class="menu-item">
            <i class="fas fa-home icon"></i>
            <span class="label">Home</span>
          </router-link>
        </li>
        <li>
          <router-link to="/logs" class="menu-item">
            <i class="fas fa-clipboard-list icon"></i>
            <span class="label">Logs</span>
          </router-link>
        </li>
        <li>
          <router-link to="/profile" class="menu-item">
            <i class="fas fa-user icon"></i>
            <span class="label">Profile</span>
          </router-link>
        </li>
        <li>
          <router-link to="/users" class="menu-item">
            <i class="fas fa-users icon"></i>
            <span class="label">Users</span>
          </router-link>
        </li>
      </ul>
    </nav>

    <div
      class="profile-section"
      @click="toggleLogoutMenu"
      @contextmenu.prevent="toggleLogoutMenu"
    >
      <img
        src="../../Assets/images/default.png"
        alt="Profile"
        class="profile-img"
      />
      <span class="profile-name">{{ userStore.name }}</span>

      <div v-if="showLogout" class="logout-menu" @click.stop="logout">
        <i class="fas fa-sign-out-alt icon"></i>
        <span>Logout</span>
      </div>
    </div>
  </aside>
</template>

<!-- test -->
<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { auth, database } from "@/Firebase/firebase";
import { ref as dbRef, get } from "firebase/database";
import { useUserNameStore } from "@/Stores/useUsername";

const userStore = useUserNameStore();
const showLogout = ref(false);
const emit = defineEmits(["logout"]);

function toggleLogoutMenu() {
  showLogout.value = !showLogout.value;
}

function logout() {
  showLogout.value = false;
  emit("logout");
}

function handleClickOutside(event) {
  if (!event.target.closest(".profile-section")) {
    showLogout.value = false;
  }
}

// 🔄 Fetch user data if not yet set
const fetchUserName = async () => {
  const user = auth.currentUser;
  if (!user) return;

  const uid = user.uid;
  const userRef = dbRef(database, `users/${uid}`);

  try {
    const snapshot = await get(userRef);
    if (snapshot.exists()) {
      const userData = snapshot.val();
      userStore.setUser(userData);
    }
  } catch (error) {
    console.error("Failed to fetch user info in sidebar:", error);
  }
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);

  if (!userStore.name) {
    fetchUserName();
  }
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>

<style scoped>
.sidebar {
  position: fixed;
  top: 15px;
  bottom: 15px;
  left: 15px;
  border-radius: 16px;
  width: 250px;
  background-color: #1e1e2f;
  color: #ffffff;
  padding: 1.5rem 1rem;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: start;
  margin-bottom: 4rem;
}

.logo {
  width: 52px;
  height: 52px;
  object-fit: contain;
}

.app-name {
  font-size: 1.2rem;
  font-weight: 600;
  margin-left: 0.5rem;
  white-space: nowrap;
}

.menu {
  list-style: none;
  padding: 0;
  margin: 0;
  flex: 1;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  color: #bdc3c7;
  font-size: 1.05rem;
  text-decoration: none;
  padding: 0.75rem 1rem;
  margin-bottom: 10px;
  border-radius: 8px;
  transition: background 0.2s, color 0.2s;
}

.menu-item:hover,
.router-link-exact-active {
  background-color: #00d8ff;
  color: #121212;
}

.logout-btn {
  background: none;
  border: none;
  width: 100%;
  text-align: left;
  cursor: pointer;
}

.icon {
  font-size: 1.2rem;
  width: 24px;
  text-align: center;
}

.profile-section {
  position: relative;
  display: flex;
  align-items: center;
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px solid #34495e;
  cursor: pointer;
}

.profile-img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 0.75rem;
  margin-left: 16px;
}

.profile-name {
  color: #ecf0f1;
  font-size: 1rem;
  white-space: nowrap;
}

.logout-menu {
  position: absolute;
  bottom: 60px;
  left: 16px;
  background-color: #2c3e50;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  z-index: 1000;
  color: #ecf0f1;
}

.logout-menu:hover {
  background-color: #34495e;
}
</style>
