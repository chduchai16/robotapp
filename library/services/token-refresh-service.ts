import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'id_token';
const REFRESH_INTERVAL = 1000 * 5; // 1 phút

type OnTokenExpiredCallback = () => void;

class TokenRefreshService {
    private refreshInterval: ReturnType<typeof setInterval> | null = null;
    private onTokenExpired: OnTokenExpiredCallback | null = null;

    setOnTokenExpired(callback: OnTokenExpiredCallback) {
        this.onTokenExpired = callback;
    }

    start() {
        // Chỉ check theo interval, không check ngay lập tức
        this.refreshInterval = setInterval(async () => {
            await this.checkToken();
        }, REFRESH_INTERVAL);
    }

    stop() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }

    private async checkToken() {
        try {
            const token = await AsyncStorage.getItem(TOKEN_KEY);

            // Nếu không có token
            if (!token) {
                if (this.onTokenExpired) {
                    this.onTokenExpired();
                }
                return;
            }

            // Nếu có token, check xem có hết hạn không
            const expiryMs = this.getTokenExpiry(token);
            const now = Date.now();
            const timeUntilExpiry = expiryMs - now;

            // Nếu token hết hạn
            if (timeUntilExpiry <= 0) {
                if (this.onTokenExpired) {
                    this.onTokenExpired();
                }
                return;
            }
        } catch (error) {
            console.error('Error checking token:', error);
        }
    }

    private getTokenExpiry(token: string): number {
        try {
            const parts = token.split('.');
            if (parts.length !== 3) {
                console.error('Token format invalid');
                return 0;
            }

            // Decode JWT payload - works on both web and native
            const payload = JSON.parse(atob(parts[1]));
            const expiryMs = payload.exp * 1000;
            return expiryMs;
        } catch (error) {
            console.error('Error decoding token:', error);
            return 0;
        }
    }

    private static instance: TokenRefreshService | null = null;

    static getInstance(): TokenRefreshService {
        if (!TokenRefreshService.instance) {
            TokenRefreshService.instance = new TokenRefreshService();
        }
        return TokenRefreshService.instance;
    }
}

export default TokenRefreshService;
