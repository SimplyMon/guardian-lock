<template>
  <DashboardLayout @logout="logout">
    <div class="dashboard-container">
      <div class="electric-bg"></div>

      <div class="dashboard-header">
        <h1 class="main-header-title">My <span>Dashboard</span></h1>
      </div>
      <div class="home-container">
        <h1 class="dashboard-title">Welcome Home, {{ userName }}</h1>

        <div class="status-text">
          Status:
          <span :class="isLocked ? 'locked' : 'unlocked'">
            {{ isLocked ? "Locked" : "Unlocked" }}
          </span>
        </div>

        <div v-if="countdown > 0" class="countdown-text">
          Auto-Lock in {{ countdown }} second<span v-if="countdown > 1">s</span
          >...
        </div>

        <!-- test -->
        <button
          @click="toggleLock"
          class="lock-button"
          :aria-label="isLocked ? 'Unlock' : 'Lock'"
          :disabled="isDisabled"
        >
          <div
            class="lock-animation-wrapper"
            :class="{ 'locked-state': isLocked, 'unlocked-state': !isLocked }"
          >
            <img
              :src="isLocked ? lockedImage : unlockedImage"
              alt="Lock Button"
            />
          </div>
        </button>
      </div>
    </div>
    <AlarmModal
      v-if="userRole === 'admin' && alarmActive"
      :show="true"
      :onStop="stopAlarm"
    />
  </DashboardLayout>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { signOut } from "firebase/auth";
import { ref as dbRef, set, onValue } from "firebase/database";
import { auth, database } from "../../Firebase/firebase";
import DashboardLayout from "../Layout/DashboardLayout.vue";
import { useUserNameStore } from "@/Stores/useUsername";
import AlarmModal from "../Modal/AlarmModal.vue";

import lockedImage from "@/Assets/images/locked.png";
import unlockedImage from "@/Assets/images/unlocked.png";

const userStore = useUserNameStore();
const userName = computed(() => userStore.name);
// test
const isDisabled = ref(false);
const userRole = ref(null);

const router = useRouter();
const isLocked = ref(true);
const countdown = ref(0);
let countdownInterval = null;

const alarmActive = ref(false);
const alarmRef = dbRef(database, "alarm");

const stopAlarm = async () => {
  try {
    await set(alarmRef, false);
  } catch (error) {
    console.error("Failed to stop alarm:", error);
  }
};

onMounted(() => {
  const uid = auth.currentUser?.uid;
  if (uid) {
    const roleRef = dbRef(database, `users/${uid}/role`);
    onValue(roleRef, (snapshot) => {
      userRole.value = snapshot.val();
    });
  }

  onValue(lockStatusRef, (snapshot) => {
    isLocked.value = snapshot.val() === "locked";
  });

  onValue(alarmRef, (snapshot) => {
    alarmActive.value = snapshot.val() === true;
  });
});

const startCountdown = (seconds) => {
  countdown.value = seconds;
  if (countdownInterval) clearInterval(countdownInterval);

  countdownInterval = setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) {
      clearInterval(countdownInterval);
    }
  }, 1000);
};

const lockStatusRef = dbRef(database, "lock_status");

