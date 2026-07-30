// ── Nav scroll effect ──────────────────────────────────────────────────────────
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.style.background = window.scrollY > 20
    ? 'rgba(10,10,15,0.97)'
    : 'rgba(10,10,15,0.85)';
});

// ── Mobile hamburger ──────────────────────────────────────────────────────────
const hamburger = document.getElementById('hamburger');
const navMobile = document.getElementById('navMobile');
hamburger.addEventListener('click', () => {
  navMobile.classList.toggle('open');
});
navMobile.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => navMobile.classList.remove('open'));
});

// ── Active nav link on scroll ─────────────────────────────────────────────────
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => {
        link.style.color = link.getAttribute('href') === `#${entry.target.id}`
          ? '#fff' : '';
      });
    }
  });
}, { threshold: 0.5 });
sections.forEach(s => observer.observe(s));

// ── Scroll reveal animation ───────────────────────────────────────────────────
const revealItems = document.querySelectorAll(
  '.skill-card, .project-card, .contact-card, .about-grid, .section-title'
);
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

revealItems.forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(24px)';
  el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  revealObserver.observe(el);
});

// ── Contact form (mailto fallback) ────────────────────────────────────────────
function handleSubmit(e) {
  e.preventDefault();
  const name    = document.getElementById('name').value.trim();
  const email   = document.getElementById('email').value.trim();
  const message = document.getElementById('message').value.trim();
  const note    = document.getElementById('formNote');

  const subject = encodeURIComponent(`Portfolio contact from ${name}`);
  const body    = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`);
  window.location.href = `mailto:mrsuryainfo@gmail.com?subject=${subject}&body=${body}`;

  note.textContent = '✅ Opening your email client…';
  setTimeout(() => {
    e.target.reset();
    note.textContent = '';
  }, 3000);
}
