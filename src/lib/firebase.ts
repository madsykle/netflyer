import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
	initializeFirestore,
	persistentLocalCache,
	persistentMultipleTabManager,
	getFirestore,
} from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";
import { env } from "./env";

const firebaseConfig = {
	apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
	authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
	projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
	storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
	messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
	appId: env.NEXT_PUBLIC_FIREBASE_APP_ID,
	measurementId: env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);

// Initialize Firestore with persistence (v10+ pattern) on client, or standard on server
const db =
	getApps().length > 0
		? getFirestore(app)
		: typeof window !== "undefined"
			? initializeFirestore(app, {
					localCache: persistentLocalCache({
						tabManager: persistentMultipleTabManager(),
					}),
				})
			: getFirestore(app);

// Analytics is client-side only
const analytics =
	typeof window !== "undefined"
		? isSupported().then((yes) => (yes ? getAnalytics(app) : null))
		: null;

export { app, auth, db, analytics };
