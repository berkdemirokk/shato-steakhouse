// ============================================
// SHATO STEAKHOUSE - INTERACTIONS
// ============================================

document.addEventListener('DOMContentLoaded', () => {

    // ====== LENIS SMOOTH SCROLL ======
    let lenisInstance = null;
    if (typeof Lenis !== 'undefined') {
        lenisInstance = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothWheel: true,
            wheelMultiplier: 1.0,
            touchMultiplier: 1.5,
        });
        function rafLoop(time) {
            lenisInstance.raf(time);
            requestAnimationFrame(rafLoop);
        }
        requestAnimationFrame(rafLoop);
    }

    // ====== GSAP SCROLL ANIMATIONS ======
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);

        // Sync ScrollTrigger with Lenis
        if (lenisInstance) {
            lenisInstance.on('scroll', ScrollTrigger.update);
            gsap.ticker.add((time) => { lenisInstance.raf(time * 1000); });
            gsap.ticker.lagSmoothing(0);
        }

        // Spread reveals — image scales, text fades up
        gsap.utils.toArray('.spread').forEach((spread) => {
            const img = spread.querySelector('.spread-image');
            const num = spread.querySelector('.spread-num');
            const title = spread.querySelector('.spread-title');
            const text = spread.querySelector('.spread-text');
            const tag = spread.querySelector('.spread-tag');

            if (img) {
                gsap.from(img, {
                    scale: 1.2,
                    duration: 1.8,
                    ease: 'expo.out',
                    scrollTrigger: { trigger: spread, start: 'top 80%', toggleActions: 'play none none none' }
                });
            }
            gsap.from([num, title, text, tag].filter(Boolean), {
                y: 60,
                opacity: 0,
                duration: 1.2,
                stagger: 0.15,
                ease: 'expo.out',
                scrollTrigger: { trigger: spread, start: 'top 70%', toggleActions: 'play none none none' }
            });
        });

        // Section titles
        gsap.utils.toArray('.section-title, .collection-headline').forEach((el) => {
            gsap.from(el, {
                y: 80,
                opacity: 0,
                duration: 1.4,
                ease: 'expo.out',
                scrollTrigger: { trigger: el, start: 'top 85%' }
            });
        });

        // About images parallax
        const aboutBg = document.querySelector('.about-images');
        if (aboutBg) {
            gsap.to(aboutBg, {
                backgroundPosition: '50% 80%',
                ease: 'none',
                scrollTrigger: {
                    trigger: aboutBg,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: true
                }
            });
        }

        // Marquee speed-up on scroll
        const marquee = document.querySelector('.marquee-track');
        if (marquee) {
            ScrollTrigger.create({
                trigger: '.marquee',
                start: 'top bottom',
                end: 'bottom top',
                onUpdate: (self) => {
                    const v = self.getVelocity();
                    marquee.style.animationDuration = Math.max(8, 40 - Math.abs(v) / 50) + 's';
                }
            });
        }
    }

    // ====== 3D TILT ON CARDS ======
    if (typeof VanillaTilt !== 'undefined') {
        VanillaTilt.init(document.querySelectorAll('.feature-card'), {
            max: 8,
            speed: 600,
            glare: true,
            'max-glare': 0.15,
            scale: 1.02,
        });
        VanillaTilt.init(document.querySelectorAll('.contact-card'), {
            max: 5,
            speed: 400,
        });
    }

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
