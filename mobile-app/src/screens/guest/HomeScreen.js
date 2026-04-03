import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar, 
  ScrollView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONTS, SHADOWS } from '../../theme/theme';

export default function HomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.hero}>
          <Ionicons name="paw" size={80} color={COLORS.primary} style={styles.heroIcon} />
          <Text style={styles.title}>Your Pet's Best Friend</Text>
          <Text style={styles.subtitle}>Manage vet visits, vaccinations, diet, and more in one premium app.</Text>
          
          <View style={styles.ctaContainer}>
            <TouchableOpacity 
              style={styles.primaryBtn} 
              onPress={() => navigation.navigate('Register')}
            >
              <Text style={styles.primaryBtnText}>Get Started</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.secondaryBtn} 
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.secondaryBtnText}>Login</Text>
            </TouchableOpacity>
          </View>

        </View>

        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Our Services</Text>
          
          <FeatureCard 
            title="Vet Care" 
            desc="Book and track all your medical appointments easily." 
            icon="medical-outline" 
          />
          <FeatureCard 
            title="Grooming" 
            desc="Professional pampering for your furry friends." 
            icon="cut-outline" 
          />
          <FeatureCard 
            title="Boarding" 
            desc="Safe and comfortable stays when you're away." 
            icon="bed-outline" 
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const FeatureCard = ({ title, desc, icon }) => (
  <View style={styles.featureCard}>
    <View style={styles.featureIconContainer}>
      <Ionicons name={icon} size={24} color={COLORS.primary} />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDesc}>{desc}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  hero: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  heroIcon: {
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: 32,
    fontWeight: FONTS.bold,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textLight,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 24,
    marginBottom: SPACING.xl,
  },
  ctaContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  primaryBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 16,
    ...SHADOWS.md,
  },
  primaryBtnText: {
    color: COLORS.white,
    fontWeight: FONTS.bold,
    fontSize: 16,
  },
  secondaryBtn: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  secondaryBtnText: {
    color: COLORS.primary,
    fontWeight: FONTS.bold,
    fontSize: 16,
  },
  featuresSection: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: FONTS.bold,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  featureCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: FONTS.bold,
    color: COLORS.text,
  },
  featureDesc: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 2,
  },
});
