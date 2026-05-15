(() => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --- Scroll progress bar ---
  const progress = document.querySelector('.scroll-progress');
  if (progress) {
    let ticking = false;
    const update = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const pct = max > 0 ? Math.min(100, (scrollTop / max) * 100) : 0;
      progress.style.width = pct + '%';
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });
    update();
  }

  // --- Scroll fade-up (independent elements; AI cards are handled separately for staggered reveal) ---
  const fadeTargets = document.querySelectorAll('.section, .decision-case, .project__sub, .dashboard-card, .metric-card');
  if (prefersReducedMotion) {
    fadeTargets.forEach((el) => el.classList.add('is-visible'));
  } else {
    const fadeObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            fadeObserver.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.05 }
    );
    fadeTargets.forEach((el) => {
      el.classList.add('fade-up');
      fadeObserver.observe(el);
    });
  }

  // --- AI grid staggered reveal ---
  const aiGrid = document.querySelector('.ai__grid');
  if (aiGrid) {
    if (prefersReducedMotion) {
      aiGrid.classList.add('is-visible');
    } else {
      const aiObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              aiObserver.unobserve(entry.target);
            }
          });
        },
        { rootMargin: '0px 0px -15% 0px', threshold: 0.1 }
      );
      aiObserver.observe(aiGrid);
    }
  }

  // --- Number countup ---
  const metricEls = document.querySelectorAll('.metric[data-target]');
  const animateNumber = (el) => {
    const target = parseFloat(el.dataset.target);
    const suffix = el.dataset.suffix || '';
    const prefix = el.dataset.prefix || '';
    const duration = 1200;
    const start = performance.now();
    const decimals = (el.dataset.target.split('.')[1] || '').length;
    const step = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const value = target * eased;
      el.textContent = `${prefix}${value.toFixed(decimals)}${suffix}`;
      if (t < 1) requestAnimationFrame(step);
      else el.textContent = `${prefix}${target}${suffix}`;
    };
    requestAnimationFrame(step);
  };
  if (prefersReducedMotion) {
    metricEls.forEach((el) => {
      el.textContent = `${el.dataset.prefix || ''}${el.dataset.target}${el.dataset.suffix || ''}`;
    });
  } else {
    const numObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateNumber(entry.target);
            numObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    metricEls.forEach((el) => {
      el.textContent = `${el.dataset.prefix || ''}0${el.dataset.suffix || ''}`;
      numObserver.observe(el);
    });
  }
})();
