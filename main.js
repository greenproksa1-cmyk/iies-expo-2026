import './style.css';

// 1. PRELOADER LOGIC
window.addEventListener('load', () => {
  const preloader = document.getElementById('preloader');
  if (preloader) {
    setTimeout(() => {
      preloader.style.opacity = '0';
      setTimeout(() => {
        preloader.style.display = 'none';
      }, 600);
    }, 1200); // Allow loading animation to run beautifully
  }
});

// Safety timeout for preloader
setTimeout(() => {
  const preloader = document.getElementById('preloader');
  if (preloader && preloader.style.display !== 'none') {
    preloader.style.opacity = '0';
    setTimeout(() => {
      preloader.style.display = 'none';
    }, 600);
  }
}, 3500);


// 2. LANGUAGE SWITCHER LOGIC
const langToggle = document.getElementById('lang-toggle');
const htmlEl = document.documentElement;
const bodyEl = document.body;

function getSavedLanguage() {
  return localStorage.getItem('ils-lang') || localStorage.getItem('iies-lang') || 'ar';
}

function setLanguage(lang) {
  if (lang === 'en') {
    htmlEl.setAttribute('lang', 'en');
    htmlEl.setAttribute('dir', 'ltr');
    htmlEl.className = 'en-mode';
    bodyEl.className = 'lang-en';
    localStorage.setItem('ils-lang', 'en');
  } else {
    htmlEl.setAttribute('lang', 'ar');
    htmlEl.setAttribute('dir', 'rtl');
    htmlEl.className = 'ar-mode';
    bodyEl.className = 'lang-ar';
    localStorage.setItem('ils-lang', 'ar');
  }
}

// Check saved language or default to Arabic
const savedLang = getSavedLanguage();
setLanguage(savedLang);

if (langToggle) {
  langToggle.addEventListener('click', () => {
    const currentLang = getSavedLanguage();
    setLanguage(currentLang === 'ar' ? 'en' : 'ar');
    // Resize canvas to adjust layout shifts
    resizeCanvas();
  });
}


// 3. CANVAS MESH PARTICLES
const canvas = document.getElementById('particle-canvas');
let ctx = null;
let particles = [];
const maxParticles = 65;
let animationFrameId = null;
const mouse = { x: null, y: null, radius: 130 };

if (canvas) {
  ctx = canvas.getContext('2d');
  
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });

  class Particle {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = (Math.random() - 0.5) * 0.4;
      this.radius = Math.random() * 2 + 1;
      this.color = Math.random() > 0.4 ? 'rgba(78, 163, 173, 0.25)' : (Math.random() > 0.5 ? 'rgba(54, 110, 118, 0.2)' : 'rgba(100, 181, 191, 0.3)'); // Reference Seafoam Teal & Petrol Tones
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      // Wrap around screen boundaries
      if (this.x < 0 || this.x > canvas.width) this.vx = -this.vx;
      if (this.y < 0 || this.y > canvas.height) this.vy = -this.vy;

      // Mouse interaction
      if (mouse.x !== null && mouse.y !== null) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          this.x -= (dx / dist) * force * 0.8;
          this.y -= (dy / dist) * force * 0.8;
        }
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
    }
  }

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initParticles();
  }

  function initParticles() {
    particles = [];
    for (let i = 0; i < maxParticles; i++) {
      particles.push(new Particle());
    }
  }

  function connectParticles() {
    const maxDist = 110;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < maxDist) {
          const alpha = (maxDist - dist) / maxDist * 0.12;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(78, 163, 173, ${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }
  }

  function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw glowing center network blur
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    
    connectParticles();
    animationFrameId = requestAnimationFrame(animateParticles);
  }

  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();
  animateParticles();
}


// 4. SCROLL INTERSECTION OBSERVER
const scrollElements = document.querySelectorAll('.scroll-anim');
const statsElements = document.querySelectorAll('.stat-number');

const elementObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('active');
      // Trigger counter animation if it's in the hero content
      if (entry.target.classList.contains('hero-content')) {
        animateStats();
      }
      elementObserver.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
});

scrollElements.forEach((el) => {
  elementObserver.observe(el);
});

// Re-observe stats elements if hero was missed or to verify scroll trigger
const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      animateStats();
      statsObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });

statsElements.forEach((el) => {
  statsObserver.observe(el);
});

function animateStats() {
  statsElements.forEach((el) => {
    if (el.classList.contains('counted')) return;
    el.classList.add('counted');
    
    const target = parseInt(el.getAttribute('data-target'), 10);
    const duration = 1800; // ms
    const startTime = performance.now();

    function updateCount(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.floor(easeProgress * target);
      
      // Formatting
      if (currentValue >= 1000) {
        el.textContent = currentValue.toLocaleString('en-US');
      } else {
        el.textContent = currentValue;
      }

      if (progress < 1) {
        requestAnimationFrame(updateCount);
      } else {
        el.textContent = target.toLocaleString('en-US');
      }
    }
    requestAnimationFrame(updateCount);
  });
}


