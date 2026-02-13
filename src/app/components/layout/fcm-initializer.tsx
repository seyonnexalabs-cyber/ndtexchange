'use client';

import { useEffect } from 'react';
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';
import { useFirebase } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

// IMPORTANT: Generate a VAPID key in your Firebase console under Project Settings > Cloud Messaging > Web configuration
// and paste it here.
const VAPID_KEY = "BN8n-NHW8Y9DVxa6VLAfFwFzzxV3iiNP4rWwWZpGevEAb_e0mQNHdRbFM0BNiySFmpnfIvIM0ozVdIXLnFf27m4";

export const FCMInitializer = () => {
  const { firestore, user } = useFirebase();
  const { toast } = useToast();

  useEffect(() => {
    const initializeFcm = async () => {
      if (typeof window !== 'undefined' && 'serviceWorker' in navigator && user && firestore) {
        const fcmSupported = await isSupported();
        if (!fcmSupported) {
          console.log("FCM is not supported in this browser.");
          return;
        }
        
        const messaging = getMessaging();

        if (!VAPID_KEY || VAPID_KEY === 'YOUR_FCM_VAPID_KEY_FROM_FIREBASE_CONSOLE') {
          console.warn("FCM VAPID key not set in src/app/components/layout/fcm-initializer.tsx. Push notifications will not work. Please generate a key in your Firebase console and add it.");
          return;
        }
        
        try {
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            const currentToken = await getToken(messaging, { vapidKey: VAPID_KEY });
            if (currentToken) {
              // Save the token to a subcollection for the user
              await setDoc(doc(firestore, `users/${user.uid}/fcmTokens/${currentToken}`), { 
                token: currentToken, 
                createdAt: new Date(),
                userAgent: navigator.userAgent,
              }, { merge: true });
            } else {
              console.log('No registration token available. Request permission to generate one.');
            }
          }
        } catch (err) {
          console.error('An error occurred while retrieving token. ', err);
        }
      }
    };

    initializeFcm();
  }, [user, firestore]);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
        try {
            const messaging = getMessaging();
            const unsubscribe = onMessage(messaging, (payload) => {
              console.log('Foreground message received.', payload);
              toast({
                title: payload.notification?.title,
                description: payload.notification?.body,
              });
            });
      
            return () => unsubscribe();
        } catch(e) {
            console.error('FCM onMessage error:', e);
        }
    }
  }, [toast]);

  return null;
};
