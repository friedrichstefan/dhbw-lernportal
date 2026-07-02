import { initializeApp } from 'firebase/app'
import { getAuth, browserLocalPersistence, setPersistence } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyDJkhA05noZCoeavSND79wDO6ERk-FVYHg",
  authDomain: "dhbw-2semester.firebaseapp.com",
  projectId: "dhbw-2semester",
  storageBucket: "dhbw-2semester.firebasestorage.app",
  messagingSenderId: "345438968240",
  appId: "1:345438968240:web:4da2eb821c54bb3a9a9e75"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)

setPersistence(auth, browserLocalPersistence)
