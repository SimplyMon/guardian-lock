<template>
  <div class="modal-overlay" @click.self="close">
    <div class="modal">
      <h3 class="modal-title">{{ title }}</h3>
      <p class="modal-message">{{ message }}</p>
      <button class="modal-button" @click="close">Close</button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  title: String,
  message: String,
});
const emit = defineEmits(["close"]);

function close() {
  emit("close");
}
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
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

.modal {
  background: #1d1f23;
  padding: 2rem;
  border-radius: 12px;
  max-width: 420px;
  width: 90%;
  color: #fff;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
  text-align: center;
  animation: scaleIn 0.3s ease;
}

.modal-title {
  font-size: 1.4rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #00d8ff;
}

.modal-message {
  font-size: 1rem;
  color: #d0d0d0;
  margin-bottom: 1.5rem;
}

.modal-button {
  padding: 0.6rem 1.5rem;
  font-size: 0.95rem;
  background-color: #00d8ff;
  border: none;
  border-radius: 8px;
  color: #121212;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.modal-button:hover {
  background-color: #0ec7ea;
}

/* Animations */
@keyframes fadeIn {
  from {
    background: rgba(0, 0, 0, 0);
  }
  to {
    background: rgba(0, 0, 0, 0.7);
  }
}

@keyframes scaleIn {
  from {
    transform: scale(0.92);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
