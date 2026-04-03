import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator, 
  Alert,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { COLORS, SPACING, FONTS, SHADOWS } from '../../theme/theme';

export default function MedicationListScreen({ navigation }) {
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMedications = async (isRefreshing = false) => {
    if (!isRefreshing) setLoading(true);
    try {
      const res = await api.get('/medications');
      setMedications(res.data);
    } catch (err) {
      Alert.alert('Error', 'Could not load medications');
    } finally { 
      setLoading(false); 
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchMedications(); }, []));

  const onRefresh = () => {
    setRefreshing(true);
    fetchMedications(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return COLORS.success;
      case 'Discontinued': return COLORS.error;
      default: return COLORS.textLight;
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => navigation.navigate('MedicationDetail', { id: item._id })}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.petIconContainer, { backgroundColor: COLORS.error + '15' }]}>
          <Ionicons name="medical" size={20} color={COLORS.error} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.petName}>{item.petName}</Text>
          <Text style={styles.medicationName}>{item.medicationName}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '15' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
        </View>
      </View>
      
      <View style={styles.cardFooter}>
        <View style={styles.footerItem}>
          <Ionicons name="flask-outline" size={16} color={COLORS.textLight} />
          <Text style={styles.footerText}>{item.dosage} · {item.frequency}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.content}>
        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <FlatList 
            data={medications} 
            keyExtractor={item => item._id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            refreshing={refreshing}
            onRefresh={onRefresh}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="medical-outline" size={64} color={COLORS.border} />
                <Text style={styles.emptyText}>No medications found</Text>
                <TouchableOpacity 
                  style={styles.emptyBtn}
                  onPress={() => navigation.navigate('MedicationForm')}
                >
                  <Text style={styles.emptyBtnText}>Add Medication</Text>
                </TouchableOpacity>
              </View>
            }
          />
        )}
      </View>
      
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => navigation.navigate('MedicationForm')}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={30} color={COLORS.white} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
  },
  listContent: {
    padding: SPACING.md,
    paddingBottom: 100, // Extra space for FAB
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  petIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  headerText: {
    flex: 1,
  },
  petName: {
    fontSize: 16,
    fontWeight: FONTS.bold,
    color: COLORS.text,
  },
  medicationName: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: FONTS.semiBold,
  },
  cardFooter: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.sm,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    color: COLORS.textLight,
    marginLeft: 4,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textLight,
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  emptyBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.sm,
    borderRadius: 12,
  },
  emptyBtnText: {
    color: COLORS.white,
    fontWeight: FONTS.semiBold,
  },
  fab: {
    position: 'absolute',
    bottom: SPACING.xl,
    right: SPACING.lg,
    backgroundColor: COLORS.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.md,
  },
});