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
            Clear
          </button>
          <button class="add-filters-button" @click="showAddUserModal = true">
            Add User
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
              {{ selectedUser.isBlocked ? "Blocked" : "Block" }} ▼
            </span>
          </div>

          <div class="modal__row" v-if="selectedUser.expiry_date">
            <span>Expiry:</span>
            <span style="cursor: pointer" @click="editExpiry = true">
              {{ formatDate(selectedUser.expiry_date) }} ▼
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- TEST -->

    <!-- EDIT EXPIRY MODAL -->
    <div v-if="editExpiry" class="modal-overlay" @click.self="cancelExpiryEdit">
      <div class="modal">
        <button class="modal__close" @click="cancelExpiryEdit">×</button>
        <h3 class="modal__title">Edit Expiry Date</h3>
        <div class="modal__content">
          <input
            type="datetime-local"
            v-model="editableExpiry"
            class="modal__input"
          />
          <div class="modal__actions">
            <button @click="updateExpiryDate">Save</button>
            <button @click="cancelExpiryEdit">Cancel</button>
          </div>
        </div>
      </div>
    </div>

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

    <!-- ADD USER MODAL -->
    <div
      v-if="showAddUserModal"
      class="modal-overlay"
      @click.self="showAddUserModal = false"
    >
      <div class="modal">
        <button class="modal__close" @click="showAddUserModal = false">
          ×
        </button>
        <h3 class="modal__title">Add New User</h3>

        <form @submit.prevent="addUser">
          <input v-model="newUser.name" placeholder="Full Name" required />
          <input
            v-model="newUser.phone_number"
            placeholder="Phone Number"
            required
          />
          <input
            v-model="newUser.email"
            placeholder="Email"
            type="email"
            required
          />
          <input
            v-model="newUser.password"
            placeholder="Password"
            type="password"
            required
          />
          <input
            v-model="newUser.pin"
            placeholder="6-digit PIN"
            maxlength="6"
            pattern="\d{6}"
            inputmode="numeric"
            required
          />
          <select v-model="newUser.role" required>
            <option disabled value="">Select Role</option>
            <option value="admin">Admin</option>
            <option value="member">Member</option>
            <option value="guest">Guest</option>
          </select>
          <input
            v-if="newUser.role === 'guest'"
            v-model="newUser.expiry_date"
            type="datetime-local"
            required
          />

          <button type="submit">Create User</button>
          <p v-if="addUserError" class="error">{{ addUserError }}</p>
        </form>
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
import { database, tempAuth, auth } from "../../Firebase/firebase";
import { ref as dbRef, onValue, update, set, get } from "firebase/database";
import DashboardLayout from "../Layout/DashboardLayout.vue";
import { createUserWithEmailAndPassword, deleteUser } from "firebase/auth";

const users = ref({});
const selectedUser = ref(null);

const statusModal = ref(false);
const blockModal = ref(false);
const roleModal = ref(false);

const roleFilter = ref("");
const statusFilter = ref("");
const blockFilter = ref("");

const editExpiry = ref(false);
const editableExpiry = ref("");

// add user
const showAddUserModal = ref(false);
const addUserError = ref("");
const newUser = ref({
  name: "",
  phone_number: "",
  email: "",
  password: "",
  pin: "",
  role: "",
  expiry_date: "",
});

