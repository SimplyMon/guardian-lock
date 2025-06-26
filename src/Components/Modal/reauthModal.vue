<template>
  <div class="modal-overlay">
    <div class="modal">
      <h2>Reauthenticate</h2>
      <p>Enter your current password to confirm changes</p>
      <input
        type="password"
        v-model="password"
        placeholder="Current Password"
      />
      <div class="modal-actions">
        <button @click="$emit('cancel')">Cancel</button>
        <button @click="submit">Confirm</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
const password = ref("");
const emit = defineEmits(["confirm", "cancel"]);
const submit = () => emit("confirm", password.value);
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal {
  background: #2c2c30;
  padding: 2rem;
  border-radius: 10px;
  width: 100%;
  max-width: 400px;
  color: white;
}
.modal input {
  width: 100%;
  margin-top: 1rem;
  padding: 0.5rem;
  background-color: #1c1c20;
  border: 1px solid #444;
  border-radius: 5px;
  color: white;
}
.modal-actions {
  margin-top: 1rem;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}
.modal-actions button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
</style>
