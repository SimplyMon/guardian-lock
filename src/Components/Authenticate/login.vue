<template>
  <div class="welcome-wrapper">
    <div class="onboarding-card">
      <div class="page-content">
        <div class="header-with-back">
          <router-link to="/onboarding-screen" class="back-arrow"
            >⇦</router-link
          >
          <h1>Login to <span class="highlight">Guardian Lock</span></h1>
        </div>

        <p class="description">
          Enter your credentials to access your Dashboard.
        </p>

        <form @submit.prevent="login" class="login-form">
          <input v-model="email" placeholder="Email" type="email" required />
          <input
            v-model="password"
            placeholder="Password"
            type="password"
            required
          />
          <button type="submit" class="btn primary">Login</button>
        </form>

        <p v-if="error" class="error">{{ error }}</p>

        <div class="navigation-buttons">
          <router-link to="/register" class="btn secondary"
            >Create Account</router-link
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { auth } from "../../Firebase/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

// reactive state
const email = ref("");
const password = ref("");
const error = ref("");

// router instance
const router = useRouter();

// login function
const login = async () => {
  error.value = ""; // reset error
  try {
    await signInWithEmailAndPassword(auth, email.value, password.value);
    router.push("/dashboard");
  } catch (err) {
    switch (err.code) {
      case "auth/invalid-email":
        error.value = "Please enter a valid email address.";
        break;
      case "auth/user-disabled":
        error.value = "This user account has been disabled.";
        break;
      case "auth/user-not-found":
      case "auth/wrong-password":
        error.value = "Incorrect email or password.";
        break;
      default:
        error.value = "Incorrect email or password. Please try again.";
    }
  }
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap");

.welcome-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(to bottom right, #0f2027, #203a43, #2c5364);
  height: 100vh;
  padding: 20px;
  font-family: "Inter", sans-serif;
  color: #ffffff;
}
.onboarding-card {
  background: rgba(30, 30, 30, 0.85);
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
  gap: 16px;
}

h1 {
  font-size: 26px;
  font-weight: 600;
}

.description {
  font-size: 14px;
  color: #cccccc;
}

.highlight {
  color: #00d8ff;
  font-weight: bold;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
}

input {
  padding: 12px;
  border-radius: 8px;
  border: none;
  background-color: #2a2a2a;
  color: #ffffff;
  font-size: 15px;
  transition: background 0.2s ease;
}

input:focus {
  background-color: #333;
  outline: none;
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
  font-size: 15px;
}

.btn.primary {
  background-color: #00d8ff;
  color: #121212;
  border: none;
  margin-bottom: 10px;
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

.error {
  color: #ff6b6b;
  font-size: 0.9rem;
  margin-top: -8px;
}

.header-with-back {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.back-arrow {
  font-size: 26px;
  color: #00d8ff;
  text-decoration: none;
  cursor: pointer;
  transition: color 0.3s ease;
}

.back-arrow:hover {
  color: #00bcd4;
}
@media (max-width: 768px) {
  h1 {
    font-size: 18px;
    font-weight: 600;
    margin: 0;
  }

  .back-arrow {
    font-size: 26px;
    color: #00d8ff;
    text-decoration: none;
    cursor: pointer;
    transition: color 0.3s ease;
    margin-bottom: 8px;
  }
}
</style>
