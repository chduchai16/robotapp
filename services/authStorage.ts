import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'user_auth';

export const authStorage = {
    // Lưu user khi đăng nhập
    saveUser: async (userId: string) => {
        try {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ userId, loggedIn: true }));
        } catch (error) {
            console.error('Lỗi lưu user:', error);
        }
    },

    // Kiểm tra user đã đăng nhập chưa
    checkUser: async () => {
        try {
            const data = await AsyncStorage.getItem(STORAGE_KEY);
            if (data) {
                const parsed = JSON.parse(data);
                return parsed.loggedIn === true;
            }
            return false;
        } catch (error) {
            console.error('Lỗi kiểm tra user:', error);
            return false;
        }
    },

    // Xóa user khi đăng xuất
    clearUser: async () => {
        try {
            await AsyncStorage.removeItem(STORAGE_KEY);
        } catch (error) {
            console.error('Lỗi xóa user:', error);
        }
    },
};
