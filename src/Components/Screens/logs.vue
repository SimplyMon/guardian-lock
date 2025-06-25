<template>
  <DashboardLayout @logout="logout">
    <div class="log-page">
      <header class="log-page__header">
        <h1>Activity <span>Logs</span></h1>
        <div class="controls">
          <input
            v-model="filterText"
            type="search"
            placeholder="Search logs..."
            class="controls__search"
          />
          <select v-model="filterMethod" class="controls__select">
            <option value="">All Methods ▼</option>
            <option value="PIN">PIN ▼</option>
            <option value="APP">APP ▼</option>
            <option value="FACE">FACE ▼</option>
            <option value="RFID">RFID ▼</option>
          </select>
          <label for="date" style="align-items: center; display: flex"
            >Date filter</label
          >
          <input
            id="date"
            v-model="filterDate"
            type="date"
            class="controls__search"
          />
        </div>
      </header>

      <div v-if="paginatedLogs.length" class="log-list">
        <template v-for="(group, date) in groupedLogs">
          <h2 class="log-list__date">{{ date }}</h2>
          <div class="log-list__items">
            <div v-for="log in group" :key="log.id" class="log-card">
              <div class="log-card__icon">
                <i :class="['fas', getMethodIcon(log.method)]"></i>
              </div>
              <div class="log-card__body">
                <div class="log-card__title">{{ log.name }}</div>
                <div class="log-card__meta">
                  <span class="badge" :class="`badge--${log.method}`">
                    {{ log.method }}
                  </span>
                  <time>{{ formatTimestamp(log.timestamp) }}</time>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
      <div v-else class="log-page__empty">
        <p>No logs found.</p>
      </div>

      <nav v-if="pageCount > 1" class="pagination">
        <button :disabled="page === 1" @click="page--">Prev</button>
        <span>Page {{ page }} of {{ pageCount }}</span>
        <button :disabled="page === pageCount" @click="page++">Next</button>
      </nav>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { signOut } from "firebase/auth";
import { getDatabase, ref as dbRef, onValue } from "firebase/database";
import { auth } from "../../Firebase/firebase";
import DashboardLayout from "../Layout/DashboardLayout.vue";

// state
const logs = ref([]);
const filterText = ref("");
const filterMethod = ref("");
const page = ref(1);
const perPage = 8;
const filterDate = ref("");

const router = useRouter();

// logout handler
const logout = async () => {
  try {
    await signOut(auth);
    router.push({ name: "welcome" });
  } catch (error) {
    console.error("Logout failed:", error);
  }
};

// fetch logs
onMounted(() => {
  const db = getDatabase();
  onValue(dbRef(db, "logs"), (snap) => {
    const data = snap.val() || {};
    logs.value = Object.entries(data)
      .map(([id, l]) => ({ id, ...l }))
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  });
});

// formatting
const formatTimestamp = (ts) => {
  return new Date(ts).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};
const getMethodIcon = (method) => {
  switch (method) {
    case "PIN":
      return "fa-keyboard";
    case "APP":
      return "fa-mobile-alt";
    case "FACE":
      return "fa-face-smile";
    case "RFID":
      return "fa-id-card";
    default:
      return "fa-question";
  }
};

// filtering
const filtered = computed(() =>
  logs.value.filter((l) => {
    const matchesText = l.name
      .toLowerCase()
      .includes(filterText.value.toLowerCase());

    const matchesMethod =
      !filterMethod.value || l.method === filterMethod.value;

    const matchesDate =
      !filterDate.value ||
      new Date(l.timestamp).toLocaleDateString("en-CA") === filterDate.value;

    return matchesText && matchesMethod && matchesDate;
  })
);

// pagination
const pageCount = computed(() => Math.ceil(filtered.value.length / perPage));
const paginatedLogs = computed(() =>
  filtered.value.slice((page.value - 1) * perPage, page.value * perPage)
);

const groupedLogs = computed(() => {
  return paginatedLogs.value.reduce((groups, log) => {
    const date = new Date(log.timestamp).toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
    (groups[date] = groups[date] || []).push(log);
    return groups;
  }, {});
});
</script>

