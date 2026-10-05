// =========================
// THEME TOGGLE (DARK MODE)
// =========================

const themeToggle = document.getElementById("themeToggle");
const htmlElement = document.documentElement;

// Restore saved theme or detect system preference
(function initTheme() {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
        htmlElement.setAttribute("data-theme", "dark");
    }
})();

if (themeToggle) {
    themeToggle.addEventListener("click", () => {

        const isDark = htmlElement.getAttribute("data-theme") === "dark";

        if (isDark) {
            htmlElement.removeAttribute("data-theme");
            localStorage.setItem("theme", "light");
        } else {
            htmlElement.setAttribute("data-theme", "dark");
            localStorage.setItem("theme", "dark");
        }
    });
}


// =========================
// MOBILE NAVIGATION
// =========================

const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

if (menuToggle && navLinks) {

    menuToggle.addEventListener("click", () => {
        navLinks.classList.toggle("active");
        menuToggle.setAttribute(
            "aria-expanded",
            navLinks.classList.contains("active") ? "true" : "false"
        );
    });

    document.querySelectorAll(".nav-links a").forEach(link => {
        link.addEventListener("click", () => {
            navLinks.classList.remove("active");
            menuToggle.setAttribute("aria-expanded", "false");
        });
    });

    document.addEventListener("click", (e) => {
        if (
            navLinks.classList.contains("active") &&
            !navLinks.contains(e.target) &&
            !menuToggle.contains(e.target)
        ) {
            navLinks.classList.remove("active");
            menuToggle.setAttribute("aria-expanded", "false");
        }
    });
}


// =========================
// CURRENT YEAR
// =========================

const currentYear = document.getElementById("currentYear");

if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
}


// =========================
// READING PROGRESS BAR
// =========================

const progressBar = document.getElementById("progressBar");

if (progressBar) {

    let ticking = false;

    window.addEventListener("scroll", () => {

        if (!ticking) {

            window.requestAnimationFrame(() => {

                const scrollTop = window.scrollY;
                const docHeight =
                    document.documentElement.scrollHeight - window.innerHeight;

                const progress = docHeight > 0
                    ? (scrollTop / docHeight) * 100
                    : 0;

                progressBar.style.width = progress + "%";
                ticking = false;

            });

            ticking = true;
        }

    }, { passive: true });
}


// =========================
// ACTIVE NAVIGATION ON SCROLL
// =========================

const sections = document.querySelectorAll("section[id]");
const navigationLinks = document.querySelectorAll(".nav-links a");

if (sections.length && navigationLinks.length) {

    let navTicking = false;

    window.addEventListener("scroll", () => {

        if (!navTicking) {

            window.requestAnimationFrame(() => {

                let currentSection = "";

                sections.forEach(section => {
                    const sectionTop = section.offsetTop - 120;
                    const sectionHeight = section.offsetHeight;

                    if (
                        window.scrollY >= sectionTop &&
                        window.scrollY < sectionTop + sectionHeight
                    ) {
                        currentSection = section.getAttribute("id");
                    }
                });

                navigationLinks.forEach(link => {
                    const isActive = link.getAttribute("href") === `#${currentSection}`;
                    link.classList.toggle("active", isActive);

                    if (isActive) {
                        link.setAttribute("aria-current", "page");
                    } else {
                        link.removeAttribute("aria-current");
                    }
                });

                navTicking = false;
            });

            navTicking = true;
        }

    }, { passive: true });
}


// =========================
// SCROLL REVEAL (IntersectionObserver)
// =========================

const revealElements = document.querySelectorAll(".reveal");

if (revealElements.length && "IntersectionObserver" in window) {

    const revealObserver = new IntersectionObserver((entries, observer) => {

        entries.forEach(entry => {

            if (entry.isIntersecting) {
                entry.target.classList.add("revealed");
                observer.unobserve(entry.target);
            }

        });

    }, {
        threshold: 0.12,
        rootMargin: "0px 0px -40px 0px"
    });

    revealElements.forEach(el => revealObserver.observe(el));

} else {
    revealElements.forEach(el => el.classList.add("revealed"));
}


// =========================
// BACK TO TOP BUTTON
// =========================

const backToTop = document.getElementById("backToTop");

