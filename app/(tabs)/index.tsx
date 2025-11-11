import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useRobot } from '@/context/RobotContext';
import { RobotService } from '@/library/services/robot-service';
import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function RobotsScreen() {
  const robotService = useMemo(() => new RobotService(), []);
  const { connectedRobotId, setConnectedRobotId, disconnectRobot } = useRobot();
  const [robots, setRobots] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchRobots = async () => {
      try {
        const response = await robotService.getRobots();
        const robotsData = response.robots; // { robot_1: "available", robot_2: "available", ... }
        setRobots(robotsData);
      } catch (error) {
        console.error('Lỗi fetch robots:', error);
      }
    }
    fetchRobots();
  }, [robotService]);

  const robotEntries = Object.entries(robots); // Convert { robot_1: "available", ... } to [["robot_1", "available"], ...]

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Danh sách Robot</ThemedText>
        <ThemedText style={styles.subtitle}>({robotEntries.length} robot)</ThemedText>
      </View>

      <ScrollView style={styles.content}>
        {robotEntries.length === 0 ? (
          <ThemedText style={styles.noRobots}>Không có robot nào</ThemedText>
        ) : (
          robotEntries.map(([robotId, status]) => {
            const isAvailable = status.toLowerCase() === 'available';
            const isConnected = connectedRobotId === robotId;
            const displayName = robotId.replace('_', ' ').toUpperCase(); // "robot_1" -> "ROBOT 1"

            const handleConnectPress = () => {
              if (isConnected) {
                disconnectRobot();
              } else {
                setConnectedRobotId(robotId);
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
                    isConnected && styles.connectButtonActive
                  ]}
                  disabled={!isAvailable}
                  onPress={handleConnectPress}
                >
                  <Text style={styles.connectButtonText}>
                    {!isAvailable
                      ? 'Không khả dụng'
                      : isConnected
                        ? 'Ngắt kết nối'
                        : 'Kết nối'}
                  </Text>
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