<style scoped>
/* test */
.log-page {
  background-color: #1c1c20;
  min-height: 100vh;
  padding: 2rem;
  color: #e0e0e0;
  margin-left: 300px;
  transition: background-color 0.3s ease;
  max-width: 100%;
  box-sizing: border-box;
}

.log-page__header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6rem;
}
.log-page__header span {
  color: #00d8ff;
}

.log-page__header h1 {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 600;
  color: #e0e0e0;
}

.controls {
  display: flex;
  gap: 0.75rem;
}

.controls__search,
.controls__select {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  padding: 0.5rem 0.75rem;
  border: none;
  border-radius: 6px;
  background: #2e2e38;
  color: #e0e0e0;
  outline: none;
  font-size: 0.95rem;
  transition: background 0.3s ease, box-shadow 0.2s;
}

.controls__search:focus,
.controls__select:focus {
  box-shadow: 0 0 0 2px #00d8ff;
}

.controls__search::placeholder {
  color: #999;
}
.controls__search[type="date"] {
  width: auto;
}

.log-list__date {
  margin: 1rem 0 0.5rem;
  font-size: 1rem;
  font-weight: 500;
  color: #00d8ff;
}

.log-list__items {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  width: 100%;
}

.log-card {
  background: #2a2a2f;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.6);
  display: flex;
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s;
}

.log-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.6);
}

.log-card__icon {
  background: #1c1c20;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.log-card__icon i {
  font-size: 1.5rem;
  color: #00d8ff;
}

.log-card__body {
  padding: 0.75rem 1rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.log-card__title {
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #e0e0e0;
}

.log-card__meta {
  font-size: 0.875rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #999;
}

.badge {
  border-radius: 4px;
  text-transform: uppercase;
  font-size: 0.75rem;
  font-weight: 600;
}

.badge--lock {
  background: #e74c3c;
  color: #fff;
}

.badge--unlock {
  background: #2ecc71;
  color: #000;
}

/* .pagination {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
} */
.pagination {
  position: fixed;
  bottom: 0;
  left: 300px;
  width: calc(100% - 300px);
  background: #1c1c20;
  padding: 1rem;
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 15px;
}

.pagination button {
  background: #00d8ff;
  border: none;
  padding: 0.5rem 1rem;
  color: #121212;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.3s ease, opacity 0.2s;
}

.pagination button:hover:not(:disabled) {
  background-color: rgb(107, 170, 226);
}

.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.log-page__empty {
  text-align: center;
  margin: 4rem 0;
  color: #999;
  font-style: italic;
}

::-webkit-scrollbar {
  width: 8px;
}
::-webkit-scrollbar-track {
  background: #1a1a1d;
}
::-webkit-scrollbar-thumb {
  background: #555;
  border-radius: 8px;
}
::-webkit-scrollbar-thumb:hover {
  background: #777;
}

/* Mobile */
@media (max-width: 768px) {
  .log-page__header {
    margin-bottom: 2rem;
  }
  .log-page {
    padding: 1rem;
    margin-left: 0;
  }

  .log-page__header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .controls {
    flex-direction: column;
    width: 100%;
  }

  .controls__search,
  .controls__select {
    width: 100%;
  }

  .log-list__items {
    grid-template-columns: 1fr;
  }

  .log-card {
    flex-direction: row;
  }

  .log-card__icon {
    padding: 0.75rem;
    justify-content: flex-start;
  }

  .log-card__body {
    padding: 0.75rem;
  }

  .log-card__meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }

  .pagination {
    flex-direction: column;
    gap: 0.5rem;
  }

  .pagination span {
    font-size: 0.9rem;
    text-align: center;
  }

  .pagination button {
    width: 50%;
  }
  .pagination {
    position: static;
    width: 100%;
    margin-top: 2rem;
    padding: 0;
    background: transparent;
    flex-direction: row;
    gap: 0.5rem;
  }
}
</style>
