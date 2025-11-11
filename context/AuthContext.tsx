import { auth } from '@/library/services/firebase';
import TokenRefreshService from '@/library/services/token-refresh-service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
    User,
} from 'firebase/auth';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    idToken: string | null;
    getIdToken: (forceRefresh?: boolean) => Promise<string | null>;
    signup: (email: string, password: string) => Promise<void>;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [idToken, setIdToken] = useState<string | null>(null);
    const TOKEN_KEY = 'id_token';

    useEffect(() => {
        // Kiểm tra user đã login và lấy idToken
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                try {
                    const token = await currentUser.getIdToken();
                    setIdToken(token);
                    await AsyncStorage.setItem(TOKEN_KEY, token);
                } catch (e) {
                    console.error('Lỗi lấy idToken:', e);
                    setIdToken(null);
                }
            } else {
                setIdToken(null);
                try {
                    await AsyncStorage.removeItem(TOKEN_KEY);
                } catch (e) {
                    console.error('Lỗi xóa token storage:', e);
                }
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    // useEffect riêng để khởi động TokenRefreshService tự động
    useEffect(() => {
        const tokenRefreshService = TokenRefreshService.getInstance();

        // Callback khi token hết hạn - chỉ set idToken = null, không gọi logout
        tokenRefreshService.setOnTokenExpired(() => {
            console.log('Token hết hạn, redirect đến login');
            setIdToken(null);
        });

        tokenRefreshService.start();
        // Cleanup khi component unmount
        return () => {
            tokenRefreshService.stop();
        };
    }, []);

    const signup = async (email: string, password: string) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            try {
                const token = await userCredential.user.getIdToken();
                setIdToken(token);
                await AsyncStorage.setItem(TOKEN_KEY, token);

                // Khởi động service
                const tokenRefreshService = TokenRefreshService.getInstance();
                tokenRefreshService.start();
            } catch (e) {
                console.error('Lỗi lấy idToken sau signup:', e);
            }
        } catch (error) {
            throw error;
        }
    };

    const login = async (email: string, password: string) => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            try {
                const token = await userCredential.user.getIdToken();
                setIdToken(token);
                await AsyncStorage.setItem(TOKEN_KEY, token);

                // Khởi động service
                const tokenRefreshService = TokenRefreshService.getInstance();
                tokenRefreshService.start();
            } catch (e) {
                console.error('Lỗi lấy idToken sau login:', e);
            }
        } catch (error) {
            throw error;
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            setIdToken(null);
            try {
                await AsyncStorage.removeItem(TOKEN_KEY);
                // Dừng TokenRefreshService khi logout
                const tokenRefreshService = TokenRefreshService.getInstance();
                tokenRefreshService.stop();
            } catch (e) {
                console.error('Lỗi xóa token storage khi logout:', e);
            }
        } catch (error) {
            throw error;
        }
    };

    const fetchIdToken = async (forceRefresh = false) => {
        try {
            const current = auth.currentUser;
            if (!current) return null;
            const token = await current.getIdToken(forceRefresh);
            setIdToken(token);
            try {
                await AsyncStorage.setItem(TOKEN_KEY, token);
            } catch (e) {
                console.error('Lỗi lưu token sau fetch:', e);
            }
            return token;
        } catch (e) {
            console.error('Lỗi fetchIdToken:', e);
            return null;
        }
    };

    const value = {
        user,
        loading,
        idToken,
        getIdToken: fetchIdToken,
        signup,
        login,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
