import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONTS, SHADOWS } from '../../theme/theme';

export default function ServicesScreen() {
  const services = [
    { name: 'Vet Appointments', icon: 'medical', desc: 'Secure medical checkups and follow-ups.' },
    { name: 'Vaccination Tracking', icon: 'shield-checkmark', desc: 'Detailed records and timely reminders.' },
    { name: 'Grooming Services', icon: 'cut', desc: 'Professional grooming to keep pets happy.' },
    { name: 'Dietary Planning', icon: 'restaurant', desc: 'Customized feeding for optimal health.' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Our Services</Text>
        <Text style={styles.subtitle}>Discover how PetCare simplifies your pet management.</Text>
        
        {services.map((svc, i) => (
          <View key={i} style={styles.card}>
            <View style={styles.iconBox}>
              <Ionicons name={svc.icon} size={28} color={COLORS.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{svc.name}</Text>
              <Text style={styles.cardDesc}>{svc.desc}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { padding: SPACING.lg },
  title: { fontSize: 28, fontWeight: FONTS.bold, color: COLORS.text },
  subtitle: { fontSize: 16, color: COLORS.textLight, marginTop: 4, marginBottom: SPACING.xl },
  card: { flexDirection: 'row', backgroundColor: COLORS.surface, padding: SPACING.md, borderRadius: 20, marginBottom: SPACING.md, alignItems: 'center', ...SHADOWS.sm },
  iconBox: { width: 56, height: 56, borderRadius: 16, backgroundColor: COLORS.primary + '15', justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md },
  cardTitle: { fontSize: 18, fontWeight: FONTS.bold, color: COLORS.text },
  cardDesc: { fontSize: 14, color: COLORS.textLight, marginTop: 2 },
});
