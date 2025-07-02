<template>
  <DashboardLayout @logout="logout">
    <div class="profile-container">
      <div class="profile-header">
        <h1 class="main-header-title">My <span>Profile</span></h1>
        <p class="subtitle">
          Manage your personal details and account preferences
        </p>
      </div>

      <form class="profile-form" @submit.prevent="updateProfile">
        <section class="form-section">
          <h2 class="section-title">Personal Info</h2>
          <div class="form-group">
            <label for="name">Full Name</label>
            <input
              id="name"
              v-model="profile.name"
              type="text"
              placeholder="Your full name"
            />
          </div>

          <div class="form-group">
            <label for="phone">Phone Number</label>
            <input
              id="phone"
              v-model="profile.phone_number"
              type="tel"
              placeholder="e.g., +1234567890"
            />
          </div>
        </section>

        <section class="form-section">
          <h2 class="section-title">Security</h2>
          <div class="form-group">
            <label for="email">Email</label>
            <input id="email" :value="profile.email" type="email" disabled />
          </div>

          <div class="form-group">
            <label for="pin">Personal PIN</label>
            <input
              id="pin"
              :value="profile.pin"
              @input="handlePinInput"
              type="text"
              inputmode="numeric"
              pattern="\d*"
              maxlength="6"
              placeholder="6-digit PIN"
            />
          </div>

          <div class="form-group">
            <label for="newPassword">New Password</label>
            <input
              id="newPassword"
              v-model="newPassword"
              type="password"
              placeholder="Leave blank to keep current"
              minlength="6"
            />
          </div>


            <div class="form-group">
          <label for="fingerprintId">Fingerprint ID</label>
          <input
            id="fingerprintId"
            v-model="fingerprintId"
            type="number"
            min="1"
            max="127"
            placeholder="e.g., 23"
          />
          <button style="margin-top: 20px;" @click.prevent="assignFingerprintId" class="save-button">Assign Fingerprint</button>
        </div>

        </section>

        <section class="form-section">
          <h2 class="section-title">Account Info</h2>
          <div class="form-group">
            <label>Role</label>
            <input :value="profile.role" type="text" disabled />
          </div>

          <div class="form-group">
            <label>Registration Date</label>
            <input :value="formattedDate" type="text" disabled />
          </div>
        </section>

        <button type="submit" class="save-button">Save Changes</button>
      </form>

      <modal
        v-if="showModal"
        :title="modalTitle"
        :message="modalMessage"
        @close="closeModal"
      />
    </div>
  </DashboardLayout>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { getDatabase, ref as dbRef, get, update, remove } from "firebase/database";
import { getAuth, updatePassword, signOut } from "firebase/auth";
import DashboardLayout from "../Layout/DashboardLayout.vue";
import modal from "../Modal/modal.vue";
import { useRouter } from "vue-router";

const newPassword = ref("");
const fingerprintId = ref(""); // ✅ only defined once
const router = useRouter();

const profile = ref({
  name: "",
  phone_number: "",
  email: "",
  pin: "",
  role: "",
  registration_date: "",
});

const db = getDatabase();
const auth = getAuth();

const showModal = ref(false);
const modalTitle = ref("");
const modalMessage = ref("");

function openModal(title, message) {
  modalTitle.value = title;
  modalMessage.value = message;
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
}

const formattedDate = computed(() => {
  if (!profile.value.registration_date) return "";
  const date = new Date(profile.value.registration_date);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
});

onMounted(async () => {
  const user = auth.currentUser;
  if (user) {
    const snapshot = await get(dbRef(db, `users/${user.uid}`));
    if (snapshot.exists()) {
      profile.value = { ...profile.value, ...snapshot.val() };
    }

    // 🔍 Load fingerprint ID assigned to this user (if any)
    const fps = await get(dbRef(db, "fingerprintIDS"));
    if (fps.exists()) {
      const found = Object.entries(fps.val()).find(([id, uid]) => uid === user.uid);
      if (found) fingerprintId.value = found[0];
    }
  }
});

