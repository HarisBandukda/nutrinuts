/**
 * NutriNuts — Firebase Cloud Messaging Service Worker
 * =====================================================
 *
 * This Service Worker handles Firebase Cloud Messaging background push
 * messages. It is separate from sw.js (which handles general notificationclick
 * for the Notifications API).
 *
 * Background messages arrive here when:
 *   - The site is NOT in the foreground (tab inactive/minimized)
 *   - The browser is running but the site isn't open
 *   - On mobile, when the browser is in background
 *
 * Location: Site root (/) — required by Firebase SDK.
 *           Firebase auto-detects this file as the messaging SW.
 *
 * Version: 2.0.0 (FCM integration)
 */

/* ─────────── Firebase SDK (Compat) ─────────── */
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');

/* ─────────── Firebase Configuration ─────────── */
// IMPORTANT: These must match the values in assets/js/firebase-messaging.js
// These are public keys — safe to include in the service worker.
const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyDMVwOrvljdw9PAm8o-RenUPWyYBKybHF8',
  authDomain: 'nutrinuts-8c276.firebaseapp.com',
  projectId: 'nutrinuts-8c276',
  storageBucket: 'nutrinuts-8c276.firebasestorage.app',
  messagingSenderId: '132383768463',
  appId: '1:132383768463:web:98775a41c6a068e3cd95fa',
};

/* ─────────── Initialise Firebase ─────────── */
firebase.initializeApp(FIREBASE_CONFIG);

const messaging = firebase.messaging();

/* ─────────── Background Message Handler ─────────── */
/**
 * Called when a push message arrives while the site is in the background.
 * We MUST show a notification here — the browser won't auto-display it
 * for data messages. For notification messages, the SDK auto-displays,
 * but we handle both cases explicitly for reliability.
 */
messaging.onBackgroundMessage((payload) => {
  console.log('[FCM-SW] Background message received:', payload);

  // Extract notification details from payload
  const notification = payload.notification || {};
  const data = payload.data || {};

  const title = notification.title || data.title || 'NutriNuts';
  const body = notification.body || data.body || 'New notification from NutriNuts';

  const options = {
    body: body,
    icon: notification.icon || data.icon || '/assets/images/logo.png',
    badge: '/assets/images/logo.png',
    tag: data.orderId ? `nutrinuts-order-${data.orderId}` : 'nutrinuts-general',
    requireInteraction: true, // Stay until user clicks (important for order alerts)
    vibrate: [200, 100, 200, 100, 200],
    data: {
      orderId: data.orderId || '',
      timestamp: data.timestamp || Date.now(),
      url: data.url || 'https://nutrinuts.pk',
    },
    actions: [
      { action: 'view', title: 'View Order' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
    // Android-specific: set notification channel
    ...(self.registration && {
      // No explicit channel needed for web, but keep structure for future
    }),
  };

  self.registration.showNotification(title, options);
});

/* ─────────── Notification Click Handler ─────────── */
/**
 * When the user clicks a notification, focus or open the NutriNuts website.
 * If an orderId is present, navigate to the admin page for that order.
 */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const data = event.notification.data || {};
  const orderId = data.orderId || '';
  const baseUrl = 'https://nutrinuts.pk';

  let targetUrl = baseUrl;
  if (orderId) {
    // Future: admin dashboard with order detail view
    // For now, go to admin registration page as a placeholder
    targetUrl = `${baseUrl}/pages/admin-register.html`;
  }

  // Handle action buttons
  if (event.action === 'dismiss') {
    // Just close — already done above
    return;
  }
  // 'view' action or default click → open website
  event.waitUntil(
    (async () => {
      // Try to focus an existing window first
      const windowClients = await self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true,
      });

      for (const client of windowClients) {
        if (
          client.url.includes('nutrinuts.pk') ||
          client.url.includes('localhost') ||
          client.url.includes('127.0.0.1')
        ) {
          await client.focus();
          await client.navigate(targetUrl);
          return;
        }
      }

      // Open a new window
      if (self.clients.openWindow) {
        await self.clients.openWindow(targetUrl);
      }
    })()
  );
});

/* ─────────── Push Event (Fallback) ─────────── */
/**
 * Generic push event handler as a fallback if onBackgroundMessage
 * doesn't catch it (e.g., malformed Firebase payload).
 */
self.addEventListener('push', (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    // Plain text push
    event.waitUntil(
      self.registration.showNotification('NutriNuts', {
        body: event.data.text(),
        icon: '/assets/images/logo.png',
        requireInteraction: true,
      })
    );
    return;
  }

  // If it's a Firebase-style notification payload, show it
  if (payload.notification) {
    event.waitUntil(
      self.registration.showNotification(
        payload.notification.title || 'NutriNuts',
        {
          body: payload.notification.body || '',
          icon: '/assets/images/logo.png',
          badge: '/assets/images/logo.png',
          requireInteraction: true,
          vibrate: [200, 100, 200],
          data: payload.data || {},
        }
      )
    );
  }
});

/* ─────────── Install & Activate ─────────── */
self.addEventListener('install', () => {
  console.log('[FCM-SW] Installing FCM Service Worker…');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[FCM-SW] FCM Service Worker activated.');
  event.waitUntil(self.clients.claim());
});

console.log('[FCM-SW] FCM Service Worker loaded and ready.');
