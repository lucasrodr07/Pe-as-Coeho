/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCvOc1lma8aCUoBpnpcvaxzkQYNJoCmddQ",
  authDomain: "painel-pecas-coelho.firebaseapp.com",
  projectId: "painel-pecas-coelho",
  storageBucket: "painel-pecas-coelho.firebasestorage.app",
  messagingSenderId: "763832298298",
  appId: "1:763832298298:web:3adfc65dddef52c927fe03"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
