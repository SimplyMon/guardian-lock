import { createRouter, createWebHistory } from "vue-router";
import { get, ref as dbRef } from "firebase/database";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { auth, database } from "../Firebase/firebase";

// components
import loginComponent from "@/Components/Authenticate/login.vue";
import registerComponent from "@/Components/Authenticate/register.vue";
import homeComponent from "@/Components/Screens/home.vue";
import welcomeComponent from "../Components/Authenticate/welcome.vue";
import logsComponent from "@/Components/Screens/logs.vue";
import usersComponent from "@/Components/Screens/users.vue";

// fallback
import accessDeniedComponents from "@/Components/Layout/Fallback/accessDenied.vue";
import blockedComponents from "@/Components/Layout/Fallback/blocked.vue";

const routes = [
  { path: "/login", component: loginComponent },
  { path: "/register", component: registerComponent },

  // Screens
  {
    path: "/dashboard",
    component: homeComponent,
    meta: { requiresAuth: true },
    name: "dashboard",
  },
  {
    path: "/logs",
    component: logsComponent,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: "/users",
    component: usersComponent,
    meta: { requiresAuth: true, requiresAdmin: true },
  },

  { path: "/", redirect: { name: "welcome" } },
  { path: "/Onboarding-screen", component: welcomeComponent, name: "welcome" },

  // Fallback
  {
    path: "/Access-Denied",
    component: accessDeniedComponents,
    name: "accessdenied",
  },
  {
    path: "/blocked",
    component: blockedComponents,
    name: "blocked",
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation Guard
router.beforeEach(async (to) => {
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
  const requiresAdmin = to.matched.some((record) => record.meta.requiresAdmin);

  const getUser = () =>
    new Promise((resolve) => {
      const user = auth.currentUser;
      if (user) return resolve(user);

      const unsubscribe = onAuthStateChanged(auth, (authUser) => {
        unsubscribe();
        resolve(authUser);
      });
    });

  const currentUser = await getUser();

  if (requiresAuth && !currentUser) {
    return { path: "/login" };
  }

  if (currentUser) {
    const userRef = dbRef(database, `users/${currentUser.uid}`);
    const snapshot = await get(userRef);

    if (snapshot.exists()) {
      const userData = snapshot.val();

      // Blocked check
      if (userData.isBlocked && to.name !== "blocked") {
        return { name: "blocked" };
      }

      if (userData.isBlocked && to.name === "blocked") {
        return true;
      }

      // Pending status check
      if (userData.status === "pending" && to.name !== "accessdenied") {
        return { name: "accessdenied" };
      }

      // Admin-only route check
      if (requiresAdmin && userData.role !== "admin") {
        return { name: "dashboard" };
      }
    }
  }

  return true;
});

export default router;