// 5. STICKY HEADER
const header = document.querySelector('.main-header');
window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
});


// 6. MOBILE MENU
const menuBtn = document.querySelector('.mobile-menu-btn');
const mobileMenu = document.querySelector('.mobile-menu-overlay');
const mobileLinks = document.querySelectorAll('.mobile-link');

if (menuBtn && mobileMenu) {
  const toggleMenu = () => {
    menuBtn.classList.toggle('active');
    mobileMenu.classList.toggle('active');
    document.body.classList.toggle('overflow-hidden');
  };

  menuBtn.addEventListener('click', toggleMenu);
  
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      menuBtn.classList.remove('active');
      mobileMenu.classList.remove('active');
      document.body.classList.remove('overflow-hidden');
    });
  });
}


// 7. REGISTRATION MODAL
const modal = document.getElementById('register-modal');
const modalClose = document.querySelector('.modal-close-btn');
const triggers = document.querySelectorAll('.trigger-modal');
const regForm = document.getElementById('registration-form');
const regTypeSelect = document.getElementById('reg-type');
const formSuccess = document.getElementById('form-success');

if (modal && modalClose) {
  triggers.forEach((trigger) => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      modal.classList.add('active');
      
      // Pre-select type if specified
      const type = trigger.getAttribute('data-type');
      if (type && regTypeSelect) {
        regTypeSelect.value = type;
      }
    });
  });

  const closeModal = () => {
    modal.classList.remove('active');
    if (formSuccess) formSuccess.style.display = 'none';
  };

  modalClose.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });
}

if (regForm) {
  regForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Animate submit process
    if (formSuccess) {
      formSuccess.style.display = 'block';
      regForm.reset();
      
      setTimeout(() => {
        modal.classList.remove('active');
        formSuccess.style.display = 'none';
      }, 3000);
    }
  });
}


// 8. PARALLAX EFFECT FOR HERO
const heroSection = document.getElementById('hero');
const heroBg = document.querySelector('.hero-bg-img');

if (heroSection && heroBg) {
  heroSection.addEventListener('mousemove', (e) => {
    const moveX = (e.clientX - window.innerWidth / 2) * -0.015;
    const moveY = (e.clientY - window.innerHeight / 2) * -0.015;
    heroBg.style.transform = `scale(1.05) translate(${moveX}px, ${moveY}px)`;
  });
}


// 9. HORIZONTAL SLIDER CONTROLS
const sectorsContainer = document.querySelector('.sectors-scroll-container');
const prevBtn = document.getElementById('slide-prev');
const nextBtn = document.getElementById('slide-next-btn');

if (sectorsContainer && prevBtn && nextBtn) {
  const scrollAmount = 284; // Card width + gap
  
  nextBtn.addEventListener('click', () => {
    // Scroll direction based on language direction
    const isRtl = getSavedLanguage() === 'ar';
    const direction = isRtl ? -1 : 1;
    sectorsContainer.scrollBy({
      left: scrollAmount * direction,
      behavior: 'smooth'
    });
  });

  prevBtn.addEventListener('click', () => {
    const isRtl = getSavedLanguage() === 'ar';
    const direction = isRtl ? 1 : -1;
    sectorsContainer.scrollBy({
      left: scrollAmount * direction,
      behavior: 'smooth'
    });
  });
}


// 10. LIVE COUNTDOWN TIMER TO 23 NOVEMBER 2026
function initCountdown() {
  const targetDate = new Date('2026-11-23T09:00:00+03:00').getTime();
  const daysEl = document.getElementById('count-days');
  const hoursEl = document.getElementById('count-hours');
  const minsEl = document.getElementById('count-mins');
  const secsEl = document.getElementById('count-secs');

  if (!daysEl || !hoursEl || !minsEl || !secsEl) return;

  function updateTimer() {
    const now = new Date().getTime();
    const distance = targetDate - now;

    if (distance < 0) {
      daysEl.textContent = '00';
      hoursEl.textContent = '00';
      minsEl.textContent = '00';
      secsEl.textContent = '00';
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    daysEl.textContent = days.toString().padStart(2, '0');
    hoursEl.textContent = hours.toString().padStart(2, '0');
    minsEl.textContent = minutes.toString().padStart(2, '0');
    secsEl.textContent = seconds.toString().padStart(2, '0');
  }

  updateTimer();
  setInterval(updateTimer, 1000);
}

initCountdown();


// 11. JOURNEY TABS SWITCHER
const journeyTabBtns = document.querySelectorAll('.journey-tab-btn');
const journeyViews = document.querySelectorAll('.journey-view');

journeyTabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const targetViewId = btn.getAttribute('data-target');
    
    // Update active button state
    journeyTabBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // Update active view
    journeyViews.forEach(view => {
      if (view.id === targetViewId) {
        view.classList.add('active');
        // Trigger scroll animations inside view
        const animElements = view.querySelectorAll('.scroll-anim');
        animElements.forEach(el => el.classList.add('active'));
      } else {
        view.classList.remove('active');
      }
    });
  });
});
