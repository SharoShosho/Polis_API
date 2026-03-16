import { getMessaging, getToken, isSupported } from 'firebase/messaging';
import { ref, set } from 'firebase/database';
import { app, realtimeDb, auth } from '../Firebase';

async function waitForActiveServiceWorker(registration) {
  if (registration.active) {
    return registration;
  }

  await new Promise((resolve, reject) => {
    const worker = registration.installing || registration.waiting;
    if (!worker) {
      reject(new Error('Kunde inte aktivera Service Worker.'));
      return;
    }

    worker.addEventListener('statechange', () => {
      if (worker.state === 'activated') {
        resolve();
      }
    });

    setTimeout(() => {
      reject(new Error('Service Worker aktiverades inte i tid. Ladda om sidan och forsok igen.'));
    }, 10000);
  });

  return registration;
}

export async function registerPushTokenForCurrentUser(vapidKey) {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('Du maste vara inloggad for att aktivera push.');
  }

  const supported = await isSupported();
  if (!supported) {
    throw new Error('Pushnotiser stodjs inte i denna webblasare.');
  }

  if (!vapidKey) {
    throw new Error('Saknar VAPID-nyckel. Satt REACT_APP_FIREBASE_VAPID_KEY i frontend.');
  }

  if (!('serviceWorker' in navigator)) {
    throw new Error('Din webblasare saknar stod for Service Worker.');
  }

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    throw new Error('Pushnotiser blockerades av webblasaren.');
  }

  const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
  await waitForActiveServiceWorker(registration);
  const readyRegistration = await navigator.serviceWorker.ready;
  const messaging = getMessaging(app);

  const token = await getToken(messaging, {
    vapidKey,
    serviceWorkerRegistration: readyRegistration
  });

  if (!token) {
    throw new Error('Kunde inte hamta push-token.');
  }

  await set(ref(realtimeDb, `notificationTokens/${currentUser.uid}/${token}`), true);
  return token;
}