if (backToTop) {

    let bttTicking = false;

    window.addEventListener("scroll", () => {

        if (!bttTicking) {

            window.requestAnimationFrame(() => {

                backToTop.classList.toggle("visible", window.scrollY > 600);
                bttTicking = false;

            });

            bttTicking = true;
        }

    }, { passive: true });

    backToTop.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
}


// =========================
// CERTIFICATE LIGHTBOX
// =========================

const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightboxImage");
const lightboxClose = document.getElementById("lightboxClose");
const lightboxPrev = document.getElementById("lightboxPrev");
const lightboxNext = document.getElementById("lightboxNext");
const lightboxCounter = document.getElementById("lightboxCounter");

const previews = Array.from(document.querySelectorAll(".cert-preview"));
let currentIndex = 0;

function getImageFromPreview(preview) {
    return preview ? preview.querySelector("img") : null;
}

function updateLightbox(index) {

    if (!previews.length || !lightboxImage) return;

    currentIndex = (index + previews.length) % previews.length;

    const img = getImageFromPreview(previews[currentIndex]);
    if (!img) return;

    lightboxImage.src = img.src;
    lightboxImage.alt = img.alt || "Certificate preview";

    if (lightboxCounter) {
        lightboxCounter.textContent =
            `${currentIndex + 1} / ${previews.length}`;
    }

    const many = previews.length > 1;
    if (lightboxPrev) lightboxPrev.style.display = many ? "grid" : "none";
    if (lightboxNext) lightboxNext.style.display = many ? "grid" : "none";
}

function openLightbox(index) {

    if (!lightbox || !lightboxImage) return;

    updateLightbox(index);

    lightbox.classList.add("active");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
}

function closeLightbox() {

    if (!lightbox) return;

    lightbox.classList.remove("active");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
}

function showNext() {
    updateLightbox(currentIndex + 1);
}

function showPrev() {
    updateLightbox(currentIndex - 1);
}

previews.forEach((preview, index) => {

    const img = getImageFromPreview(preview);
    if (!img) return;

    preview.addEventListener("click", () => openLightbox(index));

    preview.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openLightbox(index);
        }
    });

});

if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);
if (lightboxNext) lightboxNext.addEventListener("click", showNext);
if (lightboxPrev) lightboxPrev.addEventListener("click", showPrev);

if (lightbox) {
    lightbox.addEventListener("click", (e) => {
        if (e.target === lightbox) closeLightbox();
    });
}

document.addEventListener("keydown", (e) => {

    if (!lightbox || !lightbox.classList.contains("active")) return;

    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowRight") showNext();
    if (e.key === "ArrowLeft") showPrev();

});


// =========================
// DYNAMIC CERTIFICATE PREVIEW
// =========================

document.querySelectorAll(".cert-preview img").forEach(img => {

    const applyOrientation = () => {

        const preview = img.closest(".cert-preview");
        if (!preview || !img.naturalWidth || !img.naturalHeight) return;

        const ratio = img.naturalWidth / img.naturalHeight;

        preview.classList.remove(
            "preview-portrait",
            "preview-landscape",
            "preview-square"
        );

        if (ratio < 0.9) {
            preview.classList.add("preview-portrait");
        } else if (ratio > 1.1) {
            preview.classList.add("preview-landscape");
        } else {
            preview.classList.add("preview-square");
        }

    };

    if (img.complete && img.naturalWidth) {
        applyOrientation();
    } else {
        img.addEventListener("load", applyOrientation);
        img.addEventListener("error", () => {
            const preview = img.closest(".cert-preview");
            if (preview) preview.classList.add("preview-error");
        });
    }

});


// =========================
// FLOATING WHATSAPP — DELAYED APPEARANCE
// =========================

const floatingWhatsapp = document.querySelector(".floating-whatsapp");

if (floatingWhatsapp) {
    floatingWhatsapp.style.opacity = "0";
    floatingWhatsapp.style.transform = "scale(0.5)";
    floatingWhatsapp.style.transition = "opacity 0.4s ease, transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)";

    setTimeout(() => {
        floatingWhatsapp.style.opacity = "1";
        floatingWhatsapp.style.transform = "scale(1)";
    }, 1200);
}