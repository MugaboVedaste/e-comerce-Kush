// Initialize AOS
AOS.init({duration:700,easing:'ease-out-cubic',once:true});

// --------------------------
// Basic constants
// --------------------------
// default
const WA_NUM_2 = '250785440056';

// --------------------------
// Swiper initialization (one fully-visible slide at a time)
// --------------------------
document.querySelectorAll('.swiper').forEach((el) => {
  new Swiper(el, {
    slidesPerView: 1,
    spaceBetween: 16,
    loop: false, // non-looped for clearer next/prev UX
    centeredSlides: false,
    pagination: { el: el.querySelector('.swiper-pagination'), clickable: true },
    navigation: {
      nextEl: el.querySelector('.swiper-button-next'),
      prevEl: el.querySelector('.swiper-button-prev'),
    },
    breakpoints: {
      720: { slidesPerView: 1 },
      1000: { slidesPerView: 1 }
    }
  });
});

// --------------------------
// Handle order (WhatsApp) from the floating icon buttons
// Each order button opens a modal to pick number
// --------------------------
document.addEventListener('click', function (e) {
  const target = e.target.closest('.order-wh');
  if (target) {
    const category = target.getAttribute('data-category') || 'General';
    const model = target.getAttribute('data-model') || 'Selected item';
    const message = `Hello Kush Women's Fashion Store, I'd like to order: ${model} (Category: ${category}).\nSize: [Please specify]\nQuantity: [Please specify]\n`;

    document.getElementById('orderSummary').innerText = message;
        document.getElementById('wh-btn-2').href = `https://wa.me/${WA_NUM_2}?text=${encodeURIComponent(message)}`;

    const modal = new bootstrap.Modal(document.getElementById('orderModal'));
    modal.show();
  }
});

// --------------------------
// Contact form (mail fallback) includes phone
// --------------------------
const contactForm = document.getElementById('contactForm');
if(contactForm){
  contactForm.addEventListener('submit', function(e){
    e.preventDefault();
    const name = document.getElementById('cname').value.trim();
    const email = document.getElementById('cemail').value.trim();
    const phone = document.getElementById('cphone').value.trim();
    const msg = document.getElementById('cmessage').value.trim();

    if(!name || !email || !phone || !msg){
      alert('Please complete all fields including phone number.');
      return;
    }
    const subject = encodeURIComponent('Website message from ' + name);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\nPhone: ${phone}\n\n${msg}`);
    window.location.href = `mailto:hello@kushstore.example?subject=${subject}&body=${body}`;
  });
}

// --------------------------
// Search quick behavior: filters collection cards by text in title or model
// --------------------------
const searchInput = document.getElementById('siteSearch');
const searchBtn = document.getElementById('searchBtn');
function runSearch(){
  const q = searchInput.value.trim().toLowerCase();
  const cards = document.querySelectorAll('.collection-card');
  if(!q){
    cards.forEach(c => c.style.display = '');
    return;
  }
  cards.forEach(card => {
    const title = card.querySelector('.collection-title').innerText.toLowerCase();
    // also search models visible text
    const modelsText = Array.from(card.querySelectorAll('.swiper-slide strong')).map(s=>s.innerText.toLowerCase()).join(' ');
    const match = title.includes(q) || modelsText.includes(q);
    card.style.display = match ? '' : 'none';
  });
}
if(searchBtn && searchInput){
  searchBtn.addEventListener('click', runSearch);
  searchInput.addEventListener('keydown', (e)=>{ if(e.key==='Enter') runSearch(); });
}

// --------------------------
// Nav smooth scroll and active underline
// --------------------------
const header = document.querySelector('.site-header');
const navLinks = document.querySelectorAll('.main-nav .nav-link');
const sections = Array.from(navLinks).map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);

function onNavClick(e){
  const target = this.getAttribute('href');
  if(!target.startsWith('#')) return;
  const el = document.querySelector(target);
  if(!el) return;
  e.preventDefault();
  const headerHeight = header.offsetHeight + 12;
  const top = el.getBoundingClientRect().top + window.scrollY - headerHeight;
  window.scrollTo({ top, behavior: 'smooth' });
}
navLinks.forEach(a => a.addEventListener('click', onNavClick));

function updateActiveNav(){
  const headerHeight = header.offsetHeight + 20;
  let current = sections[0];
  for(let s of sections){
    if(window.scrollY + headerHeight >= s.offsetTop){
      current = s;
    }
  }
  navLinks.forEach(a => a.classList.toggle('active', document.querySelector(a.getAttribute('href')) === current));
}
window.addEventListener('scroll', updateActiveNav);
window.addEventListener('load', updateActiveNav);

// --------------------------
// Theme toggle (A3) save in localStorage
// --------------------------
const themeToggle = document.getElementById('themeToggle');
const savedTheme = localStorage.getItem('kush_theme') || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
function applyTheme(t){
  if(t === 'dark') document.documentElement.setAttribute('data-theme','dark');
  else document.documentElement.removeAttribute('data-theme');
  localStorage.setItem('kush_theme', t);
}
applyTheme(savedTheme);
themeToggle.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  applyTheme(current === 'dark' ? 'light' : 'dark');
});

// --------------------------
// Preloader hide
// --------------------------
window.addEventListener('load', function(){
  setTimeout(() => {
    const pre = document.getElementById('preloader');
    if(pre){
      pre.style.opacity = '0';
      pre.style.transform = 'scale(0.98)';
      setTimeout(() => pre.remove(), 450);
    }
  }, 300);
});

// --------------------------
// Likes / Dislikes logic persisted in localStorage per model
// --------------------------
function getLikesData(){
  try { return JSON.parse(localStorage.getItem('kush_likes') || '{}'); } catch(e) { return {}; }
}
function saveLikesData(data){ localStorage.setItem('kush_likes', JSON.stringify(data)); }

document.addEventListener('click', function(e){
  const likeBtn = e.target.closest('.btn-like');
  const dislikeBtn = e.target.closest('.btn-dislike');

  if(likeBtn){
    const model = likeBtn.getAttribute('data-model');
    const data = getLikesData();
    data[model] = data[model] || { likes: 0, dislikes: 0 };
    data[model].likes++;
    saveLikesData(data);
    updateLikeDisplays(model, data[model]);
  }
  if(dislikeBtn){
    const model = dislikeBtn.getAttribute('data-model');
    const data = getLikesData();
    data[model] = data[model] || { likes: 0, dislikes: 0 };
    data[model].dislikes++;
    saveLikesData(data);
    updateLikeDisplays(model, data[model]);
  }
});

function updateLikeDisplays(model, counts){
  document.querySelectorAll(`.btn-like[data-model="${model}"] .count`).forEach(el => el.innerText = counts.likes);
  document.querySelectorAll(`.btn-dislike[data-model="${model}"] .count`).forEach(el => el.innerText = counts.dislikes);
}

// initialize counts on page load
window.addEventListener('load', function(){
  const data = getLikesData();
  Object.keys(data).forEach(m => updateLikeDisplays(m, data[m]));
});

// --------------------------
// Leave review button action (small demo: scroll to reviews anchor)
document.getElementById('leaveReviewBtn')?.addEventListener('click', ()=> {
  alert('Thanks — For now this will open the category reviews page. You can implement a full review form server-side later.');
  window.location.href = '#faq';
});

// --------------------------
// Accessibility: show focus outlines on keyboard navigation
// --------------------------
document.addEventListener('keydown', function(e){ if(e.key === 'Tab') document.body.classList.add('show-focus'); });