const updateProfile = async () => {
  const user = auth.currentUser;
  if (!user) return;

  const pin = profile.value.pin?.toString();
  if (!/^\d{6}$/.test(pin)) {
    openModal("Validation Error", "PIN must be exactly 6 digits.");
    return;
  }

  const userSnapshotBefore = await get(dbRef(db, `users/${user.uid}`));
  const oldPin = userSnapshotBefore.exists() ? userSnapshotBefore.val().pin : null;

  const existingPinSnapshot = await get(dbRef(db, `pins/${pin}`));
  if (existingPinSnapshot.exists() && existingPinSnapshot.val() !== user.uid) {
    openModal("PIN Conflict", "This PIN is already used by another user.");
    return;
  }

  await update(dbRef(db, `users/${user.uid}`), {
    name: profile.value.name,
    phone_number: profile.value.phone_number,
    pin: pin,
  });

  await update(dbRef(db, `pins`), {
    [pin]: user.uid,
  });

  if (oldPin && oldPin !== pin) {
    const oldPinSnapshot = await get(dbRef(db, `pins/${oldPin}`));
    if (oldPinSnapshot.exists() && oldPinSnapshot.val() === user.uid) {
      await remove(dbRef(db, `pins/${oldPin}`));
    }
  }

  if (newPassword.value) {
    try {
      await updatePassword(user, newPassword.value);
    } catch (error) {
      if (error.code === "auth/requires-recent-login") {
        openModal("Auth Required", "Log in again before updating password.");
        return;
      } else {
        openModal("Error", error.message);
        return;
      }
    }
  }

  openModal("Success", "Profile updated successfully.");
  newPassword.value = "";
};

// ✅ Top-level function
const assignFingerprintId = async () => {
  const user = auth.currentUser;
  if (!user) return;

  const id = String(fingerprintId.value).trim();

  if (!/^\d+$/.test(id) || +id < 1 || +id > 127) {
    openModal("Invalid ID", "Fingerprint ID must be a number between 1 and 127.");
    return;
  }

  // 🧼 Remove old fingerprint IDs for this user
  const fps = await get(dbRef(db, "fingerprintIDS"));
  if (fps.exists()) {
    for (const [key, val] of Object.entries(fps.val())) {
      if (val === user.uid && key !== id) {
        await remove(dbRef(db, `fingerprintIDS/${key}`));
      }
    }
  }

  // 🔒 Check if the ID is already used by another user
  const existing = await get(dbRef(db, `fingerprintIDS/${id}`));
  if (existing.exists() && existing.val() !== user.uid) {
    openModal("ID Taken", "This fingerprint ID is already assigned to another user.");
    return;
  }

  // ✅ Assign fingerprint ID to current user
  await update(dbRef(db, "fingerprintIDS"), {
    [id]: user.uid,
  });

  openModal("Success", `Fingerprint ID ${id} has been assigned to you.`);
  fingerprintId.value = id;
};


function handlePinInput(event) {
  let val = event.target.value.replace(/\D/g, "").slice(0, 6);
  profile.value.pin = val;
}

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
.profile-container {
  margin-left: 240px;
  min-height: 100vh;
  padding: 2rem;
  background-color: #1c1c20;
  color: #ffffff;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.profile-header {
  text-align: center;
  margin-bottom: 2rem;
}

.main-header-title {
  font-size: 2rem;
  font-weight: 700;
}

.main-header-title span {
  color: #00d8ff;
}

.subtitle {
  font-size: 0.95rem;
  color: #a0a0a0;
  margin-top: 0.5rem;
}

.profile-form {
  width: 100%;
  max-width: 520px;
  background-color: #1d1f23;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 0 12px rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #00d8ff;
  margin-bottom: 0.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-size: 0.85rem;
  margin-bottom: 0.35rem;
  color: #e0e0e0;
}

.form-group input {
  padding: 0.6rem 0.75rem;
  border: 1px solid #2c2f36;
  border-radius: 8px;
  background-color: #2c2f36;
  color: #fff;
  transition: border 0.2s ease;
  font-size: 0.95rem;
}

.form-group input:focus {
  border-color: #00d8ff;
  outline: none;
}

.save-button {
  padding: 0.9rem;
  font-size: 1rem;
  background-color: #00d8ff;
  border: none;
  border-radius: 8px;
  color: #121212;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.save-button:hover {
  background-color: #0ec7ea;
}

@media (max-width: 768px) {
  .profile-container {
    margin-left: 0;
    padding: 1.5rem 1rem;
  }

  .profile-form {
    padding: 1.5rem 1rem;
  }
}
</style>
