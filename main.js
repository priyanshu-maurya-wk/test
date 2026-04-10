/* ============================================================
   NOIR VESSELS — Main JavaScript
   Requires: GSAP, ScrollTrigger, Lenis (loaded via CDN)
   ============================================================ */

(function () {
  'use strict';

  /* ---- Reduced-motion check ---- */
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ================================================================
     1. LOADER
  ================================================================ */
  function initLoader() {
    const loader = document.getElementById('loader');
    if (!loader) return;
    setTimeout(() => {
      loader.classList.add('hidden');
      document.body.style.overflow = '';
      initAll();
    }, 1400);
    document.body.style.overflow = 'hidden';
  }

  /* ================================================================
     2. LENIS SMOOTH SCROLL
  ================================================================ */
  let lenis = null;

  function initLenis() {
    if (prefersReducedMotion || typeof Lenis === 'undefined') {
      initScrollTriggerDefault();
      return;
    }

    lenis = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 2,
    });

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);
  }

  function initScrollTriggerDefault() {
    if (typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.defaults({ scroller: window });
    }
  }

  /* ================================================================
     3. SCROLL PROGRESS BAR
  ================================================================ */
  function initScrollProgress() {
    const bar = document.getElementById('scroll-progress');
    if (!bar) return;

    const update = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      bar.style.width = progress + '%';
    };

    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  /* ================================================================
     4. NAVIGATION
  ================================================================ */
  function initNav() {
    const nav = document.getElementById('nav');
    if (!nav) return;

    /* Scrolled state */
    const updateNav = () => {
      if (window.scrollY > 50) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
    };
    window.addEventListener('scroll', updateNav, { passive: true });
    updateNav();

    /* Active link */
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = nav.querySelectorAll('.nav-links a');
    navLinks.forEach((link) => {
      const href = link.getAttribute('href');
      if (href === currentPath || (currentPath === '' && href === 'index.html')) {
        link.classList.add('active');
      }
    });

    /* Hamburger mobile menu */
    const hamburger = document.querySelector('.hamburger');
    const mobileMenu = document.querySelector('.mobile-menu');
    if (hamburger && mobileMenu) {
      hamburger.addEventListener('click', () => {
        const isOpen = mobileMenu.classList.contains('open');
        mobileMenu.classList.toggle('open', !isOpen);
        hamburger.classList.toggle('open', !isOpen);
        hamburger.setAttribute('aria-expanded', String(!isOpen));
        document.body.style.overflow = isOpen ? '' : 'hidden';
      });

      mobileMenu.querySelectorAll('a').forEach((a) => {
        a.addEventListener('click', () => {
          mobileMenu.classList.remove('open');
          hamburger.classList.remove('open');
          hamburger.setAttribute('aria-expanded', 'false');
          document.body.style.overflow = '';
        });
      });
    }
  }

  /* ================================================================
     5. SVG NAV PATH DRAW
  ================================================================ */
  function initNavSVG() {
    const navList = document.querySelector('.nav-links');
    if (!navList) return;

    const items = navList.querySelectorAll('li:not(.nav-cta-item)');

    items.forEach((li) => {
      /* Create an SVG under the link */
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('id', 'nav-svg-canvas');
      svg.setAttribute('aria-hidden', 'true');
      svg.setAttribute('focusable', 'false');

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      /* Wave path: M0,6 Q25,0 50,6 Q75,12 100,6 */
      path.setAttribute('d', 'M0,6 Q25,0 50,6 Q75,12 100,6');
      path.setAttribute('vector-effect', 'non-scaling-stroke');

      svg.appendChild(path);
      li.style.position = 'relative';
      li.appendChild(svg);

      /* Animate on hover using GSAP if available */
      li.addEventListener('mouseenter', () => {
        if (typeof gsap !== 'undefined') {
          gsap.to(path, {
            strokeDashoffset: 0,
            duration: 0.55,
            ease: 'power2.out',
          });
        }
        path.style.strokeDashoffset = '0';
      });

      li.addEventListener('mouseleave', () => {
        if (typeof gsap !== 'undefined') {
          gsap.to(path, {
            strokeDashoffset: 300,
            duration: 0.4,
            ease: 'power2.in',
          });
        }
        path.style.strokeDashoffset = '300';
      });
    });
  }

  /* ================================================================
     6. CUSTOM CURSOR
  ================================================================ */
  function initCursor() {
    const dot = document.getElementById('cursor-dot');
    const follower = document.getElementById('cursor-follower');
    const label = document.getElementById('cursor-label');
    if (!dot || !follower) return;

    let mouseX = 0, mouseY = 0;
    let followerX = 0, followerY = 0;
    let followerRaf;

    const onMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.left = mouseX + 'px';
      dot.style.top = mouseY + 'px';
      if (label) {
        label.style.left = (mouseX + 24) + 'px';
        label.style.top = (mouseY - 16) + 'px';
      }
    };

    const animateFollower = () => {
      followerX += (mouseX - followerX) * 0.1;
      followerY += (mouseY - followerY) * 0.1;
      follower.style.left = followerX + 'px';
      follower.style.top = followerY + 'px';
      followerRaf = requestAnimationFrame(animateFollower);
    };

    document.addEventListener('mousemove', onMove, { passive: true });
    followerRaf = requestAnimationFrame(animateFollower);

    /* Contextual states */
    const addHoverState = (selector, state, labelText) => {
      document.querySelectorAll(selector).forEach((el) => {
        el.addEventListener('mouseenter', () => {
          follower.classList.add(state);
          if (label && labelText) {
            label.textContent = labelText;
            label.classList.add('visible');
          }
        });
        el.addEventListener('mouseleave', () => {
          follower.classList.remove(state);
          if (label) label.classList.remove('visible');
        });
      });
    };

    addHoverState('a:not(.btn)', 'link-hover', null);
    addHoverState('.btn-primary', 'btn-hover', 'EXPLORE');
    addHoverState('.card', 'link-hover', 'VIEW');
    addHoverState('.journal-card', 'link-hover', 'READ');
    addHoverState('.list-item-header', 'link-hover', null);

    /* Hide cursor when leaving window */
    document.addEventListener('mouseleave', () => {
      dot.style.opacity = '0';
      follower.style.opacity = '0';
    });
    document.addEventListener('mouseenter', () => {
      dot.style.opacity = '1';
      follower.style.opacity = '1';
    });
  }

  /* ================================================================
     7. MAGNETIC BUTTONS
  ================================================================ */
  function initMagneticButtons() {
    if (prefersReducedMotion) return;

    document.querySelectorAll('.btn-primary, .btn-outline').forEach((btn) => {
      let rafId;

      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = (e.clientX - cx) * 0.28;
        const dy = (e.clientY - cy) * 0.28;

        cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
          if (typeof gsap !== 'undefined') {
            gsap.to(btn, { x: dx, y: dy, duration: 0.3, ease: 'power2.out' });
          } else {
            btn.style.transform = `translate(${dx}px, ${dy}px)`;
          }
        });
      });

      btn.addEventListener('mouseleave', () => {
        cancelAnimationFrame(rafId);
        if (typeof gsap !== 'undefined') {
          gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' });
        } else {
          btn.style.transform = '';
        }
      });
    });
  }

  /* ================================================================
     8. SPLIT TEXT (custom)
  ================================================================ */
  function splitText(element) {
    if (!element) return [];
    const text = element.textContent;
    element.textContent = '';
    element.setAttribute('aria-label', text);

    const chars = [];
    text.split('').forEach((char) => {
      const span = document.createElement('span');
      span.className = 'split-char';
      span.setAttribute('aria-hidden', 'true');
      span.textContent = char === ' ' ? '\u00A0' : char;
      element.appendChild(span);
      chars.push(span);
    });

    return chars;
  }

  function animateChars(chars, delay = 0) {
    if (prefersReducedMotion) {
      chars.forEach((c) => c.classList.add('animated'));
      return;
    }

    chars.forEach((char, i) => {
      if (typeof gsap !== 'undefined') {
        gsap.to(char, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          delay: delay + i * 0.05,
          ease: 'power3.out',
        });
      } else {
        setTimeout(() => {
          char.classList.add('animated');
        }, (delay + i * 0.05) * 1000);
      }
    });
  }

  function initSplitTextAnimations() {
    const headings = document.querySelectorAll('[data-split]');

    headings.forEach((el) => {
      const chars = splitText(el);

      if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.set(chars, { opacity: 0, y: 20 });

        ScrollTrigger.create({
          trigger: el,
          start: 'top 85%',
          once: true,
          onEnter: () => {
            const delay = parseFloat(el.dataset.delay || '0');
            animateChars(chars, delay);
          },
        });
      } else {
        /* Fallback: IntersectionObserver */
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                animateChars(chars, 0);
                observer.unobserve(entry.target);
              }
            });
          },
          { threshold: 0.2 }
        );
        observer.observe(el);
      }
    });
  }

  /* ================================================================
     9. HERO ENTRANCE
  ================================================================ */
  function initHeroEntrance() {
    if (prefersReducedMotion || typeof gsap === 'undefined') return;

    const hero = document.querySelector('.hero-content');
    if (!hero) return;

    const eyebrow = hero.querySelector('.hero-eyebrow');
    const sub = hero.querySelector('.hero-sub');
    const actions = hero.querySelector('.hero-actions');
    const hint = document.querySelector('.hero-scroll-hint');

    const tl = gsap.timeline({ delay: 1.5 });

    if (eyebrow) {
      tl.from(eyebrow, { opacity: 0, y: 20, duration: 0.8, ease: 'power3.out' });
    }
    if (sub) {
      tl.from(sub, { opacity: 0, y: 20, duration: 0.8, ease: 'power3.out' }, '-=0.4');
    }
    if (actions) {
      tl.from(actions.children, { opacity: 0, y: 20, stagger: 0.1, duration: 0.7, ease: 'power3.out' }, '-=0.4');
    }
    if (hint) {
      tl.from(hint, { opacity: 0, duration: 0.8 }, '-=0.2');
    }
  }

  /* ================================================================
     10. PINNED SCROLL SECTION
  ================================================================ */
  function initPinnedSection() {
    const pinned = document.querySelector('.pinned-section');
    if (!pinned || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    const slides = pinned.querySelectorAll('.pin-slide');
    const dots = pinned.querySelectorAll('.pin-progress-dot');
    const totalSlides = slides.length;
    if (!totalSlides) return;

    /* Set initial state */
    slides[0].classList.add('active');
    if (dots[0]) dots[0].classList.add('active');

    /* Pin height = totalSlides * 100vh */
    const outerEl = pinned.querySelector('.pinned-outer') || pinned;

    ScrollTrigger.create({
      trigger: pinned,
      start: 'top top',
      end: () => '+=' + (totalSlides * window.innerHeight * 1.2),
      scrub: true,
      pin: '.pinned-inner',
      anticipatePin: 1,
      onUpdate: (self) => {
        const progress = self.progress;
        const idx = Math.min(Math.floor(progress * totalSlides), totalSlides - 1);

        slides.forEach((s, i) => {
          s.classList.toggle('active', i === idx);
        });
        dots.forEach((d, i) => {
          d.classList.toggle('active', i === idx);
        });

        /* Rotate background circles with scroll */
        const circles = pinned.querySelectorAll('.pin-bg-circle');
        circles.forEach((c, i) => {
          const dir = i % 2 === 0 ? 1 : -1;
          gsap.set(c, { rotation: progress * 360 * dir });
        });
      },
    });

    /* Dot click navigation */
    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        const trigger = ScrollTrigger.getAll().find(
          (t) => t.trigger === pinned
        );
        if (trigger) {
          const targetScroll = trigger.start + (i / totalSlides) * (trigger.end - trigger.start);
          if (lenis) {
            lenis.scrollTo(targetScroll, { duration: 1.2 });
          } else {
            window.scrollTo({ top: targetScroll, behavior: 'smooth' });
          }
        }
      });
    });
  }

  /* ================================================================
     11. INTERACTIVE LIST (Accordion + Image Swap)
  ================================================================ */
  function initInteractiveList() {
    const list = document.querySelector('.interactive-list');
    const imagePanel = document.querySelector('.interactive-image-panel');
    if (!list) return;

    const items = list.querySelectorAll('.list-item');
    const images = imagePanel ? imagePanel.querySelectorAll('[data-list-image]') : [];

    const activateItem = (item) => {
      /* Deactivate all */
      items.forEach((el) => {
        el.classList.remove('active');
        el.querySelector('.list-item-header').setAttribute('aria-expanded', 'false');
      });

      /* Activate selected */
      item.classList.add('active');
      item.querySelector('.list-item-header').setAttribute('aria-expanded', 'true');

      /* Cross-fade image */
      if (imagePanel && images.length) {
        const targetId = item.dataset.image;
        images.forEach((img) => {
          img.classList.toggle('active', img.dataset.listImage === targetId);
        });
      }
    };

    items.forEach((item, index) => {
      const header = item.querySelector('.list-item-header');
      if (!header) return;

      header.setAttribute('tabindex', '0');
      header.setAttribute('role', 'button');
      header.setAttribute('aria-expanded', 'false');

      header.addEventListener('click', () => {
        if (item.classList.contains('active')) {
          item.classList.remove('active');
          header.setAttribute('aria-expanded', 'false');
        } else {
          activateItem(item);
        }
      });

      header.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          header.click();
        }
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          const next = items[index + 1];
          if (next) next.querySelector('.list-item-header').focus();
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          const prev = items[index - 1];
          if (prev) prev.querySelector('.list-item-header').focus();
        }
      });

      /* Mouse hover for desktop */
      item.addEventListener('mouseenter', () => activateItem(item));
    });

    /* Activate first item by default */
    if (items.length) activateItem(items[0]);
  }

  /* ================================================================
     12. SCROLL REVEAL ANIMATIONS
  ================================================================ */
  function initScrollReveal() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    /* Fade-up for elements with data-reveal */
    gsap.utils.toArray('[data-reveal]').forEach((el) => {
      gsap.from(el, {
        opacity: 0,
        y: parseFloat(el.dataset.revealY || '40'),
        duration: parseFloat(el.dataset.revealDuration || '0.9'),
        delay: parseFloat(el.dataset.revealDelay || '0'),
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          once: true,
        },
      });
    });

    /* Stagger grids */
    gsap.utils.toArray('[data-stagger-parent]').forEach((parent) => {
      const children = parent.querySelectorAll('[data-stagger-child]');
      if (!children.length) return;

      gsap.from(children, {
        opacity: 0,
        y: 50,
        stagger: 0.12,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: parent,
          start: 'top 80%',
          once: true,
        },
      });
    });

    /* Parallax for elements with data-parallax */
    gsap.utils.toArray('[data-parallax]').forEach((el) => {
      const speed = parseFloat(el.dataset.parallax || '0.2');
      gsap.to(el, {
        y: () => window.innerHeight * speed * -1,
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      });
    });
  }

  /* ================================================================
     13. MARQUEE — clone items for infinite loop
  ================================================================ */
  function initMarquee() {
    document.querySelectorAll('.marquee-track').forEach((track) => {
      const original = track.innerHTML;
      track.innerHTML = original + original; /* clone for seamless loop */
    });
  }

  /* ================================================================
     14. TESTIMONIALS — clone for infinite loop
  ================================================================ */
  function initTestimonials() {
    const track = document.querySelector('.testimonials-track');
    if (!track) return;
    const original = track.innerHTML;
    track.innerHTML = original + original;
  }

  /* ================================================================
     15. STATS COUNTER ANIMATION
  ================================================================ */
  function initCounters() {
    if (prefersReducedMotion) return;

    const counters = document.querySelectorAll('[data-count]');
    counters.forEach((el) => {
      const target = parseFloat(el.dataset.count);
      const suffix = el.dataset.countSuffix || '';
      const decimals = el.dataset.countDecimals ? parseInt(el.dataset.countDecimals) : 0;

      const trigger = () => {
        if (typeof gsap !== 'undefined') {
          gsap.to({ val: 0 }, {
            val: target,
            duration: 2.5,
            ease: 'power2.out',
            onUpdate: function () {
              el.textContent = this.targets()[0].val.toFixed(decimals) + suffix;
            },
          });
        }
      };

      if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.create({
          trigger: el,
          start: 'top 80%',
          once: true,
          onEnter: trigger,
        });
      } else {
        const obs = new IntersectionObserver(
          (entries) => {
            if (entries[0].isIntersecting) { trigger(); obs.disconnect(); }
          },
          { threshold: 0.5 }
        );
        obs.observe(el);
      }
    });
  }

  /* ================================================================
     16. PRODUCT THUMBNAIL SWITCHER
  ================================================================ */
  function initProductThumbs() {
    const mainImg = document.querySelector('.product-main-img');
    const thumbs = document.querySelectorAll('.product-thumb');
    if (!mainImg || !thumbs.length) return;

    thumbs.forEach((thumb) => {
      thumb.addEventListener('click', () => {
        thumbs.forEach((t) => t.classList.remove('active'));
        thumb.classList.add('active');
      });
    });

    thumbs[0] && thumbs[0].classList.add('active');
  }

  /* ================================================================
     17. PRODUCT OPTIONS
  ================================================================ */
  function initProductOptions() {
    document.querySelectorAll('.options-grid').forEach((grid) => {
      const pills = grid.querySelectorAll('.option-pill');
      pills.forEach((pill) => {
        pill.addEventListener('click', () => {
          pills.forEach((p) => p.classList.remove('active'));
          pill.classList.add('active');
        });
      });
      if (pills.length) pills[0].classList.add('active');
    });
  }

  /* ================================================================
     18. CINEMATIC PAGE TRANSITIONS
  ================================================================ */
  function initPageTransitions() {
    const overlay = document.getElementById('page-transition');
    if (!overlay || typeof gsap === 'undefined') return;

    const panel = overlay.querySelector('.pt-panel');
    const logo = overlay.querySelector('.pt-logo');
    if (!panel) return;

    /* Intercept internal links */
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href]');
      if (!link) return;

      const href = link.getAttribute('href');
      if (!href) return;

      /* Skip external, anchor, or mailto/tel links */
      if (
        href.startsWith('http') ||
        href.startsWith('#') ||
        href.startsWith('mailto') ||
        href.startsWith('tel') ||
        link.target === '_blank'
      ) return;

      /* Skip if already on this page */
      const currentFile = window.location.pathname.split('/').pop() || 'index.html';
      if (href === currentFile || href === window.location.href) return;

      e.preventDefault();

      document.body.classList.add('page-transitioning');
      overlay.style.pointerEvents = 'all';

      const tl = gsap.timeline({
        onComplete: () => {
          window.location.href = href;
        },
      });

      tl.to(panel, {
        scaleY: 1,
        transformOrigin: 'bottom',
        duration: 0.55,
        ease: 'power4.inOut',
      });

      if (logo) {
        tl.to(logo, { opacity: 1, duration: 0.3, ease: 'power2.out' }, '-=0.1');
      }
    });

    /* Page-in animation on load */
    const tl = gsap.timeline();
    tl.set(panel, { scaleY: 1, transformOrigin: 'top' });

    if (logo) tl.set(logo, { opacity: 0 });

    tl.to(panel, {
      scaleY: 0,
      duration: 0.8,
      ease: 'power4.inOut',
      delay: 0.1,
    });

    tl.set(overlay, { pointerEvents: 'none' });
    document.body.classList.remove('page-transitioning');
  }

  /* ================================================================
     19. HORIZONTAL SCROLL SECTION (optional)
  ================================================================ */
  function initHorizontalScroll() {
    const hSection = document.querySelector('.horizontal-scroll-section');
    if (!hSection || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    const track = hSection.querySelector('.horizontal-track');
    if (!track) return;

    const getScrollAmount = () => -(track.scrollWidth - window.innerWidth);

    gsap.to(track, {
      x: getScrollAmount,
      ease: 'none',
      scrollTrigger: {
        trigger: hSection,
        start: 'top top',
        end: () => '+=' + track.scrollWidth,
        pin: true,
        scrub: 1.2,
        invalidateOnRefresh: true,
      },
    });
  }

  /* ================================================================
     20. FORM — newsletter submit
  ================================================================ */
  function initForms() {
    document.querySelectorAll('.newsletter-form').forEach((form) => {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = form.querySelector('input[type="email"]');
        const btn = form.querySelector('button');
        if (!input || !btn) return;

        const original = btn.textContent;
        btn.textContent = 'Thank you!';
        btn.disabled = true;
        input.value = '';

        setTimeout(() => {
          btn.textContent = original;
          btn.disabled = false;
        }, 3500);
      });
    });

    /* Contact form */
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
      contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const btn = contactForm.querySelector('[type="submit"]');
        if (btn) {
          btn.textContent = 'Message Sent!';
          btn.disabled = true;
          setTimeout(() => {
            btn.textContent = 'Send Message';
            btn.disabled = false;
            contactForm.reset();
          }, 4000);
        }
      });
    }
  }

  /* ================================================================
     21. PARALLAX HERO BG
  ================================================================ */
  function initHeroParallax() {
    const heroBg = document.querySelector('.hero-bg');
    if (!heroBg || prefersReducedMotion) return;

    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      heroBg.style.transform = `translateY(${scrollY * 0.4}px)`;
    }, { passive: true });
  }

  /* ================================================================
     INITIALIZE ALL
  ================================================================ */
  function initAll() {
    initLenis();
    initScrollProgress();
    initNav();
    initNavSVG();
    initCursor();
    initMagneticButtons();
    initSplitTextAnimations();
    initHeroEntrance();
    initPinnedSection();
    initInteractiveList();
    initScrollReveal();
    initMarquee();
    initTestimonials();
    initCounters();
    initProductThumbs();
    initProductOptions();
    initPageTransitions();
    initHorizontalScroll();
    initForms();
    initHeroParallax();

    /* Refresh ScrollTrigger on resize */
    if (typeof ScrollTrigger !== 'undefined') {
      let resizeTimer;
      window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          ScrollTrigger.refresh();
        }, 250);
      });
    }
  }

  /* ================================================================
     BOOT
  ================================================================ */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLoader);
  } else {
    initLoader();
  }
})();
