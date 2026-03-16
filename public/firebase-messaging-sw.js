/* eslint-disable no-undef */
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyC_NYZcFywYn79gYX464Te7xG7K1nmfteU',
  authDomain: 'polis-api-e1ad3.firebaseapp.com',
  projectId: 'polis-api-e1ad3',
  storageBucket: 'polis-api-e1ad3.firebasestorage.app',
  messagingSenderId: '810292831760',
  appId: '1:810292831760:web:ff1fb2f3141dc5e1cf8c95'
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification?.title || 'Polisnotis';
  const notificationOptions = {
    body: payload.notification?.body || 'Ny handelse i ditt favoritomrade.'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
