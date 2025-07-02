<template>
  <div class="modal-overlay" v-if="show">
    <div class="modal-content">
      <h2>Warning!</h2>
      <p>Someone is trying to access your door!</p>
      <button @click="onStop">Stop Alarm</button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  show: Boolean,
  onStop: Function,
});
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.modal-content {
  background-color: #2c2c2c;
  padding: 2rem;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 0 20px #ff3c3c88;
  border: 2px solid #ff3c3c;
  color: white;
}

.modal-content h2 {
  margin-bottom: 1rem;
  color: #ff3c3c;
}

.modal-content button {
  margin-top: 1rem;
  padding: 0.5rem 1.5rem;
  background: #ff3c3c;
  border: none;
  color: white;
  font-weight: bold;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.modal-content button:hover {
  background: #e02e2e;
}
</style>
