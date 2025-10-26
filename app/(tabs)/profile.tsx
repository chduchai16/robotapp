import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ProfileScreen() {
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
                        router.replace('/(auth)/login' as any);
                    } catch {
                        Alert.alert('Lỗi', 'Đăng xuất thất bại');
                    }
                },
            },
        ]);
    };

    return (
        <ThemedView style={styles.container}>
            <ThemedText style={styles.title}>Hồ Sơ</ThemedText>

            <View style={styles.card}>
                <ThemedText style={styles.label}>Email:</ThemedText>
                <ThemedText style={styles.email}>{user?.email}</ThemedText>
            </View>

            <View style={styles.card}>
                <ThemedText style={styles.label}>ID:</ThemedText>
                <ThemedText style={styles.info}>{user?.uid}</ThemedText>
            </View>

            <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogout}>
                <Text style={styles.logoutButtonText}>Đăng Xuất</Text>
            </TouchableOpacity>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
        paddingVertical: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 24,
    },
    card: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 16,
        marginBottom: 16,
    },
    label: {
        fontSize: 12,
        opacity: 0.6,
        marginBottom: 8,
    },
    email: {
        fontSize: 16,
        fontWeight: '500',
    },
    info: {
        fontSize: 12,
        fontFamily: 'monospace',
        opacity: 0.7,
    },
    logoutButton: {
        backgroundColor: '#FF3B30',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 'auto',
    },
    logoutButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
