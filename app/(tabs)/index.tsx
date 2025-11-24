import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/context/AuthContext';
import { useRobot } from '@/context/RobotContext';
import { RobotService } from '@/library/services/robot-service';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function RobotsScreen() {
  const { idToken } = useAuth();
  const robotService = useMemo(() => new RobotService(), []);
  const { connectedRobotId, setConnectedRobotId, disconnectRobot, wsService } = useRobot();
  const [robots, setRobots] = useState<Record<string, string>>({});
  const [connectingRobotId, setConnectingRobotId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Load robots 1 lần khi component mount
  useEffect(() => {
    const loadRobots = async () => {
      try {
        if (!idToken) {
          return;
        }

        const response = await robotService.getRobots();
        const robotsData = response.robots;
        setRobots(robotsData);
      } catch (error) {
        console.error('Lỗi fetch robots:', error);
      }
    };

    loadRobots();
  }, [idToken, robotService]);

  // Hàm xử lý pull-to-refresh - gọi API
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // If a robot is currently connected, disconnect before reloading list
      if (connectedRobotId && wsService && wsService.isConnected && wsService.isConnected()) {
        disconnectRobot();
      }

      if (!idToken) {
        setRefreshing(false);
        return;
      }

      const response = await robotService.getRobots();
      const robotsData = response.robots;
      setRobots(robotsData);
      console.log('✅ Reload danh sách robot thành công');
    } catch (error) {
      console.error('❌ Lỗi reload robots:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách robot');
    } finally {
      setRefreshing(false);
    }
  }, [idToken, robotService, connectedRobotId, disconnectRobot, wsService]);

  const robotEntries = Object.entries(robots);

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Danh sách Robot</ThemedText>
        <ThemedText style={styles.subtitle}>({robotEntries.length} robot)</ThemedText>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {robotEntries.length === 0 ? (
          <ThemedText style={styles.noRobots}>Không có robot nào</ThemedText>
        ) : (
          robotEntries.map(([robotId, status]) => {
            const isAvailable = status.toLowerCase() === 'available';
            const isConnected = connectedRobotId === robotId;
            const displayName = robotId.replace('_', ' ').toUpperCase();

            const handleConnectPress = async () => {
              if (isConnected) {
                disconnectRobot();
                setConnectingRobotId(null);
              } else {
                try {
                  setConnectingRobotId(robotId);
                  const wsUrl = `wss://robot.skteam.studio/api/ws/client/${robotId}?token=${idToken}`;
                  await wsService.connect(wsUrl, robotId);
                  setConnectedRobotId(robotId);
                  setConnectingRobotId(null);
                } catch (error: any) {
                  setConnectingRobotId(null);
                  const errorMsg = error?.message || 'Lỗi không xác định';
                  Alert.alert('Lỗi kết nối', `Không thể kết nối: ${errorMsg}`);
                }
              }
            };

            return (
              <TouchableOpacity
                key={robotId}
                style={[
                  styles.robotCard,
                  isConnected && styles.robotCardConnected
                ]}
              >
                <View style={styles.robotHeader}>
                  <ThemedText style={styles.robotName}>{displayName}</ThemedText>
                  <View
                    style={[
                      styles.statusBadge,
                      isAvailable ? styles.statusOnline : styles.statusOffline,
                    ]}
                  >
                    <ThemedText style={styles.statusText}>
                      {isAvailable ? 'Sẵn sàng' : 'Không sẵn sàng'}
                    </ThemedText>
                  </View>
                </View>
                <ThemedText style={styles.robotId}>ID: {robotId}</ThemedText>
                <TouchableOpacity
                  style={[
                    styles.connectButton,
                    !isAvailable && styles.connectButtonDisabled,
                    isConnected && styles.connectButtonActive,
                    connectingRobotId === robotId && styles.connectButtonLoading
                  ]}
                  disabled={!isAvailable || connectingRobotId === robotId}
                  onPress={handleConnectPress}
                >
                  {connectingRobotId === robotId ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="small" color="#fff" />
                      <Text style={[styles.connectButtonText, styles.loadingText]}>
                        Đang kết nối...
                      </Text>
                    </View>
                  ) : (
                    <Text style={styles.connectButtonText}>
                      {!isAvailable
                        ? 'Không khả dụng'
                        : isConnected
                          ? 'Ngắt kết nối'
                          : 'Kết nối'}
                    </Text>
                  )}
                </TouchableOpacity>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 12,
    opacity: 0.6,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  noRobots: {
    fontSize: 16,
    opacity: 0.6,
    textAlign: 'center',
    marginTop: 32,
  },
  robotCard: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#f9f9f9',
  },
  robotCardConnected: {
    backgroundColor: '#e8e8e8',
    borderColor: '#999',
    opacity: 0.7,
  },
  robotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  robotName: {
    fontSize: 18,
    fontWeight: '600',
  },
  robotId: {
    fontSize: 13,
    opacity: 0.6,
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusOnline: {
    backgroundColor: '#34C759',
  },
  statusOffline: {
    backgroundColor: '#FF3B30',
  },
  statusText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  robotIp: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 12,
  },
  connectButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  connectButtonDisabled: {
    backgroundColor: '#CCCCCC',
    opacity: 0.6,
  },
  connectButtonActive: {
    backgroundColor: '#888888',
  },
  connectButtonLoading: {
    backgroundColor: '#FF9500',
    opacity: 0.7,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loadingText: {
    marginLeft: 8,
  },
  connectButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  userInfo: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  label: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 6,
  },
  value: {
    fontSize: 14,
    fontFamily: 'monospace',
    opacity: 0.7,
  },
});

