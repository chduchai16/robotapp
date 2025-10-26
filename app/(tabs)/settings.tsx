import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/context/AuthContext';
import { authStorage } from '@/services/authStorage';
import { useRouter } from 'expo-router';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function SettingsScreen() {
    const { user, logout } = useAuth();
    const router = useRouter();

    const handleLogout = async () => {
        Alert.alert('Đăng xuất', 'Bạn có chắc muốn đăng xuất?', [
            { text: 'Hủy', style: 'cancel' },
            {
                text: 'Đăng xuất',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await logout();
                        // Xóa storage
                        await authStorage.clearUser();
                        router.replace('/(auth)/login');
                    } catch {
                        Alert.alert('Lỗi', 'Đăng xuất thất bại');
                    }
                },
            },
        ]);
    };

    return (
        <ThemedView style={styles.container}>
            <ScrollView>
                <View style={styles.header}>
                    <ThemedText style={styles.title}>Cài đặt</ThemedText>
                </View>

                {/* Thông tin tài khoản */}
                <View style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>Thông tin tài khoản</ThemedText>

                    <View style={styles.card}>
                        <ThemedText style={styles.label}>Email:</ThemedText>
                        <ThemedText style={styles.email}>{user?.email}</ThemedText>
                    </View>

                    <View style={styles.card}>
                        <ThemedText style={styles.label}>ID:</ThemedText>
                        <ThemedText style={styles.info}>{user?.uid}</ThemedText>
                    </View>
                </View>
            </ScrollView>

            {/* Logout - cuối cùng */}
            <View style={styles.logoutSection}>
                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={handleLogout}>
                    <Text style={styles.logoutButtonText}>Đăng Xuất</Text>
                </TouchableOpacity>
            </View>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    section: {
        paddingHorizontal: 16,
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 12,
        opacity: 0.6,
    },
    card: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
        backgroundColor: '#f9f9f9',
    },
    label: {
        fontSize: 12,
        opacity: 0.6,
        marginBottom: 6,
    },
    email: {
        fontSize: 14,
        fontWeight: '500',
    },
    info: {
        fontSize: 12,
        fontFamily: 'monospace',
        opacity: 0.7,
    },
    logoutSection: {
        paddingHorizontal: 16,
        paddingVertical: 20,
    },
    logoutButton: {
        backgroundColor: '#FF3B30',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    logoutButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
