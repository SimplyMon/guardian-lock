<template>
  <DashboardLayout @logout="logout">
    <div class="users-page">
      <header class="users-page__header">
        <h1 style="margin: 0">All <span>Users</span></h1>

        <!-- test -->
        <div class="filters">
          <select v-model="roleFilter">
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="member">Member</option>
            <option value="guest">Guest</option>
          </select>

          <select v-model="statusFilter">
            <option value="">All Statuses</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="expired">Expired</option>
          </select>

          <select v-model="blockFilter">
            <option value="">All</option>
            <option value="true">Blocked</option>
            <option value="false">Unblocked</option>
          </select>
          <button class="clear-filters-button" @click="clearFilters">
            Clear Filters
          </button>
        </div>
      </header>

      <div
        v-for="role in ['admin', 'member', 'guest']"
        :key="role"
        class="user-role-group"
      >
        <h2 class="user-role-group__title">{{ role.toUpperCase() }}S</h2>

        <div v-if="filteredByRole(role).length > 0">
          <div
            class="user-panel"
            v-for="(user, key) in filteredByRole(role)"
            :key="key"
            @click="openModal(user)"
          >
            <div class="user-panel__name">{{ user.name }}</div>
            <div class="user-panel__status" :class="`status--${user.status}`">
              {{ user.status }}
            </div>
          </div>
        </div>
        <div v-else class="no-users-message">No users found in this role.</div>
      </div>
    </div>

    <!-- USERS MODAL -->
    <div v-if="selectedUser" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <button class="modal__close" @click="closeModal">×</button>
        <h2 class="modal__title">{{ selectedUser.name }}</h2>

        <div class="modal__content">
          <div class="modal__row">
            <span>Email:</span>
            <span>{{ selectedUser.email }}</span>
          </div>
          <div class="modal__row">
            <span>Phone:</span>
            <span>{{ selectedUser.phone_number }}</span>
          </div>
          <div class="modal__row">
            <span>Registered:</span>
            <span>{{ formatDate(selectedUser.registration_date) }}</span>
          </div>
          <div class="modal__row">
            <span>Role:</span>
            <span
              :class="`role-badge role--${selectedUser.role}`"
              style="cursor: pointer"
              @click="openRoleModal"
            >
              {{ selectedUser.role }} ▼
            </span>
          </div>
          <div class="modal__row">
            <span>Status:</span>
            <span
              :class="`status--${selectedUser.status}`"
              style="cursor: pointer"
              @click="openStatusModal"
            >
              {{ selectedUser.status }} ▼
            </span>
          </div>

          <div class="modal__row">
            <span>Blocked:</span>
            <span
              :class="selectedUser.isBlocked ? 'blocked' : 'unblocked'"
              style="cursor: pointer"
              @click="openBlockModal"
            >
              {{ selectedUser.isBlocked ? "Blocked" : "Unblocked" }} ▼
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- TEST -->

    <!-- STATUS CHANGE MODAL -->
    <div
      v-if="statusModal"
      class="modal-overlay"
      @click.self="closeStatusModal"
    >
      <div class="modal">
        <button class="modal__close" @click="closeStatusModal">×</button>
        <h3 class="modal__title">Change Status</h3>
        <div class="modal__content">
          <button
            v-for="status in ['approved', 'pending', 'expired']"
            :key="status"
            class="status-option"
            :class="`status-option--${status}`"
            @click="changeStatus(status)"
          >
            {{ status.charAt(0).toUpperCase() + status.slice(1) }}
          </button>
        </div>
      </div>
    </div>

    <!-- BLOCK TOGGLE MODAL -->
    <div v-if="blockModal" class="modal-overlay" @click.self="closeBlockModal">
      <div class="modal">
        <button class="modal__close" @click="closeBlockModal">×</button>
        <h3 class="modal__title">Change Block Status</h3>
        <div class="modal__content">
          <button
            class="status-option status-option--unblock"
            @click="changeBlockStatus(false)"
          >
            Unblock
          </button>
          <button
            class="status-option status-option--block"
            @click="changeBlockStatus(true)"
          >
            Block
          </button>
        </div>
      </div>
    </div>

    <!-- ROLE CHANGE MODAL -->
    <div v-if="roleModal" class="modal-overlay" @click.self="closeRoleModal">
      <div class="modal">
        <button class="modal__close" @click="closeRoleModal">×</button>
        <h3 class="modal__title">Change Role</h3>
        <div class="modal__content">
          <button
            v-for="role in ['admin', 'member', 'guest']"
            :key="role"
            class="status-option"
            :class="`status-option--${role}`"
            @click="changeRole(role)"
          >
            {{ role.charAt(0).toUpperCase() + role.slice(1) }}
          </button>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<!-- TEST -->
