// ============================================
// SHATO STEAKHOUSE - INTERACTIONS
// ============================================

document.addEventListener('DOMContentLoaded', () => {

    // Navbar scroll effect + scroll progress bar
    const navbar = document.getElementById('navbar');
    const progress = document.getElementById('scrollProgress');
    const onScroll = () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progressPct = (scrollTop / docHeight) * 100;
        if (progress) progress.style.width = progressPct + '%';

        if (scrollTop > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // Live status indicator (open / closed based on hours: 12:00 - 23:00)
    const liveStatus = document.getElementById('liveStatus');
    if (liveStatus) {
        const updateStatus = () => {
            const now = new Date();
            const h = now.getHours();
            const isOpen = h >= 12 && h < 23;
            const dot = liveStatus.querySelector('.status-dot');
            const text = liveStatus.querySelector('.status-text');
            if (isOpen) {
                liveStatus.classList.remove('closed');
                dot.classList.remove('closed');
                text.textContent = 'ŞU AN AÇIK';
            } else {
                liveStatus.classList.add('closed');
                dot.classList.add('closed');
                text.textContent = 'ŞU AN KAPALI';
            }
        };
        updateStatus();
        setInterval(updateStatus, 60000);
    }

    // Animated counter for stats
    const counters = document.querySelectorAll('[data-count]');
    const counterObs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseInt(el.dataset.count, 10);
                const suffix = el.dataset.suffix || '';
                const prefix = el.dataset.prefix || '';
                const duration = 1600;
                const start = performance.now();
                const step = (now) => {
                    const elapsed = now - start;
                    const t = Math.min(elapsed / duration, 1);
                    const eased = 1 - Math.pow(1 - t, 3);
                    const value = Math.round(target * eased);
                    el.textContent = prefix + value + suffix;
                    if (t < 1) requestAnimationFrame(step);
                };
                requestAnimationFrame(step);
                counterObs.unobserve(el);
            }
        });
    }, { threshold: 0.5 });
    counters.forEach(c => counterObs.observe(c));

    // Mobile menu toggle
    const mobileToggle = document.getElementById('mobileToggle');
    const navLinks = document.querySelector('.nav-links');
    mobileToggle.addEventListener('click', () => {
        mobileToggle.classList.toggle('active');
        navLinks.classList.toggle('active');
    });

    // Close mobile menu on link click
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            mobileToggle.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });

    // Menu tabs
    const tabs = document.querySelectorAll('.menu-tab');
    const panels = document.querySelectorAll('.menu-panel');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.getAttribute('data-tab');
            tabs.forEach(t => t.classList.remove('active'));
            panels.forEach(p => p.classList.remove('active'));
            tab.classList.add('active');
            document.querySelector(`[data-panel="${target}"]`).classList.add('active');
        });
    });

    // Reservation form
    const form = document.getElementById('reservationForm');
    if (form) {
        // Min date = today
        const dateInput = document.getElementById('date');
        const today = new Date().toISOString().split('T')[0];
        dateInput.setAttribute('min', today);

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const data = new FormData(form);
            const name = data.get('name');
            const phone = data.get('phone');
            const date = data.get('date');
            const time = data.get('time');
            const guests = data.get('guests');
            const notes = data.get('notes') || '-';

            const message = `*Rezervasyon Talebi - Shato Steakhouse*%0A%0A` +
                `*Ad Soyad:* ${name}%0A` +
                `*Telefon:* ${phone}%0A` +
                `*Tarih:* ${date}%0A` +
                `*Saat:* ${time}%0A` +
                `*Kişi Sayısı:* ${guests}%0A` +
                `*Not:* ${notes}`;

            window.open(`https://wa.me/902124373884?text=${message}`, '_blank');

            const btn = form.querySelector('button[type="submit"]');
            const originalText = btn.textContent;
            btn.textContent = 'Talebiniz Gönderildi!';
            btn.disabled = true;
            setTimeout(() => {
                btn.textContent = originalText;
                btn.disabled = false;
                form.reset();
            }, 3000);
        });
    }

    // Smooth scroll-into-view animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    document.querySelectorAll('.feature-card, .menu-item, .gallery-item').forEach(el => {
        observer.observe(el);
    });

    // Active nav link on scroll
    const sections = document.querySelectorAll('section[id]');
    const navLinkEls = document.querySelectorAll('.nav-links a');
    const updateActiveLink = () => {
        const scrollPos = window.scrollY + 100;
        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');
            if (scrollPos >= top && scrollPos < top + height) {
                navLinkEls.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    };
    window.addEventListener('scroll', updateActiveLink, { passive: true });
});
