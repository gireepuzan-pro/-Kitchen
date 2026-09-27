const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];

const formatKRW = (value) => `₩${value.toLocaleString("ko-KR")}`;

// Mobile navigation
const menuToggle = $(".menu-toggle");
const mobileNav = $(".mobile-nav");

menuToggle.addEventListener("click", () => {
  const open = mobileNav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", open);
  document.body.classList.toggle("menu-lock", open);
});

$$(".mobile-nav a").forEach(link => {
  link.addEventListener("click", () => {
    mobileNav.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    document.body.classList.remove("menu-lock");
  });
});

// Scroll reveal
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

$$(".reveal").forEach(el => revealObserver.observe(el));

// Menu category filtering
const tabs = $$(".category-tab");
const cards = $$(".food-card");

tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    tabs.forEach(t => t.classList.remove("active"));
    tab.classList.add("active");

    const category = tab.dataset.category;
    cards.forEach(card => {
      const show = category === "all" || card.dataset.category === category;
      card.style.display = show ? "" : "none";
    });
  });
});

// Cart
let cart = [];

const cartDrawer = $(".cart-drawer");
const cartOverlay = $(".cart-overlay");
const cartItems = $(".cart-items");
const cartEmpty = $(".cart-empty");
const cartCount = $(".cart-count");
const cartTotal = $(".cart-total");
const toast = $(".toast");

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
}

function openCart() {
  cartDrawer.classList.add("open");
  cartOverlay.classList.add("open");
  document.body.classList.add("cart-lock");
}

function closeCart() {
  cartDrawer.classList.remove("open");
  cartOverlay.classList.remove("open");
  document.body.classList.remove("cart-lock");
}

$(".cart-open").addEventListener("click", openCart);
$(".cart-close").addEventListener("click", closeCart);
cartOverlay.addEventListener("click", closeCart);

function renderCart() {
  cartItems.innerHTML = "";

  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  cartCount.textContent = count;
  cartTotal.textContent = formatKRW(total);
  cartEmpty.style.display = cart.length ? "none" : "grid";
  cartItems.style.display = cart.length ? "block" : "none";

  cart.forEach((item, index) => {
    const el = document.createElement("div");
    el.className = "cart-item";
    el.innerHTML = `
      <div>
        <h4>${item.name}</h4>
        <p>${formatKRW(item.price)} each</p>
        <div class="qty">
          <button data-action="minus" data-index="${index}" aria-label="Decrease quantity">−</button>
          <span>${item.qty}</span>
          <button data-action="plus" data-index="${index}" aria-label="Increase quantity">+</button>
        </div>
      </div>
      <strong>${formatKRW(item.price * item.qty)}</strong>
    `;
    cartItems.appendChild(el);
  });
}

cartItems.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const index = Number(button.dataset.index);
  const action = button.dataset.action;

  if (action === "plus") cart[index].qty += 1;
  if (action === "minus") {
    cart[index].qty -= 1;
    if (cart[index].qty <= 0) cart.splice(index, 1);
  }

  renderCart();
});

$$(".add-to-cart").forEach(button => {
  button.addEventListener("click", () => {
    const name = button.dataset.name;
    const price = Number(button.dataset.price);
    const existing = cart.find(item => item.name === name);

    if (existing) existing.qty += 1;
    else cart.push({ name, price, qty: 1 });

    renderCart();
    showToast(`${name} added. The cockroach approves.`);
  });
});

$(".checkout-btn").addEventListener("click", () => {
  if (!cart.length) {
    showToast("Your cart is empty. Even the cockroach is disappointed.");
    return;
  }

  showToast("Order received. Just kidding — this is a fake restaurant 😂");
  cart = [];
  renderCart();
  setTimeout(closeCart, 900);
});

renderCart();

// Reviews
const reviews = $$(".review");
let reviewIndex = 0;

function setReview(index) {
  reviewIndex = (index + reviews.length) % reviews.length;
  reviews.forEach((review, i) => review.classList.toggle("active", i === reviewIndex));
}

$(".review-arrow.next").addEventListener("click", () => setReview(reviewIndex + 1));
$(".review-arrow.prev").addEventListener("click", () => setReview(reviewIndex - 1));

setInterval(() => setReview(reviewIndex + 1), 5500);

// Cockroach hero interaction
const roach = $(".roach-trigger");
roach.addEventListener("click", () => {
  roach.animate(
    [
      { transform: "translate(0,0) rotate(0)" },
      { transform: "translate(-100px,-80px) rotate(-20deg)" },
      { transform: "translate(180px,-40px) rotate(25deg)" },
      { transform: "translate(0,0) rotate(0)" }
    ],
    { duration: 1300, easing: "cubic-bezier(.22,1,.36,1)" }
  );
  showToast("YOU MISSED IT 🪳");
});

// Fake map
$("#mapBtn").addEventListener("click", () => {
  showToast("Location hidden for legal reasons. Probably Busan.");
});

// Smooth anchor links with a small offset
$$('a[href^="#"]').forEach(link => {
  link.addEventListener("click", event => {
    const id = link.getAttribute("href");
    if (!id || id === "#") return;
    const target = document.querySelector(id);
    if (!target) return;

    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});
