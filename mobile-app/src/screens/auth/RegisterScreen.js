import React, { useState, useContext } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { COLORS, SPACING, FONTS, SHADOWS } from '../../theme/theme';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useContext(AuthContext);

  const handleRegister = async () => {
    if (!name || !email || !password)
      return Alert.alert('Error', 'Please fill in all fields');
    if (!email.toLowerCase().endsWith('@gmail.com'))
      return Alert.alert('Error', 'Email must be a @gmail.com address');
    if (password.length < 8)
      return Alert.alert('Error', 'Password must be at least 8 characters');
    if (!/[A-Z]/.test(password))
      return Alert.alert('Error', 'Password must contain at least one uppercase letter');
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password))
      return Alert.alert('Error', 'Password must contain at least one symbol');
    setLoading(true);
    try {
      await register(name, email, password);
      Alert.alert('Success', 'Account created successfully. Please sign in.', [
        { text: 'OK', onPress: () => navigation.navigate('Login') }
      ]);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.emoji}>🐾</Text>
            <Text style={styles.title}>Join Pet Care</Text>
            <Text style={styles.subtitle}>Start your journey with us today</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput 
                style={styles.input} 
                placeholder="John Doe"
                placeholderTextColor={COLORS.textLight}
                value={name} 
                onChangeText={setName}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput 
                style={styles.input} 
                placeholder="name@gmail.com"
                placeholderTextColor={COLORS.textLight}
                value={email} 
                onChangeText={setEmail}
                keyboardType="email-address" 
                autoCapitalize="none" 
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <TextInput 
                style={styles.input} 
                placeholder="Min 8 chars, 1 uppercase, 1 symbol"
                placeholderTextColor={COLORS.textLight}
                value={password} 
                onChangeText={setPassword} 
                secureTextEntry 
              />
            </View>

            <TouchableOpacity 
              style={[styles.btn, loading && styles.btnDisabled]} 
              onPress={handleRegister} 
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.btnText}>Create Account</Text>
              )}
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.link}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    flexGrow: 1,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  emoji: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: 32,
    fontWeight: FONTS.bold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  form: {
    backgroundColor: COLORS.surface,
    padding: SPACING.xl,
    borderRadius: 24,
    ...SHADOWS.md,
  },
  inputContainer: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: 14,
    fontWeight: FONTS.semiBold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
    marginLeft: 4,
  },
  input: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: COLORS.text,
  },
  btn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: SPACING.md,
    ...SHADOWS.sm,
  },
  btnDisabled: {
    opacity: 0.7,
  },
  btnText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: FONTS.bold,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.lg,
  },
  footerText: {
    color: COLORS.textLight,
    fontSize: 14,
  },
  link: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: FONTS.semiBold,
  },
});