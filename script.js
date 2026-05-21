/**
 * EXPIA Website — script.js
 *
 * CONFIGURATION
 * Modifier l'URL du webhook ci-dessous selon votre environnement.
 */

const CONFIG = {
    webhookUrl: 'https://n8n.srv1533894.hstgr.cloud/webhook-test/cb824ff2-3444-4e2b-b88a-efac52e75938',
    rateLimitMs: 10000,
    maxFieldLength: { name: 200, email: 254, message: 5000 }
};

// ============================================================
// UTILITAIRES DE SECURITE
// ============================================================

function sanitize(str) {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;' };
    return String(str).replace(/[&<>"']/g, c => map[c]);
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateFormData(fields) {
    const name = fields.name?.trim() || '';
    const email = fields.email?.trim() || '';
    const message = fields.message?.trim() || '';

    if (!name) return { valid: false, error: 'Veuillez saisir votre nom.' };
    if (name.length > CONFIG.maxFieldLength.name) return { valid: false, error: 'Le nom est trop long.' };
    if (!email) return { valid: false, error: 'Veuillez saisir votre email.' };
    if (!isValidEmail(email)) return { valid: false, error: 'Adresse email invalide.' };
    if (email.length > CONFIG.maxFieldLength.email) return { valid: false, error: 'Adresse email trop longue.' };
    if (!message) return { valid: false, error: 'Veuillez ecrire un message.' };
    if (message.length > CONFIG.maxFieldLength.message) return { valid: false, error: 'Le message est trop long.' };

    return {
        valid: true,
        data: { nom: sanitize(name), email: sanitize(email), message: sanitize(message) }
    };
}

// ============================================================
// INITIALISATION
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Cursor Glow ---
    const cursorGlow = document.getElementById('cursorGlow');
    if (cursorGlow) {
        let cursorTimeout;
        document.addEventListener('mousemove', (e) => {
            cursorGlow.style.left = `${e.clientX}px`;
            cursorGlow.style.top = `${e.clientY}px`;
            cursorGlow.style.opacity = '1';
            clearTimeout(cursorTimeout);
            cursorTimeout = setTimeout(() => { cursorGlow.style.opacity = '0'; }, 1500);
        });
    }

    // --- 2. Navigation Scrolled State ---
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
    });

    // --- 3. Smooth Scroll Anchor Links ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const el = document.querySelector(targetId);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });

    // --- 4. Scroll Reveal (IntersectionObserver) ---
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

    // --- 5. Mouse Hover — Bento Cards ---
    document.querySelectorAll('.bento-card').forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
            card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
        });
    });

    // --- 6. Protection Email (anti-scraping) ---
    const contactEmail = document.getElementById('contactEmail');
    if (contactEmail) {
        const user = 'contact';
        const domain = 'expia.fr';
        const email = `${user}@${domain}`;
        contactEmail.href = `mailto:${email}`;
        contactEmail.textContent = email;
    }

    // --- 7. Formulaire — Soumission securisee vers Webhook n8n ---
    const form = document.getElementById('contactForm');
    if (!form) return;

    const btn = document.getElementById('submitBtn');
    const originalHTML = btn.innerHTML;
    let lastSubmissionTime = 0;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Honeypot
        const honeypot = form.querySelector('#website');
        if (honeypot && honeypot.value.trim() !== '') {
            btn.textContent = 'Demande envoyee !';
            btn.style.background = '#10b981';
            form.reset();
            setTimeout(() => resetButton(), 3000);
            return;
        }

        // Rate limit
        const now = Date.now();
        if (now - lastSubmissionTime < CONFIG.rateLimitMs) {
            const wait = Math.ceil((CONFIG.rateLimitMs - (now - lastSubmissionTime)) / 1000);
            btn.textContent = `Patientez ${wait}s...`;
            btn.style.background = '#f59e0b';
            setTimeout(() => resetButton(), 2000);
            return;
        }
        lastSubmissionTime = now;

        // Validation
        const fields = {
            name: form.querySelector('#name')?.value,
            email: form.querySelector('#email')?.value,
            message: form.querySelector('#message')?.value
        };

        const validation = validateFormData(fields);
        if (!validation.valid) {
            btn.textContent = validation.error;
            btn.style.background = '#ef4444';
            setTimeout(() => resetButton(), 3000);
            return;
        }

        // Envoi
        btn.innerHTML = `<span class="spinner"></span> Envoi en cours...`;
        btn.style.opacity = '0.8';
        btn.disabled = true;

        const payload = { ...validation.data, submittedAt: new Date().toISOString() };

        try {
            const response = await fetch(CONFIG.webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (response.ok) {
                btn.textContent = 'Demande envoyee !';
                btn.style.background = '#10b981';
                form.reset();
            } else {
                throw new Error(`HTTP ${response.status}`);
            }
        } catch (error) {
            console.error('Erreur webhook:', error);
            btn.textContent = 'Erreur reseau — reessayez';
            btn.style.background = '#ef4444';
        } finally {
            setTimeout(() => resetButton(), 3000);
        }
    });

    function resetButton() {
        btn.innerHTML = originalHTML;
        btn.style.background = '';
        btn.style.opacity = '1';
        btn.disabled = false;
    }

});
