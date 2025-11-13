import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'id_token';
const REFRESH_INTERVAL = 1000 * 60 ; // 5 phút

type OnTokenExpiredCallback = () => void;

class TokenRefreshService {
    private refreshInterval: ReturnType<typeof setInterval> | null = null;
    private onTokenExpired: OnTokenExpiredCallback | null = null;

    setOnTokenExpired(callback: OnTokenExpiredCallback) {
        this.onTokenExpired = callback;
    }

    start() {
        // Check ngay lập tức khi start
        this.checkToken();

        // Rồi check theo interval
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
                console.warn('❌ Không tìm thấy token trong AsyncStorage');
                if (this.onTokenExpired) {
                    this.onTokenExpired();
                }
                return;
            }

            // Nếu có token, check xem có hết hạn không
            const expiryMs = this.getTokenExpiry(token);
            const now = Date.now();
            const timeUntilExpiry = expiryMs - now;
            const remainingSeconds = Math.round(timeUntilExpiry / 1000);
            const remainingMinutes = Math.round(timeUntilExpiry / 1000 / 60);
            const remainingHours = Math.round(timeUntilExpiry / 1000 / 60 / 60);

            

            console.log('========================================');
            console.log('🔍 [Token Check]');
            console.log('Timestamp:', new Date().toLocaleString());
            console.log('Token status:', 'Hợp lệ ✅');

            if (remainingHours > 0) {
                console.log(`⏱️ Hết hạn trong: ${remainingHours}h ${remainingMinutes % 60}m`);
            } else if (remainingMinutes > 0) {
                console.log(`⏱️ Hết hạn trong: ${remainingMinutes} phút`);
            } else {
                console.log(`⏱️ Hết hạn trong: ${remainingSeconds} giây`);
            }

            console.log('Expires at:', new Date(expiryMs).toLocaleString());
            console.log('========================================');

            // Nếu token hết hạn
            if (timeUntilExpiry <= 0) {
                console.warn('❌ Token hết hạn, gọi callback logout');
                if (this.onTokenExpired) {
                    this.onTokenExpired();
                }
                return;
            }
        } catch (error) {
            console.error('❌ Lỗi check token:', error);
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
