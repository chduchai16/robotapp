import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/context/AuthContext';
import { StyleSheet, View } from 'react-native';

export default function HomeScreen() {
  const { user } = useAuth();

  return (
    <ThemedView style={styles.container}>
      <View style={styles.infoBox}>
        <ThemedText style={styles.infoTitle}>Chào mừng đến ứng dụng</ThemedText>
        <ThemedText style={styles.infoText}>
          Bạn đã đăng nhập thành công. Hãy khám phá ứng dụng và tận hưởng các tính năng của nó.
        </ThemedText>
      </View>

      <View style={styles.userInfo}>
        <ThemedText style={styles.label}>ID người dùng:</ThemedText>
        <ThemedText style={styles.value}>{user?.uid}</ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 30,
    justifyContent: 'center',
  },
  name: {
    fontSize: 18,
    opacity: 0.7,
  },
  infoBox: {
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 40,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
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
