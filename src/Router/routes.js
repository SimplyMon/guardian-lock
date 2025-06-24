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
import accessDeniedComponents from "@/Components/Layout/Fallback/accessDenied.vue";

const routes = [
  { path: "/login", component: loginComponent },
  { path: "/register", component: registerComponent },

  // Screens
  {
    path: "/dashboard",
    component: homeComponent,
    meta: { requiresAuth: true },
  },
  { path: "/logs", component: logsComponent, meta: { requiresAuth: true } },

  { path: "/", redirect: { name: "welcome" } },
  { path: "/Onboarding-screen", component: welcomeComponent, name: "welcome" },

  // Fallback
  {
    path: "/Access-Denied",
    component: accessDeniedComponents,
    name: "accessdenied",
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation Guard
router.beforeEach(async (to) => {
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);

  const user = auth.currentUser;

  const getUser = () =>
    new Promise((resolve) => {
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
    const statusRef = dbRef(database, `users/${currentUser.uid}/status`);
    const snapshot = await get(statusRef);
    const status = snapshot.val();

    if (status === "pending" && to.name !== "accessdenied") {
      return { name: "accessdenied" };
    }
  }

  // Allow navigation
  return true;
});

export default router;
