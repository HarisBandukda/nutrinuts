const CONFIG = {
  phone: '0309-6887474',
  whatsapp: '923096887474',
  email: 'Coming Soon',
  address: 'Pakistan',
  notificationEmail: 'nutrinutspk@gmail.com',    // Admin email for order notifications
  orderNotificationsEnabled: true,              // Toggle browser + email notifications
  fcmEnabled: true                              // Toggle FCM push notifications (requires Firebase setup)
};

/**
 * Firebase Cloud Messaging — Public Configuration
 * ===============================================
 * These values are PUBLIC and safe to include in frontend code.
 * Replace with your Firebase project values after creating the project.
 *
 * To get these values:
 *   Firebase Console → Project Settings → General → Your apps → Web app → Config
 */
const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyDMVwOrvljdw9PAm8o-RenUPWyYBKybHF8',
  authDomain: 'nutrinuts-8c276.firebaseapp.com',
  projectId: 'nutrinuts-8c276',
  storageBucket: 'nutrinuts-8c276.firebasestorage.app',
  messagingSenderId: '132383768463',
  appId: '1:132383768463:web:98775a41c6a068e3cd95fa',
};

/**
 * FCM VAPID Key (Web Push Certificate)
 * =====================================
 * Generate from: Firebase Console → Project Settings → Cloud Messaging →
 * Web configuration → Generate Key Pair
 */
const FCM_VAPID_KEY = 'BP3EIBtYl0DdhY7YvsqndWAowSlATTMwVADFoNPd9_YAK24HHP0adI03_mIGUpuMO7AH0EVhmI6hOMU1RW5DyJs';

function waLink(msg) {
  return 'https://wa.me/' + CONFIG.whatsapp + '?text=' + encodeURIComponent(msg || '');
}
