/**
 * NutriNuts Service Worker (Local Notifications)
 * ===============================================
 *
 * Handles notificationclick for the LOCAL Notifications API channel.
 * When FCM is active, firebase-messaging-sw.js becomes the primary
 * Service Worker for push + notificationclick events.
 *
 * This SW remains as a fallback for browsers that don't support FCM
 * or for local-only notification scenarios.
 *
 * Scope: root (/) — covers the entire site
 * Version: 2.0.0 (FCM coexistence)
 */

const SW_VERSION = '1.0.0';
const SITE_URL = 'https://nutrinuts.pk';

/* ─────────── Install ─────────── */
self.addEventListener('install', (event) => {
  console.log(`[SW] NutriNuts SW v${SW_VERSION} installing…`);
  self.skipWaiting();
});

/* ─────────── Activate ─────────── */
self.addEventListener('activate', (event) => {
  console.log(`[SW] NutriNuts SW v${SW_VERSION} activated`);
  event.waitUntil(self.clients.claim());
});

/* ─────────── Notification Click ─────────── */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  // Extract optional order ID from notification data
  const orderId = event.notification.data?.orderId || '';
  const targetUrl = orderId ? `${SITE_URL}/pages/admin.html?order=${orderId}` : SITE_URL;

  event.waitUntil(
    (async () => {
      // Try to focus an existing window first
      const windowClients = await self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true,
      });

      for (const client of windowClients) {
        // Prefer a NutriNuts window
        if (client.url.includes('nutrinuts.pk') || client.url.includes('localhost') || client.url.includes('127.0.0.1')) {
          await client.focus();
          await client.navigate(targetUrl);
          return;
        }
      }

      // No existing NutriNuts window — open a new one
      if (self.clients.openWindow) {
        await self.clients.openWindow(targetUrl);
      }
    })()
  );
});

/* ─────────── Push (Future Infrastructure) ─────────── */
self.addEventListener('push', (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = {
      title: 'NutriNuts',
      body: event.data.text(),
    };
  }

  const options = {
    body: payload.body || '',
    icon: payload.icon || '/assets/images/logo.png',
    badge: payload.badge || '/assets/images/logo.png',
    data: payload.data || {},
    requireInteraction: true,
    vibrate: [200, 100, 200],
    tag: payload.tag || 'nutrinuts-order',
  };

  event.waitUntil(
    self.registration.showNotification(
      payload.title || 'NutriNuts',
      options
    )
  );
});
