// =========================
// RENDERER.JS — Dynamic Content Loader
// =========================
// يقرأ هذا السكربت ملف data.json ويملأ به عناصر HTML حسب اللغة الحالية.
// اللغة تُحدد تلقائياً من خاصية lang في وسم <html>.
//
// العناصر في HTML يجب أن تحمل أحد هذه الخصائص:
// - data-i18n="path.to.key"           → لملء النص (textContent)
// - data-i18n-attr="attr1:key1|attr2:key2" → لملء سمات مثل href أو alt
// - data-career-items                  → حاوية تُبنى ديناميكياً لعناصر الخبرات
// - data-cert-items                    → حاوية تُبنى ديناميكياً لعناصر الشهادات
// - data-skills-grid                   → حاوية تُبنى ديناميكياً لشبكة المهارات
// - data-contact-items                 → حاوية تُبنى ديناميكياً لبطاقات التواصل
// - data-about-paragraphs              → حاوية فقرات "نبذة عني"
// - data-about-info                    → حاوية بطاقة المعلومات
// - data-education                     → حاوية قسم التعليم
// - data-hero-name                     → اسم البطل (يحتوي على <br><span>)
// - data-footer-copyright              → نص حقوق النشر
// - data-footer-tagline                → السطر التعريفي في الفوتر
// - data-whatsapp-title / -desc / -btn / -link / -tooltip → عناصر بانر الواتساب

