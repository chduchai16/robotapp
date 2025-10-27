import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function VoiceControlScreen() {
    const { logout } = useAuth();
    const router = useRouter();

    const handleMicrophone = () => {
        Alert.alert('Voice Control', 'Tính năng voice control đang trong giai đoạn demo');
    };

    const handleCommand = (command: string) => {
        Alert.alert('Lệnh', `Lệnh: ${command}`);
    };

    const handleLogout = async () => {
        Alert.alert(
            'Đăng xuất',
            'Bạn chắc chắn muốn đăng xuất?',
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Đăng xuất',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await logout();
                            router.replace('/(auth)/login');
                        } catch {
                            Alert.alert('Lỗi', 'Không thể đăng xuất');
                        }
                    },
                },
            ]
        );
    };

    return (
        <ThemedView style={styles.container}>
            <View style={styles.header}>
                <ThemedText style={styles.title}>Điều khiển thiết bị đang kết nối</ThemedText>
            </View>

            <View style={styles.content}>
                {/* Microphone Button */}
                <TouchableOpacity style={styles.microphoneButton} onPress={handleMicrophone}>
                    <IconSymbol size={60} name="mic.fill" color="#fff" />
                </TouchableOpacity>

                {/* Commands Grid */}
                <ThemedText style={styles.sectionTitle}>Các lệnh nhanh</ThemedText>
                <View style={styles.commandsGrid}>
                    <TouchableOpacity
                        style={styles.commandButton}
                        onPress={() => handleCommand('Tiến lên')}
                    >
                        <IconSymbol size={32} name="arrow.up.circle.fill" color="#007AFF" />
                        <ThemedText style={styles.commandText}>Tiến</ThemedText>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.commandButton}
                        onPress={() => handleCommand('Lùi lại')}
                    >
                        <IconSymbol size={32} name="arrow.down.circle.fill" color="#007AFF" />
                        <ThemedText style={styles.commandText}>Lùi</ThemedText>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.commandButton}
                        onPress={() => handleCommand('Quay trái')}
                    >
                        <IconSymbol size={32} name="arrow.left.circle.fill" color="#007AFF" />
                        <ThemedText style={styles.commandText}>Trái</ThemedText>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.commandButton}
                        onPress={() => handleCommand('Quay phải')}
                    >
                        <IconSymbol size={32} name="arrow.right.circle.fill" color="#007AFF" />
                        <ThemedText style={styles.commandText}>Phải</ThemedText>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.commandButton}
                        onPress={() => handleCommand('Dừng lại')}
                    >
                        <IconSymbol size={32} name="stop.circle.fill" color="#FF3B30" />
                        <ThemedText style={styles.commandText}>Dừng</ThemedText>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.commandButton}
                        onPress={() => handleCommand('Xoay quanh')}
                    >
                        <IconSymbol size={32} name="rotate.right.fill" color="#34C759" />
                        <ThemedText style={styles.commandText}>Xoay</ThemedText>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.logoutSection}>
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <ThemedText style={styles.logoutButtonText}>Đăng xuất</ThemedText>
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
        fontSize: 20,
        fontWeight: 'bold',
    },
    content: {
        flex: 1,
        padding: 20,
        justifyContent: 'flex-start',
    },
    microphoneButton: {
        backgroundColor: '#FF3B30',
        borderRadius: 100,
        width: 120,
        height: 120,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        marginBottom: 40,
        marginTop: 20,
    },
    microphoneText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
        marginTop: 12,
        textAlign: 'center',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
    },
    commandsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        gap: 12,
    },
    commandButton: {
        width: '30%',
        aspectRatio: 1,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f9f9f9',
        padding: 8,
    },
    commandText: {
        fontSize: 12,
        fontWeight: '500',
        marginTop: 8,
        textAlign: 'center',
    },
    logoutButton: {
        backgroundColor: '#FF3B30',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    logoutButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    logoutSection: {
        paddingHorizontal: 16,
        paddingVertical: 20,
        paddingBottom: 24,
        borderTopWidth: 1,
        borderTopColor: '#ddd',
    },
});
