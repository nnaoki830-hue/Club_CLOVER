(function () {
  const form = document.getElementById("loginForm");
  const password = document.getElementById("loginPassword");
  const status = document.getElementById("loginStatus");

  function nextPage() {
    const params = new URLSearchParams(window.location.search);
    const next = params.get("next") || "admin.html";
    return next.includes("://") ? "admin.html" : next;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (CLOVER_AUTH.login(password.value)) {
      window.location.href = nextPage();
      return;
    }
    status.textContent = "パスワードが違います";
    password.value = "";
    password.focus();
  });
})();
