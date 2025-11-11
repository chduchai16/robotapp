import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCVp-n47B4Q46_2jn8iq_4jzK7zRavP_LQ",
  authDomain: "robotapp-b210c.firebaseapp.com",
  projectId: "robotapp-b210c",
  storageBucket: "robotapp-b210c.firebasestorage.app",
  messagingSenderId: "681131593353",
  appId: "1:681131593353:web:b67c875e42b6440ffc0058",
  measurementId: "G-8NDCEYL37N"
};

const app = initializeApp(firebaseConfig);
// khởi tạo xác thực firebase
const auth = getAuth(app);

export { AsyncStorage, auth };

