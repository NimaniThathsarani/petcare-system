import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { COLORS, SPACING, FONTS } from '../../theme/theme';

export default function AboutScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>About PetCare</Text>
        <Text style={styles.text}>
          PetCare is a comprehensive management system designed for discerning pet owners and modern animal care facilities.
          Our mission is to provide a seamless, premium experience for tracking and improving the lives of your beloved pets.
        </Text>
        <Text style={styles.sectionTitle}>Our Vision</Text>
        <Text style={styles.text}>
          We believe every pet deserves the highest standard of care. By centralizing medical records, grooming schedules, 
          and nutrition plans, we empower owners and professionals to work together for the well-being of animals.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { padding: SPACING.lg },
  title: { fontSize: 28, fontWeight: FONTS.bold, color: COLORS.text, marginBottom: SPACING.md },
  sectionTitle: { fontSize: 20, fontWeight: FONTS.bold, color: COLORS.primary, marginTop: SPACING.lg, marginBottom: SPACING.sm },
  text: { fontSize: 16, color: COLORS.textLight, lineHeight: 24 },
});
