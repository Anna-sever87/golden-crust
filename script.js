/* Четыре экрана, переходы по ссылкам, стрелкам и клавишам. */
(() => {
  "use strict";
  const screens = Array.from(document.querySelectorAll("[data-screen]"));
  const navigation = document.querySelector(".screen-navigation");
  const previous = document.getElementById("previous-page");
  const next = document.getElementById("next-page");
  const counter = document.getElementById("page-counter");
  const title = document.getElementById("page-title");
  const links = Array.from(document.querySelectorAll("[data-page-link]"));
  if (!screens.length || !navigation || !previous || !next) return;
  let currentIndex = 0;

  function indexFromHash() {
    const route = window.location.hash.slice(1);
    const index = screens.findIndex(screen => screen.id === route);
    return index < 0 ? 0 : index;
  }

  function showScreen(index, updateAddress, moveFocus) {
    currentIndex = Math.max(0, Math.min(screens.length - 1, index));
    const current = screens[currentIndex];
    screens.forEach((screen, screenIndex) => {
      screen.hidden = screenIndex !== currentIndex;
      if (screenIndex === currentIndex) screen.scrollTop = 0;
    });
    links.forEach(link => {
      if (link.getAttribute("href") === "#" + current.id) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
    previous.disabled = currentIndex === 0;
    next.disabled = currentIndex === screens.length - 1;
    counter.textContent = (currentIndex + 1) + " / " + screens.length;
    title.textContent = current.dataset.screen;
    if (updateAddress && window.location.hash !== "#" + current.id) {
      try {
        window.history.pushState(null, "", "#" + current.id);
      } catch (_) {
        // Переходы работают и в просмотрщиках, ограничивающих History API.
      }
    }
    if (moveFocus) {
      const heading = current.querySelector("h1, h2");
      if (heading) heading.focus({ preventScroll: true });
    }
  }

  document.body.classList.add("screen-mode");
  navigation.hidden = false;
  showScreen(indexFromHash(), false, false);

  document.addEventListener("click", event => {
    if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest('a[href^="#"]');
    if (!link) return;
    const id = link.getAttribute("href").slice(1);
    if (id === "main") {
      event.preventDefault();
      const heading = screens[currentIndex].querySelector("h1, h2");
      if (heading) heading.focus({ preventScroll: true });
      return;
    }
    const targetIndex = screens.findIndex(screen => screen.id === id);
    if (targetIndex >= 0) {
      event.preventDefault();
      showScreen(targetIndex, true, true);
    }
  });

  previous.addEventListener("click", () => showScreen(currentIndex - 1, true, true));
  next.addEventListener("click", () => showScreen(currentIndex + 1, true, true));
  window.addEventListener("popstate", () => showScreen(indexFromHash(), false, false));
  window.addEventListener("hashchange", () => showScreen(indexFromHash(), false, false));

  document.addEventListener("keydown", event => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.target.closest('input, textarea, select, [contenteditable="true"]')) return;
    if (event.key === "ArrowRight" && currentIndex < screens.length - 1) {
      event.preventDefault();
      showScreen(currentIndex + 1, true, true);
    } else if (event.key === "ArrowLeft" && currentIndex > 0) {
      event.preventDefault();
      showScreen(currentIndex - 1, true, true);
    }
  });
})();

