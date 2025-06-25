<template>
  <div class="welcome-wrapper">
    <div class="onboarding-card">
      <div class="page-content">
        <h1>
          Create an account on <span class="highlight">Guardian Lock</span>
        </h1>

        <p class="description">
          Fill in your details to secure your dashboard access.
        </p>

        <form @submit.prevent="register" class="login-form">
          <input v-model="name" placeholder="Full Name" type="text" required />
          <input
            v-model="phoneNumber"
            placeholder="Phone Number"
            type="tel"
            required
          />
          <input v-model="email" placeholder="Email" type="email" required />
          <input
            v-model="password"
            placeholder="Password"
            type="password"
            required
          />
          <input
            v-model="pin"
            placeholder="6-digit PIN"
            type="text"
            maxlength="6"
            pattern="\d{6}"
            inputmode="numeric"
            title="PIN must be exactly 6 numeric digits"
            required
          />

          <button type="submit" class="btn primary">Register</button>
        </form>

        <p v-if="error" class="error">{{ error }}</p>

        <div class="navigation-buttons">
          <router-link to="/login" class="btn secondary">
            Already have an account?
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { auth, database } from "../../Firebase/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { ref as dbRef, set } from "firebase/database";

// Form fields
const name = ref("");
const phoneNumber = ref("");
const email = ref("");
const password = ref("");
const pin = ref("");
const error = ref("");

const router = useRouter();

const register = async () => {
  error.value = "";

  // Validate PIN
  if (!/^\d{6}$/.test(pin.value)) {
    error.value = "PIN must be exactly 6 digits.";
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email.value,
      password.value
    );
    const user = userCredential.user;

    // Prepare user data
    const userData = {
      name: name.value,
      phone_number: phoneNumber.value,
      email: email.value,
      registration_date: new Date().toISOString(),
      role: "guest",
      isBlocked: false,
      status: "pending",
      user_id: user.uid,
      pin: pin.value,
    };

    // Save to Realtime DB
    const userRef = dbRef(database, `users/${user.uid}`);
    await set(userRef, userData);

    router.push("/dashboard");
  } catch (err) {
    switch (err.code) {
      case "auth/email-already-in-use":
        error.value = "This email is already registered. Please log in.";
        break;
      case "auth/invalid-email":
        error.value = "Please enter a valid email address.";
        break;
      case "auth/weak-password":
        error.value = "Password must be at least 6 characters.";
        break;
      default:
        error.value = "Registration failed. Please try again.";
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
  font-size: 22px;
  font-weight: 600;
  margin-bottom: 0;
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
</style>