<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { signOut } from "firebase/auth";
import { database, auth } from "../../Firebase/firebase";
import { ref as dbRef, onValue, update } from "firebase/database";
import DashboardLayout from "../Layout/DashboardLayout.vue";

const users = ref({});
const selectedUser = ref(null);

const statusModal = ref(false);
const blockModal = ref(false);
const roleModal = ref(false);

const roleFilter = ref("");
const statusFilter = ref("");
const blockFilter = ref("");

const openRoleModal = () => {
  roleModal.value = true;
};

const closeRoleModal = () => {
  roleModal.value = false;
};

const changeRole = async (newRole) => {
  if (!selectedUser.value) return;
  const userRef = dbRef(database, `users/${selectedUser.value.user_id}`);
  await update(userRef, { role: newRole });
  selectedUser.value.role = newRole;
  closeRoleModal();
};

const openBlockModal = () => {
  blockModal.value = true;
};

const closeBlockModal = () => {
  blockModal.value = false;
};

const changeBlockStatus = async (blockValue) => {
  if (!selectedUser.value) return;
  const userRef = dbRef(database, `users/${selectedUser.value.user_id}`);
  await update(userRef, { isBlocked: blockValue });
  selectedUser.value.isBlocked = blockValue;
  closeBlockModal();
};

const openStatusModal = () => {
  statusModal.value = true;
};

const closeStatusModal = () => {
  statusModal.value = false;
};

const changeStatus = async (newStatus) => {
  if (!selectedUser.value) return;
  const userRef = dbRef(database, `users/${selectedUser.value.user_id}`);
  await update(userRef, { status: newStatus });
  selectedUser.value.status = newStatus;
  closeStatusModal();
};

onMounted(() => {
  const usersRef = dbRef(database, "users/");
  onValue(usersRef, (snapshot) => {
    users.value = snapshot.val() || {};
  });
});

const formatDate = (timestamp) => {
  if (!timestamp) return "N/A";
  const date = new Date(timestamp);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const filteredByRole = (role) => {
  return Object.values(users.value).filter((user) => {
    return (
      user.role === role &&
      (roleFilter.value === "" || user.role === roleFilter.value) &&
      (statusFilter.value === "" || user.status === statusFilter.value) &&
      (blockFilter.value === "" || String(user.isBlocked) === blockFilter.value)
    );
  });
};
const clearFilters = () => {
  roleFilter.value = "";
  statusFilter.value = "";
  blockFilter.value = "";
};

const openModal = (user) => {
  selectedUser.value = user;
};

const closeModal = () => {
  selectedUser.value = null;
};

const toggleBlock = async (user) => {
  const userRef = dbRef(database, `users/${user.user_id}`);
  await update(userRef, { isBlocked: !user.isBlocked });
  user.isBlocked = !user.isBlocked;
};

// Logout
const router = useRouter();
const logout = async () => {
  try {
    await signOut(auth);
    router.push({ name: "welcome" });
  } catch (error) {
    console.error("Logout failed:", error);
  }
};
</script>

<style scoped>
/* Layout  */
.users-page {
  background-color: #1c1c20;
  min-height: 100vh;
  padding: 2rem;
  margin-left: 300px;
  color: #e0e0e0;
  font-family: "Segoe UI", sans-serif;
  box-sizing: border-box;
}

.users-page__header h1 {
  font-size: 1.75rem;
  font-weight: 600;
  color: #e0e0e0;
}
.users-page__header span {
  color: #00d8ff;
}
.users-page__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  margin-bottom: 6rem;
}
.clear-filters-button {
  background-color: #00d8ff;
  color: #121212;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.2s ease;
}

.clear-filters-button:hover {
  background-color: #16c1df;
}

.filters {
  display: flex;
  gap: 1rem;
}

.filters select {
  background: #2a2a2f;
  color: #e0e0e0;
  border: 1px solid #444;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.9rem;
}

/* Role Group Section */
.user-role-group {
  margin-bottom: 2.5rem;
}

.user-role-group__title {
  font-size: 1.2rem;
  color: #00d8ff;
  margin-bottom: 1rem;
  text-transform: uppercase;
  font-weight: 600;
  border-bottom: 1px solid #333;
  padding-bottom: 0.5rem;
}

/* User Panel */
.user-panel {
  display: flex;
  justify-content: space-between;
  background: #2a2a2f;
  border-radius: 6px;
  padding: 1rem;
  margin-bottom: 0.75rem;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.user-panel:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.5);
}

.user-panel__name {
  font-weight: 600;
  font-size: 1rem;
  color: #fff;
}

