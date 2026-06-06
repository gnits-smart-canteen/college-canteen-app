import { auth } from "./firebase-config.js";
import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  db
}
from "./firebase-config.js";

// ── Utility ──────────────────────────────────────────────────────────────────
function toast(msg) {
  let t = document.getElementById('toast');
  if (!t) { t = document.createElement('div'); t.id = 'toast'; t.className = 'toast'; document.body.appendChild(t); }
  t.textContent = msg; t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

function genReceiptId() {
  return 'GNITS-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substr(2,4).toUpperCase();
}

function fmtDate(ts) {
  return new Date(ts).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
}
// ── Auth ───────────────────────────────────────────────────────────────
window.getUsers =
async function () {

  const roll =
    getCurrentUser();

  if (!roll)
    return {};

  const snap =
    await getDoc(
      doc(
        db,
        "erp_users",
        roll
      )
    );

  if (!snap.exists())
    return {};

  return {
    [roll]:
      snap.data()
  };

};
// ── Auth ──────────────────────────────────────────────────────────────────────
function getUsers() { return JSON.parse(localStorage.getItem('sc_users') || '{}'); }
function saveUsers(u) { localStorage.setItem('sc_users', JSON.stringify(u)); }
function setCurrentUser(roll) { localStorage.setItem('sc_current_user', roll); }
async function logout() {

  await signOut(auth);

  const base = window.location.pathname.includes('/admin/')
    ? '../index.html'
    : 'index.html';

  window.location.href = base;
}
function getCurrentUser() {
  return auth.currentUser
    ? auth.currentUser.email.split('@')[0]
    : null;
}

function requireAuth(callback) {

  onAuthStateChanged(auth, (user) => {

    if (!user) {

      const base = window.location.pathname.includes('/admin/')
        ? '../index.html'
        : 'index.html';

      window.location.href = base;
      return;
    }

    if (callback) callback(user);

  });

}
// ── Menu Helpers ─────────────────────────────────
function getAllMenuItems() {

  return (window.MENU || []).flatMap(cat => {

    // Categories WITH groups
    if (cat.groups) {

      return cat.groups.flatMap(group =>

        group.items.map(item => ({
          ...item,
          category: cat.category,
          group: group.name
        }))

      );

    }

    // Categories WITHOUT groups
    if (cat.items) {

      return cat.items.map(item => ({
        ...item,
        category: cat.category
      }));

    }

    return [];

  });

}

window.getAllMenuItems = getAllMenuItems;
// ── Cart ──────────────────────────────────────────────────────────────────────
function getCart() { return JSON.parse(localStorage.getItem('sc_cart') || '[]'); }
function saveCart(c) { localStorage.setItem('sc_cart', JSON.stringify(c)); }

function addToCart(item) {
  const cart = getCart();
  const existing = cart.find(c => c.id === item.id);
  if (existing) { existing.qty++; }
  else { cart.push({ ...item, qty: 1 }); }
  saveCart(cart);
  updateCartBadge();
  toast(`${item.item} added to cart`);
}

function updateCartQty(id, delta) {
  const cart = getCart();
  const idx = cart.findIndex(c => c.id === id);
  if (idx === -1) return;
  cart[idx].qty += delta;
  if (cart[idx].qty <= 0) cart.splice(idx, 1);
  saveCart(cart);
  updateCartBadge();
}

function cartTotal() {
  return getCart().reduce((s, c) => s + c.price * c.qty, 0);
}

function updateCartBadge() {
  const badge = document.getElementById('cart-badge');
  if (!badge) return;
  const count = getCart().reduce((s, c) => s + c.qty, 0);
  badge.textContent = count > 0 ? `🛒 Cart (${count})` : '🛒 Cart';
}

// ── Orders ────────────────────────────────────────────────────────────────────
function getOrders() { return JSON.parse(localStorage.getItem('sc_orders') || '[]'); }
function saveOrders(o) { localStorage.setItem('sc_orders', JSON.stringify(o)); }

function placeOrder(cart, total, roll, orderType = "Dine In") {
  const orders = getOrders();
  const maxWait = Math.max(...cart.map(c => c.wait));
  const order = {
  id: genReceiptId(),
  roll,
  items: cart,
  total,
  orderType,
  status: 'Placed',
  placedAt: Date.now(),
  waitMins: maxWait,
  payment: 'UPI'
  };
  orders.unshift(order);
  saveOrders(orders);
  saveCart([]);
  return order;
}

function updateOrderStatus(orderId, status) {
  const orders = getOrders();
  const o = orders.find(o => o.id === orderId);
  if (o) { o.status = status; saveOrders(orders); }
}

// ── Reviews ───────────────────────────────────────────────────────────────────
function getReviews() { return JSON.parse(localStorage.getItem('sc_reviews') || '[]'); }
function saveReviews(r) { localStorage.setItem('sc_reviews', JSON.stringify(r)); }

function addReview(roll, dishId, dishName, rating, comment) {
  const reviews = getReviews();
  reviews.unshift({ roll, dishId, dishName, rating, comment, ts: Date.now() });
  saveReviews(reviews);
}
window.addReview = addReview;
window.getReviews = getReviews;

// ── Daily Specials ────────────────────────────────────────────────────────────
window.getSpecials = async function () {

  const snap =
    await getDoc(
      doc(db, "canteen", "specials")
    );

  if(!snap.exists())
    return [];

  return snap.data().items || [];

};

window.saveSpecials = async function (items) {

  await setDoc(
    doc(db, "canteen", "specials"),
    {
      items
    }
  );
  console.log("Saved specials to Firebase:", items);
};
function getSpecials() { return JSON.parse(localStorage.getItem('sc_specials') || '[]'); }
function saveSpecials(s) { localStorage.setItem('sc_specials', JSON.stringify(s)); }

window.getCart = getCart;
window.addToCart = addToCart;
window.updateCartQty = updateCartQty;
window.cartTotal = cartTotal;
window.updateCartBadge = updateCartBadge;
window.getOrders = getOrders;
window.getReviews = getReviews;
window.toast = toast;
window.requireAuth = requireAuth;
window.getCart = getCart;
window.toast = toast;
window.logout = logout;
window.fmtDate = fmtDate;
window.placeOrder = placeOrder;
window.auth = auth;
window.getCurrentUser=getCurrentUser;
window.getUsers = getUsers;
window.saveOrders = saveOrders;
window.doc = doc;
window.getDoc = getDoc;
window.updateDoc = updateDoc;
window.updateDoc = updateDoc;