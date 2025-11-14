// Initialize AOS
console.log('Script.js loaded - Version 14 - Hamburger Menu Active');
AOS.init({duration:700,easing:'ease-out-cubic',once:true});

// Hide preloader immediately when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  const pre = document.getElementById('preloader');
  if(pre) {
    pre.style.opacity = '0';
    pre.style.transform = 'scale(0.98)';
    setTimeout(() => pre.remove(), 450);
  }
});

// --------------------------
// Search Functionality
// --------------------------
document.addEventListener('DOMContentLoaded', function() {
  const searchInput = document.getElementById('siteSearch');
  const searchBtn = document.getElementById('searchBtn');
  
  if (!searchInput || !searchBtn) return;
  
  // Handle search on button click
  searchBtn.addEventListener('click', performSearch);
  
  // Handle search on Enter key
  searchInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      performSearch();
    }
  });
  
  function performSearch() {
    const query = searchInput.value.trim().toLowerCase();
    
    if (!query) {
      alert('Please enter a search term');
      return;
    }
    
    // Get all category cards
    const categoryCards = document.querySelectorAll('.card-cat');
    
    // Get all cloth item wrappers (parent of model-card)
    const clothWrappers = document.querySelectorAll('.cloth-item-wrapper');
    
    let foundItems = [];
    let scrollTarget = null;
    
    // Search in categories
    categoryCards.forEach(card => {
      const categoryName = card.querySelector('h3, .collection-title')?.textContent?.toLowerCase();
      if (categoryName && categoryName.includes(query)) {
        foundItems.push({
          type: 'category',
          name: card.querySelector('h3, .collection-title')?.textContent,
          element: card
        });
        if (!scrollTarget) scrollTarget = card;
      }
    });
    
    // Search in cloth names
    clothWrappers.forEach(wrapper => {
      const clothName = wrapper.querySelector('strong')?.textContent?.toLowerCase();
      if (clothName && clothName.includes(query)) {
        foundItems.push({
          type: 'cloth',
          name: wrapper.querySelector('strong')?.textContent,
          element: wrapper
        });
        if (!scrollTarget) scrollTarget = wrapper;
      }
    });
    
    // Display results
    if (foundItems.length > 0) {
      // Scroll to first match
      if (scrollTarget) {
        scrollTarget.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
        
        // Highlight the found item
        scrollTarget.style.outline = '3px solid var(--accent)';
        scrollTarget.style.outlineOffset = '4px';
        
        // Remove highlight after 3 seconds
        setTimeout(() => {
          scrollTarget.style.outline = '';
          scrollTarget.style.outlineOffset = '';
        }, 3000);
      }
      
      // Show notification
      const message = foundItems.length === 1 
        ? `Found: ${foundItems[0].name}` 
        : `Found ${foundItems.length} results for "${query}"`;
      
      showNotification(message, 'success');
    } else {
      showNotification(`No results found for "${query}"`, 'warning');
    }
    
    // Clear search input
    searchInput.value = '';
  }
  
  // Notification helper function
  function showNotification(message, type = 'info') {
    // Remove existing notification if any
    const existing = document.querySelector('.search-notification');
    if (existing) existing.remove();
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `search-notification search-notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 100px;
      right: 20px;
      padding: 16px 24px;
      background: ${type === 'success' ? '#2ecc71' : type === 'warning' ? '#f39c12' : '#3498db'};
      color: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      font-weight: 600;
      animation: slideInRight 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
      notification.style.animation = 'slideOutRight 0.3s ease-out';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
  
  // Add CSS animations
  if (!document.querySelector('#search-animations')) {
    const style = document.createElement('style');
    style.id = 'search-animations';
    style.textContent = `
      @keyframes slideInRight {
        from {
          transform: translateX(400px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @keyframes slideOutRight {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(400px);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }
});

// --------------------------
// Swiper initialization
// --------------------------

// --------------------------
// Basic constants
// --------------------------
// default
const WA_NUM_2 = '250785440056';

// --------------------------
// Swiper initialization for cloth images
// --------------------------
function initializeClothSwipers() {
  document.querySelectorAll('.swiper').forEach((el) => {
    // Initialize Swiper with enhanced configuration
    new Swiper(el, {
      // Core settings
      slidesPerView: 1,
      spaceBetween: 0,
      loop: true,
      // Improved autoplay
      autoplay: {
        delay: 3000,
        disableOnInteraction: false,
        pauseOnMouseEnter: true
      },
      // Enable lazy loading
      lazy: {
        loadPrevNext: true,
        loadPrevNextAmount: 1,
        loadOnTransitionStart: true
      },
      // Smooth fade effect
      effect: 'fade',
      fadeEffect: {
        crossFade: true
      },
      // Touch interaction
      touchRatio: 1,
      touchAngle: 45,
      grabCursor: true,
      // Pagination dots
      pagination: {
        el: el.querySelector('.swiper-pagination'),
        clickable: true,
        dynamicBullets: true,
        dynamicMainBullets: 3
      },
      // Navigation arrows
      navigation: {
        nextEl: el.querySelector('.swiper-button-next'),
        prevEl: el.querySelector('.swiper-button-prev')
      },
      // Keyboard control
      keyboard: {
        enabled: true,
        onlyInViewport: true
      },
      // Performance optimizations
      observer: true,
      observeParents: true,
      watchOverflow: true,
      resizeObserver: true,
      // A11y
      a11y: {
        prevSlideMessage: 'Previous image',
        nextSlideMessage: 'Next image',
        firstSlideMessage: 'This is the first image',
        lastSlideMessage: 'This is the last image',
        paginationBulletMessage: 'Go to image {{index}}'
      }
    });
  });
}

// Initialize Swipers after DOM is loaded
document.addEventListener('DOMContentLoaded', initializeClothSwipers);

// --------------------------
// Handle order (WhatsApp) from the floating icon buttons AND order-btn
// Each order button opens a modal to pick number
// --------------------------
document.addEventListener('click', function (e) {
  const target = e.target.closest('.order-wh, .order-btn');
  if (target) {
    const category = target.getAttribute('data-item-category') || target.getAttribute('data-category') || 'General';
    const model = target.getAttribute('data-item-name') || target.getAttribute('data-model') || 'Selected item';
    const status = target.getAttribute('data-item-status') || 'available';
    const clothId = target.getAttribute('data-item-id') || '';
    
    // Build the product link
    const currentUrl = window.location.origin + window.location.pathname;
    const productLink = clothId ? `${currentUrl}#cloth-${clothId}` : currentUrl;
    
    // Very simple message format - WhatsApp Desktop compatible
    let message = `Hello Kush Women's Fashion Store, I would like to order: ${model} from category ${category}. Product link: ${productLink}`;
    
    if (status === 'sold') {
      message = `Hello Kush Women's Fashion Store, I would like to order: ${model} from category ${category}. This item shows as SOLD, please confirm availability. Product link: ${productLink}`;
    }

    console.log('Order message:', message);
    
    // Try using both api.whatsapp.com (for desktop) and wa.me (for web)
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${WA_NUM_2}&text=${encodeURIComponent(message)}`;
    console.log('WhatsApp URL:', whatsappUrl);
    
    const orderSummaryEl = document.getElementById('orderSummary');
    const whButton = document.getElementById('wh-btn-2');
    
    console.log('Order summary element:', orderSummaryEl);
    console.log('WhatsApp button element:', whButton);

    if (orderSummaryEl) {
      orderSummaryEl.innerText = message;
    }
    
    if (whButton) {
      whButton.href = whatsappUrl;
      console.log('Button href after setting:', whButton.href);
      console.log('Button href attribute:', whButton.getAttribute('href'));
    } else {
      console.error('WhatsApp button not found!');
    }

    // If not already opened by bootstrap data-bs-toggle, open it
    if (!target.hasAttribute('data-bs-toggle')) {
      const modal = new bootstrap.Modal(document.getElementById('orderModal'));
      modal.show();
    }
  }
});

// --------------------------
// Contact form (email submission)
// --------------------------
document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("contactForm");
  if (!form) {
    console.log("Contact form not found");
    return;
  }

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    
    // Disable button and show loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-2"></i>Sending...';

    // Get form data
    const formData = new FormData(form);

    try {
      const response = await fetch(form.action, {
        method: "POST",
        body: formData,
        headers: {
          "X-CSRFToken": getCookie("csrftoken"),
        },
      });

      const data = await response.json();

      if (data.success) {
        // Show success message
        alert('✅ ' + data.message);
        form.reset();
      } else {
        // Show error message
        alert('❌ ' + (data.error || 'Failed to send message. Please try again.'));
      }
    } catch (err) {
      console.error("Error sending message:", err);
      alert('❌ Network error. Please check your connection and try again.');
    } finally {
      // Re-enable button
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
    }
  });

  function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== "") {
      const cookies = document.cookie.split(";");
      for (let cookie of cookies) {
        cookie = cookie.trim();
        if (cookie.startsWith(name + "=")) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  }
});

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
const sections = Array.from(navLinks).map(a => {
  const href = a.getAttribute('href');
  // Extract hash from href (e.g., "/#home" or "/store/#home" becomes "#home")
  const hash = href.includes('#') ? '#' + href.split('#')[1] : href;
  // Only try to find element if it's a valid ID selector
  if (hash.startsWith('#') && hash.length > 1) {
    return document.querySelector(hash);
  }
  return null;
}).filter(Boolean);

function onNavClick(e){
  const href = this.getAttribute('href');
  // Extract hash from href (e.g., "/#home" or "#home" becomes "#home")
  const hash = href.includes('#') ? '#' + href.split('#')[1] : href;
  
  // Only handle if it's a valid hash link
  if(!hash.startsWith('#') || hash.length <= 1) return;
  
  const el = document.querySelector(hash);
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
  navLinks.forEach(a => {
    const href = a.getAttribute('href');
    // Extract hash from href (e.g., "/#home" or "#home" -> "#home")
    const hash = href.includes('#') ? '#' + href.split('#')[1] : href;
    // Only try querySelector if it starts with #
    if(hash.startsWith('#')){
      const target = document.querySelector(hash);
      a.classList.toggle('active', target === current);
    }
  });
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
if(themeToggle) {
  themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    applyTheme(current === 'dark' ? 'light' : 'dark');
  });
}

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
// Handle likes with AJAX
// --------------------------
// Simple like handler
document.addEventListener('click', function(e) {
    const likeBtn = e.target.closest('.like-btn');
    if (!likeBtn) return;

    // Prevent multiple clicks
    if (likeBtn.classList.contains('liking')) return;
    likeBtn.classList.add('liking');

    // Get elements
    const id = likeBtn.dataset.id;
    const countSpan = likeBtn.querySelector('.likes-count');
    const heartSpan = likeBtn.querySelector('span:first-child');
    
    console.log('Liking cloth with ID:', id);
    
    // Send like to server (no CSRF token needed since view is csrf_exempt)
    fetch(`/clothes/${id}/like/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => {
            console.log('Response status:', response.status);
            return response.json();
        })
        .then(data => {
            console.log('Response data:', data);
            if (data.likes !== undefined) {
                countSpan.textContent = data.likes;
                // Add animation effect
                heartSpan.style.transform = 'scale(1.3)';
                setTimeout(() => {
                    heartSpan.style.transform = 'scale(1)';
                }, 200);
            }
        })
        .catch(error => {
            console.error('Error liking cloth:', error);
        })
        .finally(() => {
            likeBtn.classList.remove('liking');
        });
});

// Helper function to get cookie value
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

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

// --------------------------
// Hamburger Menu Toggle
// --------------------------
document.addEventListener('DOMContentLoaded', function() {
  const hamburger = document.getElementById('hamburgerMenu');
  const mainNav = document.getElementById('mainNav');
  
  console.log('Hamburger menu init:', hamburger ? 'Found' : 'Not found');
  console.log('Main nav init:', mainNav ? 'Found' : 'Not found');
  
  if (hamburger && mainNav) {
    console.log('Hamburger menu attached!');
    
    hamburger.addEventListener('click', function(e) {
      e.stopPropagation();
      console.log('Hamburger clicked!');
      hamburger.classList.toggle('active');
      mainNav.classList.toggle('active');
      console.log('Menu active:', mainNav.classList.contains('active'));
    });
    
    // Close menu when clicking on a nav link
    const navLinks = mainNav.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', function() {
        hamburger.classList.remove('active');
        mainNav.classList.remove('active');
      });
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
      if (!hamburger.contains(e.target) && !mainNav.contains(e.target)) {
        hamburger.classList.remove('active');
        mainNav.classList.remove('active');
      }
    });
  }
});
