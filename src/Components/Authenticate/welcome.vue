<template>
  <div class="welcome-wrapper">
    <div class="onboarding-card">
      <transition name="fade">
        <div v-if="currentPage < pages.length" key="page" class="page-content">
          <img
            :src="pages[currentPage].image"
            alt="Illustration"
            class="onboarding-img"
          />
          <h1>{{ pages[currentPage].title }}</h1>
          <p class="description">{{ pages[currentPage].description }}</p>

          <div class="navigation-buttons">
            <button v-if="currentPage > 0" class="btn secondary" @click="prev">
              Back
            </button>
            <button class="btn primary" @click="next">
              {{ currentPage === pages.length - 1 ? "Get Started" : "Next" }}
            </button>
          </div>
        </div>
      </transition>

      <div class="pagination">
        <span
          v-for="(page, index) in pages.length"
          :key="index"
          :class="{ active: currentPage === index }"
        ></span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

import onboarding1 from "../../Assets/images/locked.png";
import onboarding2 from "../../Assets/images/onboarding2.png";
import onboarding3 from "../../Assets/images/onboarding3.png";

const router = useRouter();

const pages = [
  {
    title: "Welcome to Guardian Lock",
    description: "Secure your home with smart technology.",
    image: onboarding1,
  },
  {
    title: "Remote Access",
    description: "Lock and unlock your doors from anywhere.",
    image: onboarding2,
  },
  {
    title: "Get Started",
    description: "Ready to protect your home?",
    image: onboarding3,
  },
];

const currentPage = ref(0);

function next() {
  if (currentPage.value < pages.length - 1) {
    currentPage.value++;
  } else {
    router.push("/login");
  }
}

function prev() {
  if (currentPage.value > 0) {
    currentPage.value--;
  }
}
</script>

<style scoped>
.welcome-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(to bottom right, #0f2027, #203a43, #2c5364);
  height: 100vh;
  padding: 20px;
  color: #ffffff;
}

.onboarding-card {
  background: #1c1c20e0;
  border-radius: 16px;
  padding: 24px;
  width: 100%;
  max-width: 380px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5);
  text-align: center;
}

.page-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.onboarding-img {
  width: 100%;
  max-height: 220px;
  object-fit: contain;
  border-radius: 24px;
  margin-bottom: 8px;
}

h1 {
  font-size: 20px;
  font-weight: 600;
}

.description {
  font-size: 16px;
  color: #cccccc;
}

.highlight {
  color: #00d8ff;
  font-weight: bold;
}

.navigation-buttons {
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 12px;
  margin-top: 16px;
}

.btn {
  padding: 12px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  text-align: center;
  transition: all 0.3s ease;
  text-decoration: none;
  font-size: 16px;
}

.btn.primary {
  background-color: #00d8ff;
  color: #121212;
  border: none;
}

.btn.primary:hover {
  background-color: #00bcd4;
  color: white;
}

.btn.secondary {
  background: transparent;
  color: #00d8ff;
  border: 2px solid #00d8ff;
}

.btn.secondary:hover {
  background-color: #00d8ff;
  color: #121212;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  gap: 8px;
}

.pagination span {
  width: 10px;
  height: 10px;
  background: #555;
  border-radius: 50%;
  transition: background 0.3s;
}

.pagination .active {
  background: #00d8ff;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
