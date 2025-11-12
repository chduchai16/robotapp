import { auth } from '@/library/services/firebase';
import TokenRefreshService from '@/library/services/token-refresh-service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
} from 'firebase/auth';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextType {
    loading: boolean;
    isAuthenticated: boolean;
    idToken: string | null;
    signup: (email: string, password: string) => Promise<void>;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [idToken, setIdToken] = useState<string | null>(null);
    const TOKEN_KEY = 'id_token';

    // Check token khi app start
    useEffect(() => {
        const initAuth = async () => {
            try {
                const token = await AsyncStorage.getItem(TOKEN_KEY);
                setIdToken(token);
                setIsAuthenticated(!!token);
            } catch (e) {
                console.error('Lỗi check token:', e);
                setIdToken(null);
                setIsAuthenticated(false);
            }
            setLoading(false);
        };
        initAuth();
    }, []);

    useEffect(() => {
        const tokenRefreshService = TokenRefreshService.getInstance();

        tokenRefreshService.setOnTokenExpired(async () => {
            setIsAuthenticated(false);
            try {
                await AsyncStorage.removeItem(TOKEN_KEY);
            } catch (e) {
                console.error('Lỗi khi xóa token:', e);
            }
        });

        tokenRefreshService.start();

        return () => {
            tokenRefreshService.stop();
        };
    }, []);


    const signup = async (email: string, password: string) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const token = await userCredential.user.getIdToken();
            await AsyncStorage.setItem(TOKEN_KEY, token);
            setIdToken(token);
            setIsAuthenticated(true);
            TokenRefreshService.getInstance().start();
        } catch (error) {
            throw error;
        }
    };

    const login = async (email: string, password: string) => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const token = await userCredential.user.getIdToken();
            await AsyncStorage.setItem(TOKEN_KEY, token);
            setIdToken(token);
            setIsAuthenticated(true);
            TokenRefreshService.getInstance().start();
        } catch (error) {
            throw error;
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            await AsyncStorage.removeItem(TOKEN_KEY);
            setIdToken(null);
            setIsAuthenticated(false);
            TokenRefreshService.getInstance().stop();
        } catch (error) {
            throw error;
        }
    };

    const value: AuthContextType = {
        loading,
        isAuthenticated,
        idToken,
        signup,
        login,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
