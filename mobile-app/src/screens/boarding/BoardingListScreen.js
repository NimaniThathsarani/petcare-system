import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator, 
  Alert, 
  Image,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { COLORS, SPACING, FONTS, SHADOWS } from '../../theme/theme';
export default function BoardingListScreen({ navigation, route }) {
  const { managerView } = route.params || {};
  const [boardings, setBoardings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBoardings = async () => {
    try {
      const res = await api.get('/boarding');
      let data = Array.isArray(res.data) ? res.data : [];
      if (managerView) {
        // Only show Pending/Approved in the Requests tab
        data = data.filter(b => b?.status && ['Pending', 'Approved'].includes(b.status));
      }
      setBoardings(data);
    } catch (err) {
      console.log('FETCH ERR (List):', err);
      Alert.alert('Error', 'Failed to fetch boarding records');
      setBoardings([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchBoardings(); }, []));

  const onRefresh = () => {
    setRefreshing(true);
    fetchBoardings();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return COLORS.pending;
      case 'Approved': return COLORS.approved;
      case 'Checked-in': return COLORS.checkedIn;
      case 'Completed': return COLORS.completed;
      case 'Cancelled': return COLORS.error;
      default: return COLORS.textLight;
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await api.put(`/boarding/${id}`, { status: newStatus });
      fetchBoardings();
      Alert.alert('Success', `Booking ${newStatus.toLowerCase()} successfully`);
    } catch (err) {
      Alert.alert('Error', 'Failed to update booking status');
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => navigation.navigate('BoardingDetail', { id: item._id })}
      activeOpacity={0.7}
    >
      {item.image && (
        <Image 
          source={{ uri: `${api.defaults.baseURL.split('/api')[0]}${item.image}` }} 
          style={styles.image} 
        />
      )}
      <View style={styles.cardHeader}>
        <View style={[styles.petIconContainer, { backgroundColor: COLORS.primary + '15' }]}>
          <Ionicons name="bed" size={20} color={COLORS.primary} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.petName}>{item.petName}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '15' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
        </View>
      </View>
      
      <View style={styles.cardFooter}>
        <View style={styles.footerItem}>
          <Ionicons name="calendar-outline" size={16} color={COLORS.textLight} />
          <Text style={styles.footerText}>
            {new Date(item.checkInDate).toLocaleDateString()} - {new Date(item.checkOutDate).toLocaleDateString()}
          </Text>
        </View>
      </View>

      {managerView && (
        <View style={styles.managerActions}>
          {item.status === 'Pending' && (
            <TouchableOpacity 
              style={[styles.actionBtn, { backgroundColor: COLORS.success }]}
              onPress={() => handleUpdateStatus(item._id, 'Approved')}
            >
              <Text style={styles.actionBtnText}>Approve</Text>
            </TouchableOpacity>
          )}
          {item.status === 'Approved' && (
            <TouchableOpacity 
              style={[styles.actionBtn, { backgroundColor: COLORS.primary }]}
              onPress={() => handleUpdateStatus(item._id, 'Checked-in')}
            >
              <Text style={styles.actionBtnText}>Check-In</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{managerView ? 'Booking Requests' : 'My Boardings'}</Text>
        {!managerView && (
          <TouchableOpacity 
            style={styles.addBtn}
            onPress={() => navigation.navigate('BoardingForm')}
          >
            <Ionicons name="add" size={24} color={COLORS.white} />
          </TouchableOpacity>
        )}
      </View>

      {!managerView && boardings.length > 0 && (
        <TouchableOpacity 
          style={styles.heroCard}
          onPress={() => navigation.navigate('BoardingForm')}
        >
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>Book New Boarding</Text>
            <Text style={styles.heroSub}>Reserve a safe spot for your pet</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={COLORS.white} />
        </TouchableOpacity>
      )}

      <View style={styles.content}>
        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <FlatList 
            data={boardings} 
            keyExtractor={item => item._id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            refreshing={refreshing}
            onRefresh={onRefresh}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="bed-outline" size={64} color={COLORS.border} />
                <Text style={styles.emptyText}>No boarding records found</Text>
                {!managerView && (
                  <TouchableOpacity 
                    style={styles.emptyBtn}
                    onPress={() => navigation.navigate('BoardingForm')}
                  >
                    <Text style={styles.emptyBtnText}>New Record</Text>
                  </TouchableOpacity>
                )}
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: FONTS.bold,
    color: COLORS.text,
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  heroCard: {
    backgroundColor: COLORS.primary,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    padding: SPACING.lg,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...SHADOWS.md,
  },
  heroContent: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: FONTS.bold,
    color: COLORS.white,
  },
  heroSub: {
    fontSize: 13,
    color: COLORS.white + '90',
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  listContent: {
    padding: SPACING.lg,
    paddingTop: 0,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 150,
    borderRadius: 12,
    marginBottom: SPACING.md,
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
  managerActions: {
    flexDirection: 'row',
    marginTop: SPACING.md,
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionBtnText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: FONTS.bold,
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