(function () {
    'use strict';

    // قراءة اللغة من وسم <html lang="...">
    const LANG = (document.documentElement.lang || 'en').split('-')[0];

    // =========================
    // أيقونات التواصل (SVG)
    // =========================
    const CONTACT_ICONS = {
        facebook: '<svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>',
        linkedin: '<svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.063 2.063 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>',
        github: '<svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>',
        instagram: '<svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm7.846-10.405a1.441 1.441 0 01-2.88 0 1.44 1.44 0 012.88 0z"/></svg>',
        twitter: '<svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
        email: '<svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>',
        phone: '<svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>'
    };

    // =========================
    // دوال مساعدة
    // =========================
    function getNestedValue(obj, path) {
        return path.split('.').reduce((acc, key) => {
            return (acc && acc[key] !== undefined) ? acc[key] : undefined;
        }, obj);
    }

    function escapeHtml(str) {
        if (str === undefined || str === null) return '';
        return String(str).replace(/[&<>"']/g, function (m) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
        });
    }

    // =========================
    // الدالة الرئيسية
    // =========================
    async function render() {
        let data;
        try {
            const res = await fetch('data.json');
            if (!res.ok) throw new Error('Failed to load data.json');
            data = await res.json();
        } catch (err) {
            console.error('[Renderer] Error loading data.json:', err);
            return; // نحتفظ بالمحتوى الأصلي في HTML
        }

        const dict = data[LANG] || data.en;
        if (!dict) return;

        try {
            applyMeta(dict);
            populateStatic(dict);
            populateHero(dict);
            populateAbout(dict);
            populateCareer(dict);
            populateCertifications(dict);
            populateEducation(dict);
            populateSkills(dict);
            populateContact(dict);
            populateFooter(dict);

            // إعادة تهيئة المكونات التفاعلية
            reinitLightbox();
            reinitReveal();

            // السنة الحالية في الفوتر
            const yearEl = document.getElementById('currentYear');
            if (yearEl) yearEl.textContent = new Date().getFullYear();

            // إشعار باقي السكربتات
            document.dispatchEvent(new CustomEvent('dataRendered', { detail: { lang: LANG } }));
        } catch (err) {
            console.error('[Renderer] Error rendering data:', err);
        }
    }

    // =========================
    // Meta
    // =========================
    function applyMeta(dict) {
        if (!dict.meta) return;
        if (dict.meta.title) document.title = dict.meta.title;

        const desc = document.querySelector('meta[name="description"]');
        if (desc && dict.meta.description) desc.setAttribute('content', dict.meta.description);

        const themeColor = document.querySelector('meta[name="theme-color"]');
        if (themeColor && dict.meta.theme_color) themeColor.setAttribute('content', dict.meta.theme_color);

        const keywords = document.querySelector('meta[name="keywords"]');
        if (keywords && dict.meta.keywords) keywords.setAttribute('content', dict.meta.keywords);
    }

    // =========================
    // data-i18n و data-i18n-attr
    // =========================
    function populateStatic(dict) {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const value = getNestedValue(dict, key);
            if (value !== undefined) el.textContent = value;
        });

        document.querySelectorAll('[data-i18n-attr]').forEach(el => {
            const attrs = el.getAttribute('data-i18n-attr').split('|');
            attrs.forEach(pair => {
                const parts = pair.split(':');
                if (parts.length !== 2) return;
                const attr = parts[0].trim();
                const key = parts[1].trim();
                const value = getNestedValue(dict, key);
                if (value !== undefined) el.setAttribute(attr, value);
            });
        });
    }

    // =========================
    // Hero (الاسم مع <br><span>)
    // =========================
    function populateHero(dict) {
        const h = dict.hero;
        if (!h) return;

        const nameEl = document.querySelector('[data-hero-name]');
        if (nameEl && h.name_line1 && h.name_line2) {
            nameEl.innerHTML = `${escapeHtml(h.name_line1)}<br><span>${escapeHtml(h.name_line2)}</span>`;
        }
    }

    // =========================
    // About
    // =========================
    function populateAbout(dict) {
        const a = dict.about;
        if (!a) return;

        const parasContainer = document.querySelector('[data-about-paragraphs]');
        if (parasContainer && Array.isArray(a.paragraphs)) {
            parasContainer.innerHTML = a.paragraphs
                .map(p => `<p>${escapeHtml(p)}</p>`)
                .join('');
        }

        const infoContainer = document.querySelector('[data-about-info]');
        if (infoContainer && Array.isArray(a.info)) {
            infoContainer.innerHTML = a.info.map(item => `
                <div class="info-item">
                    <span>${escapeHtml(item.label)}</span>
                    <strong>${escapeHtml(item.value)}</strong>
                </div>
            `).join('');
        }
    }

    // =========================
    // Career
    // =========================
    function populateCareer(dict) {
        const c = dict.career;
        if (!c) return;

        const container = document.querySelector('[data-career-items]');
        if (!container || !Array.isArray(c.items)) return;

        container.innerHTML = c.items.map(item => {
            const listHtml = (Array.isArray(item.list) && item.list.length)
                ? `<ul class="experience-list">${item.list.map(li => `<li>${escapeHtml(li)}</li>`).join('')}</ul>`
                : '';

            const tagsHtml = (Array.isArray(item.tags) && item.tags.length)
                ? `<div class="tags">${item.tags.map(t => `<span>${escapeHtml(t)}</span>`).join('')}</div>`
                : '';

            return `
                <article class="timeline-item reveal experience-bg" style="--bg-img: url('images/${escapeHtml(item.bg)}');">
                    <div class="timeline-dot"></div>
                    <div class="timeline-content">
                        <div class="timeline-header">
                            <div>
                                <div class="timeline-date">${escapeHtml(item.date)}</div>
                                <h3>${escapeHtml(item.job_title)}</h3>
                                <h4>${escapeHtml(item.company)}</h4>
                            </div>
                            <img src="images/${escapeHtml(item.logo)}" alt="${escapeHtml(item.logo_alt)}" class="company-logo" loading="lazy">
                        </div>
                        <p>${escapeHtml(item.description)}</p>
                        ${listHtml}
                        ${tagsHtml}
                    </div>
                </article>
            `;
        }).join('');
    }

    // =========================
    // Certifications
    // =========================
    function populateCertifications(dict) {
        const c = dict.certifications;
        if (!c) return;

        const container = document.querySelector('[data-cert-items]');
        if (!container || !Array.isArray(c.items)) return;

        const viewLabel = LANG === 'ar' ? 'عرض الشهادة (PDF) ←' : 'View Certificate (PDF) →';

        container.innerHTML = c.items.map(item => `
            <article class="cert-card reveal">
                <div class="cert-head">
                    <div class="cert-icon">
                        <img src="images/${escapeHtml(item.logo)}" alt="${escapeHtml(item.logo_alt)}" loading="lazy">
                    </div>
                    <div>
                        <h3>${escapeHtml(item.title)}</h3>
                        <p>${escapeHtml(item.issuer)}</p>
                        <small>${escapeHtml(item.date)}</small>
                    </div>
                </div>
                <div class="cert-preview" role="button" tabindex="0" aria-label="${escapeHtml(item.image_alt)}">
                    <img src="images/${escapeHtml(item.image)}" alt="${escapeHtml(item.image_alt)}" loading="lazy">
                    <span class="cert-zoom">🔍</span>
                </div>
                <a href="${escapeHtml(item.pdf)}" target="_blank" rel="noopener" class="card-link">${viewLabel}</a>
            </article>
        `).join('');
    }

    // =========================
    // Education
    // =========================
    function populateEducation(dict) {
        const e = dict.education;
        if (!e) return;

        const container = document.querySelector('[data-education]');
        if (!container) return;

        container.innerHTML = `
            <div class="education-year">${escapeHtml(e.year)}</div>
            <div>
                <h3>${escapeHtml(e.degree)}</h3>
                <h4>${escapeHtml(e.field)}</h4>
                <p>${escapeHtml(e.school)}</p>
                <div class="education-stats">
                    ${(e.stats || []).map(s => `<span>${escapeHtml(s)}</span>`).join('')}
                </div>
            </div>
        `;
    }

    // =========================
    // Skills
    // =========================
    function populateSkills(dict) {
        const s = dict.skills;
        if (!s) return;

        const container = document.querySelector('[data-skills-grid]');
        if (!container || !Array.isArray(s.groups)) return;

        container.innerHTML = s.groups.map(g => `
            <div class="skill-group reveal">
                <h3>${escapeHtml(g.title)}</h3>
                <div class="skill-list">
                    ${(g.items || []).map(item => `<span>${escapeHtml(item)}</span>`).join('')}
                </div>
            </div>
        `).join('');
    }

    // =========================
    // Contact
    // =========================
    function populateContact(dict) {
        const c = dict.contact;
        if (!c) return;

        const container = document.querySelector('[data-contact-items]');
        if (container && Array.isArray(c.items)) {
            container.innerHTML = c.items.map(item => `
                <a href="${escapeHtml(item.href)}" target="_blank" rel="noopener noreferrer"
                   class="contact-card contact-${escapeHtml(item.platform)} reveal"
                   aria-label="${escapeHtml(item.title)}">
                    <span class="contact-icon" aria-hidden="true">${CONTACT_ICONS[item.platform] || ''}</span>
                    <div>
                        <h3>${escapeHtml(item.title)}</h3>
                        <p>${escapeHtml(item.value)}</p>
                    </div>
                </a>
            `).join('');
        }

        if (c.whatsapp) {
            const t = document.querySelector('[data-whatsapp-title]');
            const d = document.querySelector('[data-whatsapp-desc]');
            const b = document.querySelector('[data-whatsapp-btn]');
            const link = document.querySelector('[data-whatsapp-link]');
            const tooltip = document.querySelector('[data-whatsapp-tooltip]');
            const floatLink = document.querySelector('.floating-whatsapp');

            if (t) t.textContent = c.whatsapp.title;
            if (d) d.textContent = c.whatsapp.description;
            if (b) b.textContent = c.whatsapp.button;
            if (link) link.setAttribute('href', c.whatsapp.href);
            if (floatLink) floatLink.setAttribute('href', c.whatsapp.href);
            if (tooltip) tooltip.textContent = c.whatsapp.tooltip;
        }
    }

    // =========================
    // Footer
    // =========================
    function populateFooter(dict) {
        const f = dict.footer;
        if (!f) return;

        const copyright = document.querySelector('[data-footer-copyright]');
        const tagline = document.querySelector('[data-footer-tagline]');
        if (copyright) copyright.textContent = f.copyright;
        if (tagline) tagline.textContent = f.tagline;
    }

    // =========================
    // إعادة تهيئة معرض الشهادات
    // =========================
    function reinitLightbox() {
        if (typeof window.reinitCertificateLightbox === 'function') {
            window.reinitCertificateLightbox();
        }
    }

    // =========================
    // إعادة تهيئة ظهور العناصر (Reveal)
    // =========================
    function reinitReveal() {
        const els = document.querySelectorAll('.reveal');
        if (!els.length) return;

        if (!('IntersectionObserver' in window)) {
            els.forEach(el => el.classList.add('revealed'));
            return;
        }

        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

        els.forEach(el => {
            // تجنب العناصر التي تم إظهارها مسبقاً
            if (!el.classList.contains('revealed')) observer.observe(el);
        });
    }

    // =========================
    // الإقلاع
    // =========================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', render);
    } else {
        render();
    }

    // للاستخدام الخارجي (Debugging)
    window.__renderer = { render, getNestedValue };
})();