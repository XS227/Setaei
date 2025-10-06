const siteMenu = document.querySelector(".site-menu");
const menuToggle = document.querySelector(".menu-toggle");
const scrollIndicator = document.querySelector(".scroll-indicator");
const navLinks = Array.from(document.querySelectorAll(".site-menu a"));
const header = document.querySelector(".site-header");

if (menuToggle && siteMenu) {
  menuToggle.addEventListener("click", () => {
    const expanded = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!expanded));
    siteMenu.classList.toggle("is-open", !expanded);
  });

  siteMenu.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      menuToggle.setAttribute("aria-expanded", "false");
      siteMenu.classList.remove("is-open");
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      menuToggle.setAttribute("aria-expanded", "false");
      siteMenu.classList.remove("is-open");
    }
  });
}

const updateScrollIndicator = () => {
  if (!scrollIndicator) return;
  const scrollY = window.scrollY;
  const docHeight = document.documentElement.scrollHeight;
  const viewportHeight = window.innerHeight;
  const scrollable = docHeight - viewportHeight;
  const progress = scrollable > 0 ? Math.min(scrollY / scrollable, 1) : 0;
  scrollIndicator.style.setProperty("--progress", `${progress * 100}%`);
};

updateScrollIndicator();
window.addEventListener("scroll", () => {
  updateScrollIndicator();
});
window.addEventListener("resize", updateScrollIndicator);

const sections = Array.from(document.querySelectorAll("main section[id]"));

if (sections.length && navLinks.length) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute("id");
          navLinks.forEach((link) => {
            const matches = link.getAttribute("href") === `#${id}`;
            link.classList.toggle("is-active", matches);
            if (matches) {
              link.setAttribute("aria-current", "page");
            } else {
              link.removeAttribute("aria-current");
            }
          });
        }
      });
    },
    {
      rootMargin: "-50% 0px -45% 0px",
      threshold: 0.01,
    }
  );

  sections.forEach((section) => observer.observe(section));
}

const yearElement = document.getElementById("year");
if (yearElement) {
  yearElement.textContent = new Date().getFullYear().toString();
}

if (header) {
  const adjustHeaderShadow = () => {
    header.style.boxShadow = window.scrollY > 10 ? "0 12px 40px rgba(4, 2, 20, 0.3)" : "none";
  };
  adjustHeaderShadow();
  window.addEventListener("scroll", adjustHeaderShadow);
}
