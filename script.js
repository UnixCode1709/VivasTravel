document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================================================
       MOBILE MENU DRAWER
       ========================================================================== */
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileNav = document.querySelector('.mobile-nav');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

    const toggleMobileMenu = () => {
        mobileMenuBtn.classList.toggle('active');
        mobileNav.classList.toggle('active');
        document.body.style.overflow = mobileNav.classList.contains('active') ? 'hidden' : '';
    };

    mobileMenuBtn?.addEventListener('click', toggleMobileMenu);

    mobileNavLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (mobileNav.classList.contains('active')) {
                toggleMobileMenu();
            }
        });
    });

    /* ==========================================================================
       THEME TOGGLE SYSTEM (LIGHT / DARK)
       ========================================================================== */
    const themeToggleBtns = document.querySelectorAll('.theme-toggle-btn');

    const updateToggleIcons = (isDark) => {
        themeToggleBtns.forEach(btn => {
            const icon = btn.querySelector('i');
            if (isDark) {
                icon.className = 'fa-solid fa-sun';
            } else {
                icon.className = 'fa-solid fa-moon';
            }
        });
    };

    const toggleTheme = () => {
        const isDark = document.body.classList.toggle('dark-theme');
        try { localStorage.setItem('theme', isDark ? 'dark' : 'light'); } catch {}
        updateToggleIcons(isDark);
    };

    themeToggleBtns.forEach(btn => {
        btn.addEventListener('click', toggleTheme);
    });

    // Check saved theme on load
    let savedTheme; try { savedTheme = localStorage.getItem('theme'); } catch {}
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        updateToggleIcons(true);
    } else {
        updateToggleIcons(false);
    }

    /* ==========================================================================
       SCROLL SHADOW & ACTIVE NAV HIGHLIGHT
       ========================================================================== */
    const header = document.querySelector('.header');
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');

    const handleScroll = () => {
        // Sticky header class toggle
        if (window.scrollY > 50) {
            header?.classList.add('scrolled');
        } else {
            header?.classList.remove('scrolled');
        }

        // Active link tracking
        let currentSectionId = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 120;
            const sectionHeight = section.offsetHeight;
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                currentSectionId = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSectionId}`) {
                link.classList.add('active');
            }
        });
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Trigger initial execution

    /* ==========================================================================
       MODALS CONTROL SYSTEM
       ========================================================================== */
    const modals = document.querySelectorAll('.modal');
    const bookingModal = document.getElementById('bookingModal');
    const contactsModal = document.getElementById('contactsModal');
    const helpModal = document.getElementById('helpModal');
    const successModal = document.getElementById('successModal');
    
    const bookingForm = document.getElementById('bookingForm');
    const formDirectionInput = document.getElementById('formDirection');
    const userDirectionInput = document.getElementById('userDirection');

    // Open Modal Function
    const openModal = (modalElement) => {
        if (!modalElement) return;
        modalElement.classList.add('active');
        modalElement.setAttribute('role', 'dialog');
        modalElement.setAttribute('aria-modal', 'true');
        modalElement.dataset.previousFocus = document.activeElement?.id || '';
        modalElement.querySelector('button, a, input')?.focus();
        document.body.style.overflow = 'hidden';
    };

    // Close Modal Function
    const closeModal = (modalElement) => {
        if (!modalElement) return;
        modalElement.classList.remove('active');
        // Only restore scroll if no other modal is active
        const anyActive = Array.from(modals).some(m => m.classList.contains('active') && m !== modalElement);
        if (!anyActive) {
            document.body.style.overflow = '';
        }
    };

    document.addEventListener('keydown', (event) => {
        const active = document.querySelector('.modal.active');
        if (!active) return;
        if (event.key === 'Escape') { closeModal(active); document.querySelector('.booking-trigger, .contact-trigger')?.focus(); }
        if (event.key === 'Tab') {
            const nodes = [...active.querySelectorAll('button:not([disabled]), a[href], input:not([type="hidden"]), textarea')].filter(el => el.offsetParent !== null);
            const first = nodes[0], last = nodes[nodes.length - 1];
            if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
            else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
        }
    });

    // Attach click events to close buttons & backdrops
    modals.forEach(modal => {
        const closeBtn = modal.querySelector('.modal-close');
        const backdrop = modal.querySelector('.modal-backdrop');
        const successCloseBtn = modal.querySelector('.modal-close-success');

        if (closeBtn) {
            closeBtn.addEventListener('click', () => closeModal(modal));
        }
        if (backdrop) {
            backdrop.addEventListener('click', () => closeModal(modal));
        }
        if (successCloseBtn) {
            successCloseBtn.addEventListener('click', () => closeModal(modal));
        }
    });

    // Booking trigger buttons
    document.addEventListener('click', (e) => {
        const trigger = e.target.closest('.booking-trigger');
        if (trigger) {
            e.preventDefault();
            const direction = trigger.getAttribute('data-type') || 'Консультация';
            
            // Set form inputs
            formDirectionInput.value = direction;
            userDirectionInput.value = direction;
            
            // Close other modals if open (e.g. Help modal)
            modals.forEach(m => {
                if (m !== bookingModal) closeModal(m);
            });

            openModal(bookingModal);
        }
    });

    // Contact trigger buttons
    document.querySelectorAll('.contact-trigger').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            openModal(contactsModal);
        });
    });

    // Floating Help button
    const helpBtn = document.getElementById('helpBtn');
    if (helpBtn) {
        helpBtn.addEventListener('click', () => {
            openModal(helpModal);
        });
    }

    // Prepare a message locally. The visitor sends it in their mail application.
    if (bookingForm) {
        const consent = bookingForm.querySelector('[name="personalConsent"]');
        const submit = bookingForm.querySelector('[type="submit"]');
        const status = document.getElementById('formStatus');
        const syncConsent = () => { submit.disabled = !consent.checked; };
        consent.addEventListener('change', syncConsent);
        bookingForm.addEventListener('reset', () => { submit.disabled = true; });
        syncConsent();
        bookingForm.addEventListener('submit', (event) => {
            event.preventDefault();
            if (!consent.checked || !bookingForm.reportValidity()) return;
            const values = new FormData(bookingForm);
            const direction = userDirectionInput.value.trim();
            const body = ['Имя: ' + values.get('name'), 'Телефон: ' + values.get('phone'),
                'Почта: ' + values.get('email'), 'Направление: ' + direction,
                'Комментарий: ' + (values.get('message') || ''),
                'Согласие на обработку персональных данных: предоставлено.',
                'Документ: ' + new URL('consent.html', location.href).href].join('\n');
            const href = 'mailto:vivastravel@gmail.com?subject=' + encodeURIComponent('Обращение с сайта: ' + direction) + '&body=' + encodeURIComponent(body);
            const link = document.createElement('a');
            link.href = href;
            link.click();
            status.textContent = 'Откроется почтовая программа. Проверьте письмо и нажмите «Отправить» в ней. Пока вы не отправили письмо, менеджер не получил обращение. Если программа не открылась, напишите на vivastravel@gmail.com или в WhatsApp.';
        });
    }

    /* ==========================================================================
       FAQ ACCORDION
       ========================================================================== */
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const trigger = item.querySelector('.faq-trigger');
        trigger.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Close all items
            faqItems.forEach(i => i.classList.remove('active'));
            
            // Open clicked item if it was closed
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });

    /* ==========================================================================
       INTERACTIVE BACKGROUND GLOW (MOUSE FOLLOW)
       ========================================================================== */
    const bgContainer = document.querySelector('.liquid-bg-container');
    if (bgContainer && !window.matchMedia('(prefers-reduced-motion: reduce)').matches && window.matchMedia('(pointer: fine)').matches) {
        // Only run on devices with a mouse (pointer: fine)
        const interactiveBlob = document.createElement('div');
        interactiveBlob.className = 'liquid-blob interactive-glow-blob';
        bgContainer.appendChild(interactiveBlob);

        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;
        let blobX = mouseX;
        let blobY = mouseY;
        const lerpFactor = 0.06; // Delay factor for organic liquid-like follow

        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX + window.scrollX;
            mouseY = e.clientY + window.scrollY;
        });

        // Update position smoothly
        const updateGlow = () => {
            blobX += (mouseX - blobX) * lerpFactor;
            blobY += (mouseY - blobY) * lerpFactor;
            
            // Offset by half size (250px) to center it
            interactiveBlob.style.transform = `translate3d(${blobX - 250}px, ${blobY - 250}px, 0)`;
            requestAnimationFrame(updateGlow);
        };
        
        updateGlow();
    }

    /* ==========================================================================
       SCROLL REVEAL ANIMATIONS (INTERSECTION OBSERVER)
       ========================================================================== */
    const revealElements = document.querySelectorAll('.reveal');
    
    if ('IntersectionObserver' in window && revealElements.length > 0) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    observer.unobserve(entry.target); // Stop observing once revealed
                }
            });
        }, {
            root: null,
            threshold: 0.08, // Trigger when 8% of the element is visible
            rootMargin: '0px 0px -40px 0px'
        });

        revealElements.forEach(el => {
            revealObserver.observe(el);
        });

        // Trigger hero content immediately on load (if present)
        const heroContent = document.querySelector('.hero-content');
        if (heroContent && heroContent.classList.contains('reveal')) {
            setTimeout(() => {
                heroContent.classList.add('revealed');
            }, 100);
        }
    } else {
        // Fallback for older browsers
        revealElements.forEach(el => el.classList.add('revealed'));
    }
});
