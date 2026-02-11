// This service worker handles background notifications for Firebase Cloud Messaging.
// It uses the compat libraries for broader browser support in service workers.
importScripts("https://www.gstatic.com/firebasejs/11.9.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/11.9.1/firebase-messaging-compat.js");

// This config is duplicated from the main app for use in the service worker environment.
const firebaseConfig = {
  apiKey: "AIzaSyDYZlGVP9Zux3q3Zp_SbfA5bwJE_9KEBCI",
  authDomain: "studio-1715864548-4fd5d.firebaseapp.com",
  projectId: "studio-1715864548-4fd5d",
  storageBucket: "studio-1715864548-4fd5d.appspot.com",
  messagingSenderId: "489243011755",
  appId: "1:489243011755:web:60b8fcb390f1d23062a5ee"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload
  );
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icon-192x192.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