.user-panel__status {
  font-size: 0.8rem;
  font-weight: bold;
  padding: 0.35rem 0.75rem;
  border-radius: 4px;
  text-transform: uppercase;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: #2a2a2f;
  padding: 2rem;
  border-radius: 10px;
  width: 90%;
  max-width: 500px;
  color: #eee;
  position: relative;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.7);
  animation: fadeIn 0.3s ease;
}

.modal__close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: transparent;
  border: none;
  color: #ccc;
  font-size: 1.5rem;
  cursor: pointer;
  transition: color 0.2s;
}

.modal__close:hover {
  color: #fff;
}

.modal__title {
  margin: 0 0 1rem;
  font-size: 1.5rem;
  font-weight: bold;
  color: #00d8ff;
}

.modal__content {
  display: grid;
  gap: 0.75rem;
}

.modal__row {
  display: flex;
  justify-content: space-between;
  font-size: 0.95rem;
  border-bottom: 1px solid #444;
  padding-bottom: 0.4rem;
}

.status-option {
  display: block;
  width: 100%;
  margin-bottom: 0.5rem;
  padding: 0.6rem;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;
}

.status-option--approved {
  background-color: #2ecc71;
  color: #000;
}

.status-option--pending {
  background-color: #f39c12;
  color: #000;
}

.status-option--expired {
  background-color: #e74c3c;
  color: #fff;
}

/* Block toggle buttons */
.status-option--block {
  background-color: #e74c3c;
  color: #fff;
}
.status-option--block:hover {
  background-color: #c0392b;
}

.status-option--unblock {
  background-color: #2ecc71;
  color: #000;
}
.status-option--unblock:hover {
  background-color: #27ae60;
}

.role-badge {
  padding: 0.35rem 0.75rem;
  font-size: 0.8rem;
  font-weight: bold;
  border-radius: 4px;
  text-transform: uppercase;
  display: inline-block;
}

.role--admin {
  background-color: #9b59b6;
  color: #fff;
}

.role--member {
  background-color: #3498db;
  color: #fff;
}

.role--guest {
  background-color: #95a5a6;
  color: #000;
}
.status-option--admin {
  background-color: #9b59b6;
  color: #fff;
}
.status-option--admin:hover {
  background-color: #8e44ad;
}

.status-option--member {
  background-color: #3498db;
  color: #fff;
}
.status-option--member:hover {
  background-color: #2980b9;
}

.status-option--guest {
  background-color: #95a5a6;
  color: #000;
}
.status-option--guest:hover {
  background-color: #7f8c8d;
}

/* Status Tags */
.status--approved {
  background-color: #2ecc71;
  color: #000;
  padding: 0.35rem 0.75rem;
  font-size: 0.8rem;
  font-weight: bold;
  border-radius: 4px;
  text-transform: uppercase;
}

.status--pending {
  background-color: #f39c12;
  color: #000;
  padding: 0.35rem 0.75rem;
  font-size: 0.8rem;
  font-weight: bold;
  border-radius: 4px;
  text-transform: uppercase;
}

.status--expired {
  background-color: #e74c3c;
  color: #fff;
  padding: 0.35rem 0.75rem;
  font-size: 0.8rem;
  font-weight: bold;
  border-radius: 4px;
  text-transform: uppercase;
}

/* Block Status Tags */
.blocked,
.modal__row .blocked {
  background-color: #e74c3c;
  color: #fff;
  padding: 0.35rem 0.75rem;
  font-size: 0.8rem;
  font-weight: bold;
  border-radius: 4px;
  text-transform: uppercase;
}

.unblocked,
.modal__row .unblocked {
  background-color: #2ecc71;
  color: #000;
  padding: 0.35rem 0.75rem;
  font-size: 0.8rem;
  font-weight: bold;
  border-radius: 4px;
  text-transform: uppercase;
}

/* No User Message */
.no-users-message {
  color: #aaa;
  font-style: italic;
  padding: 1rem;
  background-color: #2a2a2f;
  border-radius: 4px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
}

/* Animation */
@keyframes fadeIn {
  from {
    transform: scale(0.95);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .users-page__header {
    margin-bottom: 2rem;
  }
  .users-page {
    margin-left: 0;
    padding: 1rem;
  }

  .user-panel {
    flex-direction: row;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .users-page__header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  .users-page__header h1 {
    margin-bottom: 0;
  }
  .clear-filters-button {
    background-color: #00d8ff;
    color: #121212;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    font-size: 0.9rem;
    cursor: pointer;
    transition: background 0.2s ease;
  }

  .clear-filters-button:hover {
    background-color: #16c1df;
  }

  .filters {
    display: flex;
    flex-direction: column;
    width: 100%;
    gap: 1rem;
  }

  .filters select {
    background: #2a2a2f;
    color: #e0e0e0;
    border: 1px solid #444;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    font-size: 0.9rem;
  }
}
</style>
