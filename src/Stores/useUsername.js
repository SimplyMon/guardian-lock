import { defineStore } from "pinia";
import { ref } from "vue";

export const useUserNameStore = defineStore("user", () => {
  const name = ref("");
  const status = ref("");

  function setUser(userData) {
    name.value = userData.name || "Unknown";
    status.value = userData.status || "unknown";
  }

  return { name, status, setUser };
});
