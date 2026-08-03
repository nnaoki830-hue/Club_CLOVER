(function () {
  const AUTH_KEY = "club-clover-admin-auth-v1";
  const ADMIN_PASSWORD = "clover2026";
  const protectedPages = ["admin.html", "schedule.html", "profile.html"];

  function currentPage() {
    return window.location.pathname.split("/").pop() || "index.html";
  }

  function isLoggedIn() {
    return sessionStorage.getItem(AUTH_KEY) === "ok";
  }

  function login(password) {
    if (password !== ADMIN_PASSWORD) return false;
    sessionStorage.setItem(AUTH_KEY, "ok");
    return true;
  }

  function logout() {
    sessionStorage.removeItem(AUTH_KEY);
    window.location.href = "login.html";
  }

  function requireLogin() {
    const page = currentPage();
    if (!protectedPages.includes(page) || isLoggedIn()) return;
    const next = encodeURIComponent(`${page}${window.location.search}${window.location.hash}`);
    window.location.replace(`login.html?next=${next}`);
  }

  window.CLOVER_AUTH = {
    login,
    logout,
    isLoggedIn,
    requireLogin
  };

  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-logout]");
    if (!button) return;
    logout();
  });

  requireLogin();
})();
