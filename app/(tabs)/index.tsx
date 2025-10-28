import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { RobotService } from '@/services/robot-service';
import { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function RobotsScreen() {
  // Demo data - danh sách robot
  const robotList = [
    { id: 1, name: 'Robot 1', status: 'Đang kết nối', ip: '192.168.1.100' },
    { id: 2, name: 'Robot 2', status: 'Ngoại tuyến', ip: '192.168.1.101' },
    { id: 3, name: 'Robot 3', status: 'Ngoại tuyến', ip: '192.168.1.102' },
  ];

  const robotService = new RobotService() ;

  useEffect(() => {
    const fetchRobots = async () => {
      const robots = await robotService.getRobots();
      console.log(robots);
    }
    fetchRobots();
  } , []);

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Danh sách Robot</ThemedText>
      </View>

      <ScrollView style={styles.content}>
        {robotList.map((robot) => (
          <TouchableOpacity key={robot.id} style={styles.robotCard}>
            <View style={styles.robotHeader}>
              <ThemedText style={styles.robotName}>{robot.name}</ThemedText>
              <View
                style={[
                  styles.statusBadge,
                  robot.status === 'Đang kết nối' ? styles.statusOnline : styles.statusOffline,
                ]}
              >
                <ThemedText style={styles.statusText}>{robot.status}</ThemedText>
              </View>
            </View>
            <ThemedText style={styles.robotIp}>IP: {robot.ip}</ThemedText>
            <TouchableOpacity style={styles.connectButton}>
              <Text style={styles.connectButtonText}>Kết nối</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
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
  content: {
    flex: 1,
    padding: 16,
  },
  robotCard: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#f9f9f9',
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

