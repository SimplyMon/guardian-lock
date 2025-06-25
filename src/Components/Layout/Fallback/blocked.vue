<template>
  <div class="blocked-page">
    <div class="blocked-content">
      <h2>Your account has been blocked</h2>
      <p>
        Access to the Guardian Lock application has been restricted by an administrator. Please contact your admin to resolve this issue.
      </p>
      <button class="btn-logout" @click="logout">Logout</button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import { signOut } from "firebase/auth";
import { auth } from "../../../Firebase/firebase";

const router = useRouter();

const logout = async () => {
  await signOut(auth);
  router.push({ name: "welcome" });
};
</script>

<style scoped>
.blocked-page {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #1c1c1c;
  color: #ffffff;
  text-align: center;
  padding: 40px;
}

.blocked-content {
  max-width: 500px;
  padding: 40px;
  background-color: #2a2a2e;
  border-radius: 12px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
}

.blocked-content h2 {
  color: #ff4d4f;
  font-size: 24px;
  margin-bottom: 16px;
}

.blocked-content p {
  font-size: 16px;
  color: #e0e0e0;
  margin-bottom: 24px;
}

.btn-logout {
  background-color: #ff4d4f;
  color: white;
  border: none;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: bold;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.btn-logout:hover {
  background-color: #d9363e;
}
</style>
