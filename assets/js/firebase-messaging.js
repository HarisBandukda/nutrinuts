/**
 * NutriNuts — Firebase Cloud Messaging (FCM) Client
 * ==================================================
 *
 * Provides push notification delivery to the admin's registered devices
 * via Firebase Cloud Messaging. This works even when the browser is idle
 * or the device is locked — unlike the Notifications API alone.
 *
 * Architecture:
 *   1. Admin visits /pages/admin-register.html → requests permission → gets FCM token
 *   2. Token is sent to Google Apps Script backend → stored in DeviceTokens sheet
 *   3. Customer places order → GAS sends FCM push to all registered tokens
 *   4. firebase-messaging-sw.js handles background messages → shows notification
 *
 * This module coexists with notifications.js. Both channels fire on order:
 *   - FCM: Remote push (works when site isn't open, phone locked, etc.)
 *   - notifications.js: Local in-browser notification (immediate, no latency)
 *
 * Security:
 *   - Public Firebase config (apiKey, messagingSenderId, etc.) — safe in frontend
 *   - Service Account private key — NEVER here, stored in GAS Script Properties
 */

const FCM = (() => {
  /* ─────────── Configuration ─────────── */
  // Public Firebase config — safe to expose in frontend code.
  // Replace with your Firebase project values after creating the project.
  const FIREBASE_CONFIG = {
    apiKey: 'AIzaSyDMVwOrvljdw9PAm8o-RenUPWyYBKybHF8',
    authDomain: 'nutrinuts-8c276.firebaseapp.com',
    projectId: 'nutrinuts-8c276',
    storageBucket: 'nutrinuts-8c276.firebasestorage.app',
    messagingSenderId: '132383768463',
    appId: '1:132383768463:web:98775a41c6a068e3cd95fa',
  };

  // FCM vapidKey (Web Push certificate) — generated from Firebase Console
  // → Project Settings → Cloud Messaging → Web configuration → Generate Key Pair
  const VAPID_KEY = 'BP3EIBtYl0DdhY7YvsqndWAowSlATTMwVADFoNPd9_YAK24HHP0adI03_mIGUpuMO7AH0EVhmI6hOMU1RW5DyJs';

  // Google Apps Script endpoint for device registration
  const GAS_REGISTER_URL = 'https://script.google.com/macros/s/AKfycbzajJGRq456pL82TGsRATSjH8-exOeuBWdqxH7HQeMC6F1zOV_5HuLZiFUSaXHIbotbzA/exec';

  /* ─────────── State ─────────── */
  let messaging = null;
  let currentToken = null;
  let swRegistration = null;
  let isSupported = false;
  let isInitialised = false;
  let tokenRefreshHandlerSet = false; // Guards against duplicate onTokenRefresh listeners

  /* ─────────── Capability Detection ─────────── */
  function checkSupport() {
    // FCM requires: browser notifications, service workers, and IndexedDB
    return (
      'Notification' in window &&
      'serviceWorker' in navigator &&
      'indexedDB' in window &&
      'firebase' in window &&
      'messaging' in (window.firebase || {})
    );
  }

  /* ─────────── Initialisation ─────────── */
  async function init() {
    if (isInitialised) return { supported: isSupported, token: currentToken };

    if (!checkSupport()) {
      console.log('[FCM] Firebase Messaging not supported in this browser.');
      isSupported = false;
      isInitialised = true;
      return { supported: false, token: null };
    }

    try {
      // Firebase compat SDK must be loaded before calling this
      if (!firebase.apps.length) {
        firebase.initializeApp(FIREBASE_CONFIG);
      }

      messaging = firebase.messaging();

      // Register the FCM service worker (firebase-messaging-sw.js).
      // The Firebase v10 SDK does NOT auto-register it — we must register it
      // ourselves and pass the registration to getToken(). Waiting on
      // navigator.serviceWorker.ready would hang forever on a page with no
      // prior service worker (e.g. the admin-register page).
      if ('serviceWorker' in navigator) {
        swRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', { scope: '/' });
        console.log('[FCM] FCM Service Worker registered:', swRegistration.scope);
      }

      isSupported = true;
      isInitialised = true;
      console.log('[FCM] Firebase Messaging initialised.');
      return { supported: true, token: currentToken };
    } catch (err) {
      console.warn('[FCM] Init failed:', err.message);
      isSupported = false;
      isInitialised = true;
      return { supported: false, token: null };
    }
  }

  /* ─────────── Permission & Token ─────────── */
  /**
   * Request notification permission and get an FCM token.
   * Call this from the admin registration page.
   *
   * @returns {Object} { granted: boolean, token: string|null, error: string|null }
   */
  async function registerDevice(deviceName) {
    if (!isInitialised) await init();

    if (!isSupported) {
      return { granted: false, token: null, error: 'FCM not supported in this browser.' };
    }

    // Step 1: Request notification permission
    let perm = Notification.permission;
    if (perm === 'default') {
      try {
        perm = await Notification.requestPermission();
      } catch (err) {
        return { granted: false, token: null, error: 'Permission request failed: ' + err.message };
      }
    }

    if (perm !== 'granted') {
      return { granted: false, token: null, error: 'Notification permission denied.' };
    }

    // Step 2: Get FCM token with VAPID key
    try {
      currentToken = await messaging.getToken({
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: swRegistration,
      });

      if (!currentToken) {
        return { granted: true, token: null, error: 'Could not get FCM token. Check VAPID key and Firebase config.' };
      }

      console.log('[FCM] Token obtained:', currentToken.substring(0, 20) + '…');
    } catch (err) {
      console.warn('[FCM] getToken failed:', err.message);
      return { granted: true, token: null, error: 'getToken failed: ' + err.message };
    }

    // Step 3: Send token to backend for storage
    try {
      await sendTokenToBackend('register-device', currentToken, deviceName);
      console.log('[FCM] Token registered with backend.');
    } catch (err) {
      console.warn('[FCM] Backend registration failed:', err.message);
      return { granted: true, token: currentToken, error: 'Token obtained but backend registration failed: ' + err.message };
    }

    // Step 4: Listen for token refresh (only once)
    if (!tokenRefreshHandlerSet) {
      tokenRefreshHandlerSet = true;
      messaging.onTokenRefresh(async () => {
        try {
          const refreshedToken = await messaging.getToken({
            vapidKey: VAPID_KEY,
            serviceWorkerRegistration: swRegistration,
          });
          currentToken = refreshedToken;
          await sendTokenToBackend('register-device', refreshedToken, deviceName);
          console.log('[FCM] Token refreshed and re-registered.');
        } catch (err) {
          console.warn('[FCM] Token refresh failed:', err.message);
        }
      });
    }

    return { granted: true, token: currentToken, error: null };
  }

  /**
   * Unregister this device from push notifications.
   */
  async function unregisterDevice() {
    if (!messaging) return { success: false, error: 'FCM not initialised.' };

    try {
      if (currentToken) {
        // Delete token from Firebase
        await messaging.deleteToken({
          vapidKey: VAPID_KEY,
          serviceWorkerRegistration: swRegistration,
        });
        // Tell backend to remove it
        await sendTokenToBackend('unregister-device', currentToken);
      }

      console.log('[FCM] Device unregistered.');
      currentToken = null;
      return { success: true, error: null };
    } catch (err) {
      console.warn('[FCM] Unregister failed:', err.message);
      return { success: false, error: err.message };
    }
  }

  /**
   * Test: trigger a notification to verify the setup.
   * Only works if the backend supports type: 'test-notification'.
   */
  async function sendTestNotification() {
    try {
      const response = await fetch(GAS_REGISTER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
        body: JSON.stringify({
          type: 'test-notification',
          token: currentToken,
          timestamp: new Date().toISOString(),
        }),
      });
      const result = await response.json();
      return { success: result.success, error: result.error || null };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  /* ─────────── Backend Communication ─────────── */
  async function sendTokenToBackend(action, token, deviceName) {
    const response = await fetch(GAS_REGISTER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
      body: JSON.stringify({
        type: action,
        token: token,
        deviceName: deviceName || getDeviceName(),
        platform: getPlatform(),
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`);
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Backend registration failed');
    }

    return result;
  }

  /* ─────────── Foreground Messages ─────────── */
  /**
   * Handle FCM messages that arrive while the site is in the foreground.
   * The service worker handles background messages; this is for in-app handling.
   */
  function onForegroundMessage(callback) {
    if (!messaging) return;
    messaging.onMessage((payload) => {
      console.log('[FCM] Foreground message received:', payload);
      if (callback) callback(payload);
    });
  }

  /* ─────────── Helpers ─────────── */
  function getDeviceName() {
    const ua = navigator.userAgent;
    // Try to give a friendly name
    if (/Android/.test(ua)) return 'Android Phone';
    if (/iPhone|iPad|iPod/.test(ua)) return 'iPhone / iPad';
    if (/Windows/.test(ua)) return 'Windows PC';
    if (/Macintosh|Mac OS X/.test(ua)) return 'Mac';
    if (/Linux/.test(ua)) return 'Linux';
    return 'Unknown Device';
  }

  function getPlatform() {
    const ua = navigator.userAgent;
    if (/Android/.test(ua)) return 'android';
    if (/iPhone|iPad|iPod/.test(ua)) return 'ios';
    if (/Windows|Macintosh|Linux/.test(ua)) return 'desktop';
    return 'unknown';
  }

  /* ─────────── Public API ─────────── */
  return {
    init,
    registerDevice,
    unregisterDevice,
    sendTestNotification,
    onForegroundMessage,
    checkSupport,
    get isSupported() { return isSupported; },
    get isInitialised() { return isInitialised; },
    get currentToken() { return currentToken; },
    get FIREBASE_CONFIG() { return FIREBASE_CONFIG; },
    get VAPID_KEY() { return VAPID_KEY; },
  };
})();
