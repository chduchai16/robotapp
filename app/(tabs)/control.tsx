import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/context/AuthContext';
import { useCommandHistory } from '@/context/CommandHistoryContext';
import { useRobot } from '@/context/RobotContext';
import { VoiceService } from '@/library/services/voice-service';
import { FontAwesome5 } from '@expo/vector-icons';
import { Audio as ExpoAudio } from 'expo-av';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

// Hàm check token có hợp lệ không
const isTokenValid = (token: string | null): boolean => {
    if (!token) return false;
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return false;
        const payload = JSON.parse(atob(parts[1]));
        const expiryMs = payload.exp * 1000;
        return expiryMs > Date.now();
    } catch {
        return false;
    }
};

export default function ControlScreen() {
    const { logout, idToken } = useAuth();
    const { connectedRobotId, wsService } = useRobot();
    const { history, addCommand } = useCommandHistory();
    const router = useRouter();
    const voiceService = VoiceService.getInstance();

    const [isRecording, setIsRecording] = useState(false);
    // liftState: 0 = "Nâng" (sends 180°), 1 = "Hạ xuống"
    const [liftState, setLiftState] = useState<number>(0);

    // Kết nối WebSocket khi robot được chọn
    useEffect(() => {
        if (!connectedRobotId || !idToken) {
            return;
        }

        const connectWebSocket = async () => {
            try {
                // Check xem đã kết nối hay chưa
                if (wsService.isConnected()) {
                    return;
                }

                const wsUrl = `wss://robot.skteam.studio/api/ws/client/robot/${connectedRobotId}?token=${idToken}`;
                await wsService.connect(wsUrl, connectedRobotId);
                console.log('WebSocket kết nối thành công:', connectedRobotId);

                // Lắng nghe message từ server
                wsService.on('message', (data: any) => {
                    console.log(data);
                    Alert.alert('Đã nhận phản hồi từ robot');
                });

                // Lắng nghe sự kiện connected
                wsService.on('connected', (data: any) => {
                    console.log('WebSocket connected:', data);
                });

                // Lắng nghe sự kiện disconnected
                wsService.on('disconnected', (data: any) => {
                    console.log('WebSocket disconnected:', data);
                });

                // Lắng nghe sự kiện error
                wsService.on('error', (error: any) => {
                    console.error('❌ WebSocket Error:', error);

                    // Check xem token có hợp lệ không
                    if (!isTokenValid(idToken)) {
                        console.warn('⚠️ Token không hợp lệ hoặc hết hạn, đang logout...');
                        Alert.alert(
                            'Phiên hết hạn',
                            'Token của bạn không còn hợp lệ. Vui lòng đăng nhập lại.',
                            [
                                {
                                    text: 'Đồng ý',
                                    onPress: async () => {
                                        try {
                                            await logout();
                                            router.replace('/(auth)/login');
                                        } catch (err) {
                                            console.error('Lỗi logout:', err);
                                        }
                                    }
                                }
                            ]
                        );
                    } else {
                        Alert.alert('Lỗi WebSocket', String(error));
                    }
                });
            } catch (error) {
                console.error('Lỗi kết nối WebSocket:', error);
                Alert.alert('Lỗi kết nối', String(error));
            }
        };

        connectWebSocket();

        return () => {
            wsService.clearListeners();
        };
    }, [connectedRobotId, idToken, wsService, logout, router]);

    const handleMicrophone = async () => {
        try {
            if (!connectedRobotId) {
                Alert.alert('Lỗi', 'Hãy kết nối robot trước khi ra lệnh');
                return;
            }

            if (!isRecording) {
                // Request microphone permission
                const { status } = await ExpoAudio.requestPermissionsAsync();
                if (status !== 'granted') {
                    Alert.alert('Lỗi', 'Cần cấp quyền sử dụng microphone');
                    return;
                }

                setIsRecording(true);
                await voiceService.startRecording();
            } else {
                setIsRecording(false);
                const text = await voiceService.stopRecording();

                if (text.trim().length > 0) {
                    // Gửi text từ microphone qua WebSocket
                    try {
                        if (!wsService.isConnected()) {
                            Alert.alert('Lỗi', 'WebSocket chưa kết nối');
                            return;
                        }
                        wsService.sendCommand(text);

                        // Thêm vào lịch sử
                        addCommand(text, connectedRobotId);
                    } catch (error) {
                        console.error("❌ Lỗi gửi lệnh voice:", error);
                        Alert.alert('❌ Lỗi', String(error));
                    }
                } else {
                    Alert.alert("Không nhận được giọng nói", "Hãy thử lại.");
                }
            }
        } catch (error) {
            Alert.alert("Lỗi", "Không thể sử dụng microphone");
            console.error("Lỗi microphone:", error);
        }
    };


    const handleCommand = (command: any) => {
        try {
            if (!connectedRobotId) {
                Alert.alert('Lỗi', 'Hãy kết nối robot trước khi ra lệnh');
                return;
            }

            if (!wsService.isConnected()) {
                Alert.alert('Lỗi', 'WebSocket chưa kết nối');
                return;
            }

            // Gửi lệnh qua WebSocket
            wsService.sendCommand(command);

            // Thêm vào lịch sử
            addCommand(command, connectedRobotId);
        } catch (error) {
            console.error("❌ Lỗi gửi lệnh quick command:", error);
            Alert.alert("❌ Lỗi gửi lệnh", String(error));
        }
    };

    // Handler for the lift button which cycles between Nâng (180°) and Hạ xuống
    const handleLiftPress = () => {
        try {
            // map current state to structured command
            if (liftState === 0) {
                handleCommand({ intent: 'nang' });
            } else {
                // send Hạ xuống (as array)
                handleCommand({ intent: 'ha' });
            }

            // advance state (cycle 0 -> 1 -> 0)
            setLiftState((s) => (s === 0 ? 1 : 0));
        } catch (error) {
            console.error('Lỗi handleLiftPress:', error);
        }
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

            <ScrollView style={styles.scrollContent}>
                <View style={styles.content}>
                    {/* Microphone Button */}
                    <TouchableOpacity style={styles.microphoneButton} onPress={handleMicrophone}>
                        <FontAwesome5
                            size={60}
                            name={isRecording ? "microphone-slash" : "microphone"}
                            color="#fff"
                        />
                    </TouchableOpacity>

                    {/* Commands Grid */}
                    <ThemedText style={styles.sectionTitle}>Các lệnh nhanh</ThemedText>
                    <View style={styles.commandsGrid}>
                        <TouchableOpacity
                            style={styles.commandButton}
                            onPress={() => handleCommand({ intent: 'tien', params: { distance: 1, unit: 'm' } })}
                        >
                            <FontAwesome5 size={32} name="arrow-up" color="#007AFF" />
                            <ThemedText style={styles.commandText}>Tiến</ThemedText>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.commandButton}
                            onPress={() => handleCommand({ intent: 'lui', params: { distance: 1, unit: 'm' } })}
                        >
                            <FontAwesome5 size={32} name="arrow-down" color="#007AFF" />
                            <ThemedText style={styles.commandText}>Lùi</ThemedText>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.commandButton}
                            onPress={() => handleCommand({ intent: 're_phai' })}
                        >
                            <FontAwesome5 size={32} name="redo" color="#34C759" />
                            <ThemedText style={styles.commandText}>Rẽ phải</ThemedText>
                        </TouchableOpacity>


                        <TouchableOpacity
                            style={styles.commandButton}
                            onPress={() => handleCommand({ intent: 're_trai' })}
                        >
                            <FontAwesome5 size={32} name="undo" color="#34C759" />
                            <ThemedText style={styles.commandText}>Rẽ trái</ThemedText>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.commandButton}
                            onPress={handleLiftPress}
                        >
                            <FontAwesome5 size={32} name={liftState === 0 ? 'arrow-up' : 'arrow-down'} color={liftState === 0 ? '#e2df1aff' : '#34C759'} />
                            <ThemedText style={styles.commandText}>{liftState === 0 ? 'Nâng' : 'Hạ xuống'}</ThemedText>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.commandButton}
                            onPress={() => handleCommand({ intent: 'dung_lai' })}
                        >
                            <FontAwesome5 size={32} name="stop" color="red" />
                            <ThemedText style={styles.commandText}>Dừng lại</ThemedText>
                        </TouchableOpacity>

                        {/* lịch sử lệnh gửi */}
                    </View>

                    {history.length > 0 && (
                        <View style={styles.historyItem}>
                            <ThemedText style={styles.historyCommand}>
                                {history[0].robotId}: {typeof history[0].text === 'string' ? history[0].text : JSON.stringify(history[0].text)}
                            </ThemedText>
                            <ThemedText style={styles.historyTime}>{history[0].timestamp}</ThemedText>
                        </View>
                    )}
                </View>
            </ScrollView>

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
        paddingTop: 50,
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
    scrollContent: {
        flex: 1,
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
    historySection: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#f5f5f5',
        marginTop: 16,
        borderRadius: 8,
        marginHorizontal: 16,
    },
    historyTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    historyList: {
        maxHeight: 150,
    },
    historyItem: {
        backgroundColor: '#fff',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 6,
        marginBottom: 6,
        borderLeftWidth: 3,
        borderLeftColor: '#007AFF',
    },
    historyCommand: {
        fontSize: 13,
        fontWeight: '500',
        marginBottom: 3,
    },
    historyTime: {
        fontSize: 11,
        opacity: 0.6,
    },
});
