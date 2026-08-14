/**
 * NutriNuts — Order Notification System (Local Fallback)
 * =======================================================
 *
 * Provides LOCAL browser/desktop notifications when a new order is placed.
 * This is the immediate, no-latency fallback channel. The PRIMARY remote push
 * channel is Firebase Cloud Messaging (assets/js/firebase-messaging.js).
 *
 * Architecture:
 *   - Browser Notifications API for desktop/mobile notifications
 *   - Service Worker (sw.js) handles notificationclick → focus website
 *   - When FCM is active (firebase-messaging-sw.js), the FCM SW handles
 *     notificationclick, so sw.js registration is skipped to avoid conflicts.
 *   - All failures are caught and logged — never blocks checkout
 *
 * Channels (both fire independently for redundancy):
 *   1. FCM (firebase-messaging.js) — Remote push, works when site isn't open
 *   2. This module — Local in-browser notification, zero latency
 *
 * Usage:
 *   Called automatically by placeOrder() in main.js after a successful order.
 *   Permission is requested once on first page load (if not already decided).
 */

const Notifications = (() => {
  /* ─────────── Configuration ─────────── */
  const SW_PATH = '/sw.js';
  const FCM_SW_ACTIVE = typeof FCM !== 'undefined' && FCM.isSupported; // Don't compete with FCM SW
  const PERMISSION_KEY = 'nutrinuts_notification_permission';
  let swRegistration = null;
  let permissionGranted = false;

  /* ─────────── Service Worker Registration ─────────── */
  async function registerSW() {
    // If FCM is handling push + notificationclick via firebase-messaging-sw.js,
    // skip registering sw.js to avoid duplicate SW conflicts.
    if (FCM_SW_ACTIVE) {
      console.log('[Notifications] FCM is active — skipping local SW registration.');
      return null;
    }

    if (swRegistration) return swRegistration;

    try {
      swRegistration = await navigator.serviceWorker.register(SW_PATH, {
        scope: '/',
      });
      console.log('[Notifications] Service Worker registered:', swRegistration.scope);

      // Listen for updates
      swRegistration.addEventListener('updatefound', () => {
        const newWorker = swRegistration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('[Notifications] SW update available — will activate on next load.');
            }
          });
        }
      });

      return swRegistration;
    } catch (err) {
      console.warn('[Notifications] SW registration failed:', err.message);
      return null;
    }
  }

  /* ─────────── Permission Management ─────────── */
  function checkPermission() {
    if (!('Notification' in window)) return 'unsupported';
    return Notification.permission; // 'default' | 'granted' | 'denied'
  }

  /**
   * Request notification permission.
   * Only prompts the user once — if already granted or denied, returns immediately.
   * Call this early (e.g., on checkout page load) so the prompt appears before
   * the user is mid-checkout.
   */
  async function requestPermission() {
    const perm = checkPermission();

    if (perm === 'unsupported') {
      console.log('[Notifications] Notifications API not supported.');
      return false;
    }

    if (perm === 'granted') {
      permissionGranted = true;
      return true;
    }

    if (perm === 'denied') {
      console.log('[Notifications] Permission previously denied by user.');
      return false;
    }

    // 'default' — not yet asked. Prompt once.
    try {
      const result = await Notification.requestPermission();
      permissionGranted = (result === 'granted');

      // Remember we've asked so we don't prompt every page load
      if (permissionGranted) {
        localStorage.setItem(PERMISSION_KEY, 'granted');
      } else {
        localStorage.setItem(PERMISSION_KEY, 'denied');
      }

      console.log(`[Notifications] Permission: ${result}`);
      return permissionGranted;
    } catch (err) {
      console.warn('[Notifications] Permission request failed:', err.message);
      return false;
    }
  }

  /* ─────────── Notification Display ─────────── */
  /**
   * Show an order notification.
   *
   * @param {Object} orderData — the formData object from placeOrder()
   * @param {string} orderData.orderId    — e.g. "NN-000042"
   * @param {string} orderData.customerName
   * @param {number} orderData.grandTotal
   * @param {Array}  orderData.items
   * @param {string} orderData.dateTime
   */
  async function showOrderNotification(orderData) {
    const perm = checkPermission();

    if (perm === 'unsupported') {
      console.log('[Notifications] Cannot show — Notifications API not supported.');
      return;
    }

    if (perm !== 'granted') {
      console.log('[Notifications] Cannot show — permission not granted.');
      return;
    }

    // Ensure SW is registered so notificationclick is handled
    if (!swRegistration) {
      await registerSW();
    }

    const itemCount = orderData.items?.reduce((sum, i) => sum + i.quantity, 0) || 0;
    const totalFormatted = `Rs. ${(orderData.grandTotal || 0).toLocaleString()}`;

    const title = '🔔 New Order Received';
    const options = {
      body: [
        `Customer: ${orderData.customerName || 'N/A'}`,
        `Order Total: ${totalFormatted}`,
        `Items: ${itemCount}`,
        `Time: ${orderData.dateTime || new Date().toLocaleString('en-PK', { timeZone: 'Asia/Karachi' })}`,
        `Order ID: ${orderData.orderId || 'N/A'}`,
      ].join('\n'),
      icon: '/assets/images/logo.png',
      badge: '/assets/images/logo.png',
      tag: `nutrinuts-order-${orderData.orderId}`, // Dedupe by order ID
      requireInteraction: true, // Stay until user clicks
      vibrate: [200, 100, 200, 100, 200],
      data: {
        orderId: orderData.orderId,
        timestamp: Date.now(),
      },
      // Actions not widely supported on all platforms, but include for those that do
      actions: [
        { action: 'view', title: '📋 View Order' },
        { action: 'dismiss', title: '✕ Dismiss' },
      ],
    };

    try {
      // Use Service Worker if available; fall back to regular Notification
      if (swRegistration) {
        await swRegistration.showNotification(title, options);
      } else {
        new Notification(title, options);
      }
      console.log(`[Notifications] Order notification shown: ${orderData.orderId}`);
    } catch (err) {
      console.warn('[Notifications] Failed to show notification:', err.message);
      // Fail silently — never ever block checkout
    }
  }

  /**
   * Send a notification even if permission was not pre-granted.
   * Used for the actual order moment — if we have permission now, show it.
   * This is the "instant notification" called right after order placement.
   */
  async function notifyNewOrder(orderData) {
    try {
      await showOrderNotification(orderData);
    } catch (err) {
      // Absolute last-resort catch — nothing escapes this
      console.warn('[Notifications] notifyNewOrder failed:', err.message);
    }
  }

  /* ─────────── Initialisation ─────────── */
  /**
   * Initialise the notification system.
   * Call this on DOMContentLoaded for all pages.
   * Registers SW, requests permission once.
   *
   * @param {Object} options
   * @param {boolean} options.requestNow — if true, prompt for permission immediately
   *                                       (use on checkout page). If false, defer.
   */
  async function init(options = {}) {
    if (!('Notification' in navigator) && !('serviceWorker' in navigator)) {
      console.log('[Notifications] Neither Notifications nor Service Worker supported.');
      return;
    }

    // Always register SW (needed for notificationclick)
    await registerSW();

    // If permission already granted, mark it
    if (checkPermission() === 'granted') {
      permissionGranted = true;
    }

    // Request permission now if asked (e.g., on checkout page)
    if (options.requestNow) {
      await requestPermission();
    }

    console.log('[Notifications] Initialised. Permission:', checkPermission());
  }

  /* ─────────── Public API ─────────── */
  return {
    init,
    requestPermission,
    notifyNewOrder,
    checkPermission,
    get isGranted() { return permissionGranted; },
  };
})();

// Auto-register SW on load (every page) so notificationclick always works
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    // Register SW immediately (don't prompt for notification permission yet)
    Notifications.init({ requestNow: false });
  });
}
