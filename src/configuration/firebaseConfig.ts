// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "@firebase/firestore";
import Stripe from 'stripe';

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: "spetsnaz-b1b60.firebaseapp.com",
  projectId: "spetsnaz-b1b60",
  storageBucket: "spetsnaz-b1b60.appspot.com",
  messagingSenderId: "100751807955",
  appId: "1:100751807955:web:345d46c08c86f73da5cb26",
  measurementId: "G-LPF6573CW4"
};


/**
 * Load the configuration for firebase
 */
export const loadConfiguration = () => {
    
    const app = initializeApp(firebaseConfig);

    return {
        app,
        firestore: getFirestore(app)
    }
} 


export const loadStripe = () => {
  return new Stripe(process.env.STRIPE_SECRET_KEY as string, {apiVersion: '2023-08-16'});
}