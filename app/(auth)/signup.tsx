import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function SignupScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { signup } = useAuth();
    const router = useRouter();

    const handleSignup = async () => {
        if (!email || !password || !confirmPassword) {
            Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Lỗi', 'Mật khẩu không trùng khớp');
            return;
        }

        if (password.length < 6) {
            Alert.alert('Lỗi', 'Mật khẩu phải ít nhất 6 ký tự');
            return;
        }

        setLoading(true);
        try {
            await signup(email, password);
            Alert.alert('Thành công', 'Đăng ký thành công!');
            router.replace('/(tabs)');
        } catch (error: any) {
            console.log('Lỗi đăng ký:', error); // Log lỗi chi tiết
            let errorMessage = 'Đăng ký thất bại';

            if (error.code === 'auth/email-already-in-use') {
                errorMessage = 'Email đã được sử dụng';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'Email không hợp lệ';
            } else if (error.code === 'auth/weak-password') {
                errorMessage = 'Mật khẩu quá yếu';
            } else {
                errorMessage = error.message || errorMessage;
            }

            Alert.alert('Lỗi', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ThemedView style={styles.container}>
            <View style={styles.content}>
                <ThemedText style={styles.title}>Đăng ký</ThemedText>
                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor="#999"
                    value={email}
                    onChangeText={setEmail}
                    editable={!loading}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />

                <TextInput
                    style={styles.input}
                    placeholder="Mật khẩu"
                    placeholderTextColor="#999"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    editable={!loading}
                    autoCapitalize="none"
                />

                <TextInput
                    style={styles.input}
                    placeholder="Xác nhận mật khẩu"
                    placeholderTextColor="#999"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                    editable={!loading}
                    autoCapitalize="none"
                />

                <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handleSignup}
                    disabled={loading}>
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>Đăng Ký</Text>
                    )}
                </TouchableOpacity>

                <View style={styles.footer}>
                    <ThemedText style={styles.footerText}>Đã có tài khoản? </ThemedText>
                    <TouchableOpacity onPress={() => router.back()} disabled={loading}>
                        <ThemedText style={styles.linkText}>Đăng nhập</ThemedText>
                    </TouchableOpacity>
                </View>
            </View>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 24,
    },
    content: {
        gap: 20,
        marginTop: 100,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: '#000',
    },
    button: {
        backgroundColor: '#34C759',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 8,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 16,
    },
    footerText: {
        fontSize: 14,
    },
    linkText: {
        fontSize: 14,
        color: '#007AFF',
        fontWeight: '600',
    },
});
