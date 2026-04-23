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
  ScrollView,
  Modal
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { COLORS, SPACING, FONTS, SHADOWS } from '../../theme/theme';

const ROLES = [
  { label: 'Veterinarian Manager', value: 'vet_manager' },
  { label: 'Vaccination Manager', value: 'vaccine_manager' },
  { label: 'Grooming Manager', value: 'grooming_manager' },
  { label: 'Boarding Manager', value: 'boarding_manager' },
  { label: 'Doctor', value: 'doctor' },
];

export default function StaffLoginScreen({ navigation }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState(ROLES[0].value);
  const [showRolePicker, setShowRolePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, staffLogin, register } = useContext(AuthContext);

  const handleAuth = async () => {
    if (!email || !password || (isSignUp && !name)) {
      return Alert.alert('Error', 'Please fill in all required fields');
    }
    if (!email.toLowerCase().endsWith('@gmail.com')) {
      return Alert.alert('Error', 'Email must be a @gmail.com address');
    }

    setLoading(true);
    try {
      if (isSignUp) {
        await register(name, email, password, selectedRole);
        Alert.alert('Success', 'Staff account created successfully! Please sign in.', [
          { text: 'OK', onPress: () => setIsSignUp(false) }
        ]);
      } else {
        await staffLogin(email, password);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid Login: Please check your connection';
      Alert.alert('Login Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  const getRoleLabel = (val) => ROLES.find(r => r.value === val)?.label || 'Select Role';

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.header}>
            <Text style={styles.icon}>💼</Text>
            <Text style={styles.title}>Staff Portal</Text>
            <Text style={styles.subtitle}>
              {isSignUp ? 'Create a professional manager account' : 'Access your management dashboard'}
            </Text>
          </View>

          <View style={styles.tabContainer}>
            <TouchableOpacity 
              style={[styles.tab, !isSignUp && styles.activeTab]}
              onPress={() => setIsSignUp(false)}
            >
              <Text style={[styles.tabText, !isSignUp && styles.activeTabText]}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, isSignUp && styles.activeTab]}
              onPress={() => setIsSignUp(true)}
            >
              <Text style={[styles.tabText, isSignUp && styles.activeTabText]}>Register</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.formCard}>
            {isSignUp && (
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput 
                  style={styles.input} 
                  placeholder="Employee Name"
                  value={name} 
                  onChangeText={setName}
                />
              </View>
            )}

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Staff Email</Text>
              <TextInput 
                style={styles.input} 
                placeholder="staff@petcare.com"
                value={email} 
                onChangeText={setEmail}
                autoCapitalize="none" 
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <TextInput 
                style={styles.input} 
                placeholder="••••••••"
                value={password} 
                onChangeText={setPassword} 
                secureTextEntry 
              />
            </View>

            {isSignUp && (
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Management Role</Text>
                <TouchableOpacity 
                  style={styles.pickerTrigger}
                  onPress={() => setShowRolePicker(true)}
                >
                  <Text style={styles.pickerValue}>{getRoleLabel(selectedRole)}</Text>
                  <Text style={styles.pickerArrow}>▼</Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity 
              style={styles.primaryBtn} 
              onPress={handleAuth} 
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.primaryBtnText}>{isSignUp ? 'Create Staff Account' : 'Sign In'}</Text>
              )}
            </TouchableOpacity>
          </View>

          <Modal visible={showRolePicker} transparent animationType="slide">
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Select Your Role</Text>
                {ROLES.map((role) => (
                  <TouchableOpacity 
                    key={role.value}
                    style={styles.roleOption}
                    onPress={() => {
                      setSelectedRole(role.value);
                      setShowRolePicker(false);
                    }}
                  >
                    <Text style={[styles.roleOptionText, selectedRole === role.value && styles.roleOptionActive]}>
                      {role.label}
                    </Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity 
                  style={styles.closeBtn}
                  onPress={() => setShowRolePicker(false)}
                >
                  <Text style={styles.closeBtnText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1 },
  scroll: { padding: SPACING.lg },
  header: { alignItems: 'center', marginVertical: 30 },
  icon: { fontSize: 48, marginBottom: 10 },
  title: { fontSize: 28, fontWeight: FONTS.bold, color: COLORS.text },
  subtitle: { fontSize: 14, color: COLORS.textLight, textAlign: 'center', marginTop: 4, paddingHorizontal: 30 },
  tabContainer: { 
    flexDirection: 'row', 
    backgroundColor: COLORS.surface, 
    borderRadius: 16, 
    padding: 4, 
    marginBottom: SPACING.xl,
    ...SHADOWS.sm
  },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 12 },
  activeTab: { backgroundColor: COLORS.primary },
  tabText: { fontSize: 15, fontWeight: FONTS.semiBold, color: COLORS.textLight },
  activeTabText: { color: COLORS.white },
  formCard: { 
    backgroundColor: COLORS.surface, 
    padding: 24, 
    borderRadius: 24, 
    ...SHADOWS.md, 
    marginBottom: 30 
  },
  inputContainer: { marginBottom: 20 },
  label: { fontSize: 13, fontWeight: FONTS.semiBold, color: COLORS.text, marginBottom: 8, marginLeft: 4 },
  input: { 
    backgroundColor: COLORS.background, 
    borderWidth: 1, 
    borderColor: COLORS.border, 
    borderRadius: 12, 
    padding: 14, 
    fontSize: 15,
    color: COLORS.text
  },
  pickerTrigger: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 14,
  },
  pickerValue: { fontSize: 15, color: COLORS.text },
  pickerArrow: { fontSize: 12, color: COLORS.textLight },
  primaryBtn: { 
    backgroundColor: COLORS.primary, 
    borderRadius: 12, 
    padding: 16, 
    alignItems: 'center', 
    marginTop: 10,
    ...SHADOWS.sm
  },
  primaryBtnText: { color: COLORS.white, fontSize: 16, fontWeight: FONTS.bold },
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    justifyContent: 'flex-end' 
  },
  modalContent: { 
    backgroundColor: COLORS.white, 
    borderTopLeftRadius: 30, 
    borderTopRightRadius: 30, 
    padding: SPACING.xl 
  },
  modalTitle: { fontSize: 20, fontWeight: FONTS.bold, color: COLORS.text, marginBottom: 20, textAlign: 'center' },
  roleOption: { paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  roleOptionText: { fontSize: 16, color: COLORS.text, textAlign: 'center' },
  roleOptionActive: { color: COLORS.primary, fontWeight: FONTS.bold },
  closeBtn: { marginTop: 20, padding: 15, alignItems: 'center' },
  closeBtnText: { color: COLORS.error, fontWeight: FONTS.bold }
});