const addUser = async () => {
  addUserError.value = "";

  //  validation
  if (!/^\d{6}$/.test(newUser.value.pin)) {
    addUserError.value = "PIN must be exactly 6 digits.";
    return;
  }

  let tempUser = null;

  try {
    const userCredential = await createUserWithEmailAndPassword(
      tempAuth,
      newUser.value.email,
      newUser.value.password
    );
    tempUser = userCredential.user;

    const userData = {
      name: newUser.value.name,
      phone_number: newUser.value.phone_number,
      email: newUser.value.email,
      registration_date: new Date().toISOString(),
      role: newUser.value.role,
      isBlocked: false,
      status: "pending",
      user_id: tempUser.uid,
      pin: newUser.value.pin,
      expiry_date:
        newUser.value.role === "guest" ? newUser.value.expiry_date : null,
    };

    const userRef = dbRef(database, `users/${tempUser.uid}`);
    await set(userRef, userData);

    // Reset form + close modal
    showAddUserModal.value = false;
    newUser.value = {
      name: "",
      phone_number: "",
      email: "",
      password: "",
      pin: "",
      role: "",
      expiry_date: "",
    };
  } catch (err) {
    switch (err.code) {
      case "auth/email-already-in-use":
        addUserError.value = "Email already in use.";
        break;
      case "auth/invalid-email":
        addUserError.value = "Invalid email format.";
        break;
      case "auth/weak-password":
        addUserError.value = "Password should be at least 6 characters.";
        break;
      default:
        addUserError.value = "Failed to create user.";
    }

    if (tempUser) {
      try {
        await deleteUser(tempUser);
      } catch (_) {}
    }
  }
};

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

  // Initial listener
  onValue(usersRef, (snapshot) => {
    const data = snapshot.val() || {};
    users.value = data;
  });

  // expiry check
  setInterval(async () => {
    const now = new Date();
    const snapshot = await get(usersRef);
    const data = snapshot.val() || {};

    for (const [uid, user] of Object.entries(data)) {
      if (
        user.role === "guest" &&
        user.expiry_date &&
        new Date(user.expiry_date) <= now &&
        (user.status !== "expired" || user.isBlocked !== true)
      ) {
        const userRef = dbRef(database, `users/${uid}`);
        await update(userRef, {
          status: "expired",
          isBlocked: true,
        });
        console.log(`User ${user.name} expired.`);
      }
    }
  }, 20000);
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

// test
const updateExpiryDate = async () => {
  if (!selectedUser.value) return;

  const userRef = dbRef(database, `users/${selectedUser.value.user_id}`);
  await update(userRef, { expiry_date: editableExpiry.value });
  selectedUser.value.expiry_date = editableExpiry.value;
  editExpiry.value = false;

  // Check expiry tt
  const now = new Date();
  if (
    selectedUser.value.role === "guest" &&
    new Date(editableExpiry.value) <= now
  ) {
    await update(userRef, {
      status: "expired",
      isBlocked: true,
    });
    selectedUser.value.status = "expired";
    selectedUser.value.isBlocked = true;
  }
};

const cancelExpiryEdit = () => {
  editExpiry.value = false;
  editableExpiry.value = selectedUser.value.expiry_date || "";
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
  editExpiry.value = false;
  editableExpiry.value = user.expiry_date || "";
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
  box-sizing: border-box;
}
editExpiry .users-page__header h1 {
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
  background-color: #e74c3c;
  color: #fff;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.2s ease;
}

.clear-filters-button:hover {
  background-color: #d84838;
}

.add-filters-button {
  background-color: #00d8ff;
  color: #121212;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.2s ease;
}

.add-filters-button:hover {
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

/* Add User Modal Styles */
.modal form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.modal form input,
.modal form select {
  background: #1c1c20;
  border: 1px solid #444;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  color: #eee;
  font-size: 0.9rem;
  transition: border-color 0.2s;
}

.modal form input:focus,
.modal form select:focus {
  outline: none;
  border-color: #00d8ff;
}

.modal form button[type="submit"] {
  background-color: #00d8ff;
  color: #121212;
  border: none;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  font-weight: bold;
  font-size: 0.95rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.modal form button[type="submit"]:hover {
  background-color: #16c1df;
}

.modal form .error {
  color: #e74c3c;
  font-size: 0.85rem;
  margin-top: -0.5rem;
}

/* Edit Expiry Modal  */
.modal__input {
  background: #1c1c20;
  border: 1px solid #444;
  padding: 0.75rem 0.2rem;
  border-radius: 6px;
  color: #eee;
  font-size: 0.95rem;
  width: 100%;
  margin-top: 1rem;
  margin-bottom: 1.5rem;
  transition: border-color 0.2s;
}

.modal__input:focus {
  outline: none;
  border-color: #00d8ff;
}

.modal__actions {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.modal__actions button {
  flex: 1;
  padding: 0.75rem 1rem;
  font-weight: bold;
  font-size: 0.95rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.modal__actions button:first-child {
  background-color: #00d8ff;
  color: #121212;
}

.modal__actions button:first-child:hover {
  background-color: #16c1df;
}

.modal__actions button:last-child {
  background-color: #e74c3c;
  color: #fff;
}

.modal__actions button:last-child:hover {
  background-color: #c0392b;
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