const formatTimestamp = () => {
  const now = new Date();
  return `${now.toLocaleDateString("en-US")} ${now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
};

const generateLogKey = () => {
  const uid = auth.currentUser?.uid;
  const now = new Date().toISOString().replace(/[-:T]/g, "").slice(0, 14);
  return `${uid}_${now}`;
};

const logAction = async () => {
  const uid = auth.currentUser?.uid;
  if (!uid) return;

  const logRef = dbRef(database, `logs/${generateLogKey()}`);
  await set(logRef, {
    method: "APP",
    name: userStore.name,
    timestamp: formatTimestamp(),
  });
};

const toggleLock = async (shouldLog = true) => {
  if (isDisabled.value) return;

  const isCurrentlyLocked = isLocked.value;
  const newStatus = isCurrentlyLocked ? "unlocked" : "locked";

  try {
    await set(lockStatusRef, newStatus);
    if (shouldLog) await logAction();

    if (isCurrentlyLocked) {
      startCountdown(5);
      isDisabled.value = true;
      setTimeout(async () => {
        await set(lockStatusRef, "locked");
        isDisabled.value = false;
      }, 5000);
    }
  } catch (error) {
    console.error("Failed to update lock status:", error);
  }
};

const logout = async () => {
  try {
    await signOut(auth);
    router.push({ name: "welcome" });
  } catch (error) {
    console.error("Logout failed:", error);
  }
};

onMounted(() => {
  onValue(lockStatusRef, (snapshot) => {
    isLocked.value = snapshot.val() === "locked";
  });
});
</script>

<style scoped>
.dashboard-container {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #1c1c20;
  color: #fff;
  transition: all 0.3s ease-in-out;
}
.dashboard-header {
  position: fixed;
  top: 40px;
  left: 340px;
}

.main-header-title {
  color: #e0e0e0;
  font-size: 28px;
  font-weight: bold;
  margin: 0;
}
.home-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-left: 240px;
  min-height: 100vh;
  padding: 2rem;
  box-sizing: border-box;
  gap: 2rem;
}

.dashboard-title {
  font-size: 2rem;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 0.5rem;
}
.main-header-title span {
  color: #00d8ff;
}

.status-text {
  font-size: 1.25rem;
  font-weight: 500;
  color: #cccccc;
}

.status-text .locked {
  color: #e74c3c;
  font-weight: 700;
  margin-left: 0.5rem;
}

.status-text .unlocked {
  color: #2ecc71;
  font-weight: 700;
  margin-left: 0.5rem;
}

.countdown-text {
  font-size: 1rem;
  color: #f39c12;
  font-style: italic;
}

.lock-button {
  background-color: transparent;
  border: none;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.lock-button:hover {
  transform: scale(1.1);
}

.lock-button img {
  width: 240px;
  height: 240px;
  filter: brightness(1.3);
}

/* animation */
.lock-animation-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: pulse-ring 2.5s infinite ease-in-out;
}

.lock-animation-wrapper::before,
.lock-animation-wrapper::after {
  content: "";
  position: absolute;
  border-radius: 50%;
  border: 2px solid;
  width: 180px;
  height: 180px;
  opacity: 0.1;
  animation: ripple 2s infinite;
  pointer-events: none;
}

.lock-animation-wrapper::before {
  animation-delay: 0s;
}

.lock-animation-wrapper::after {
  animation-delay: 1s;
}

.locked-state::before,
.locked-state::after {
  border-color: #e74c3c;
}

.unlocked-state::before,
.unlocked-state::after {
  border-color: #2ecc71;
}

@keyframes ripple {
  0% {
    transform: scale(0.7);
    opacity: 0.2;
  }
  50% {
    opacity: 0.1;
  }
  100% {
    transform: scale(1.3);
    opacity: 0;
  }
}
.locked-state img {
  filter: drop-shadow(0 0 8px #e74c3c);
}

.unlocked-state img {
  filter: drop-shadow(0 0 8px #2ecc71);
}

/* animation */
.electric-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
  background: radial-gradient(
      ellipse at center,
      rgba(0, 255, 255, 0.06) 0%,
      transparent 80%
    ),
    radial-gradient(circle at 20% 30%, rgba(0, 255, 255, 0.04), transparent 60%),
    radial-gradient(circle at 80% 70%, rgba(0, 255, 255, 0.04), transparent 60%);
}

.electric-bg::before,
.electric-bg::after {
  content: "";
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background-image: url('data:image/svg+xml;utf8,<svg viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg"><polyline points="0,400 100,430 200,370 300,410 400,360 500,400 600,370 700,410 800,390" fill="none" stroke="%2300ffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>');
  background-repeat: no-repeat;
  background-size: cover;
  opacity: 0.12;
  animation: electricFlicker 6s infinite ease-in-out alternate,
    electricDrift 12s linear infinite;
  filter: blur(1px) drop-shadow(0 0 10px #00ffffaa);
  mix-blend-mode: screen;
}

.electric-bg::after {
  animation-delay: 1.5s;
  opacity: 0.08;
  filter: blur(3px) drop-shadow(0 0 12px #00ffff55);
}

/* Motion & flicker */
@keyframes electricFlicker {
  0% {
    opacity: 0.05;
    transform: scale(1) rotate(0deg);
  }
  10% {
    opacity: 0.15;
  }
  20% {
    opacity: 0.1;
    transform: scale(1.01) rotate(2deg);
  }
  40% {
    opacity: 0.2;
    transform: scale(1.05) rotate(-2deg);
  }
  60% {
    opacity: 0.05;
    transform: scale(0.98) rotate(1deg);
  }
  80% {
    opacity: 0.12;
    transform: scale(1.02) rotate(-1deg);
  }
  100% {
    opacity: 0.08;
    transform: scale(1) rotate(0deg);
  }
}

@keyframes electricDrift {
  0% {
    transform: translate(0%, 0%);
  }
  100% {
    transform: translate(10%, 10%);
  }
}

/* Mobile */
@media (max-width: 768px) {
  .home-container {
    margin-left: 0;
    padding: 1.5rem;
    gap: 1.5rem;
  }

  .home-container {
    margin-top: -20px;
  }

  .dashboard-title {
    font-size: 1.5rem;
    text-align: center;
  }

  .status-text {
    font-size: 1.1rem;
    text-align: center;
  }

  .countdown-text {
    font-size: 0.95rem;
  }

  .lock-button img {
    width: 150px;
    height: 150px;
  }

  .dashboard-header {
    left: 30px;
  }
}
</style>
