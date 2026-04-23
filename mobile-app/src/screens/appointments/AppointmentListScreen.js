import React, { useState, useCallback, useContext } from 'react';
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
import { AuthContext } from '../../context/AuthContext';
import { COLORS, SPACING, FONTS, SHADOWS } from '../../theme/theme';

export default function AppointmentListScreen({ navigation, route }) {
  const { user } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState(route.params?.initialTab || 'bookings');

  const isManager = user?.role !== 'owner';

  const fetchAppointments = async (isRefreshing = false) => {
    if (!isRefreshing) setLoading(true);
    try {
      const res = await api.get('/appointments');
      // Sort globally first
      const sortedData = res.data.sort((a, b) => new Date(a.date) - new Date(b.date));
      setAppointments(sortedData);
    } catch (err) {
      Alert.alert('Error', 'Could not load appointments');
    } finally { 
      setLoading(true); 
      setRefreshing(false);
      setLoading(false);
    }
  };

  const groupAppointmentsByDate = (data) => {
    const groups = {};
    data.forEach(item => {
      const dateKey = new Date(item.date).toLocaleDateString();
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(item);
    });
    return Object.keys(groups).map(date => ({
      date,
      data: groups[date]
    }));
  };

  useFocusEffect(useCallback(() => { fetchAppointments(); }, []));

  const onRefresh = () => {
    setRefreshing(true);
    fetchAppointments(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Available': return COLORS.primary;
      case 'Completed': return COLORS.success;
      case 'Cancelled': return COLORS.error;
      default: return COLORS.secondary;
    }
  };

  const renderItem = ({ item }) => {
    const isAvailable = item.status === 'Available';
    return (
      <TouchableOpacity 
        style={styles.card}
        onPress={() => navigation.navigate('AppointmentDetail', { id: item._id })}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={styles.petIconContainer}>
            <Ionicons name={isAvailable ? "medical" : "paw"} size={20} color={COLORS.primary} />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.petName}>
              {isAvailable ? item.vetName : item.petName}
            </Text>
            {isAvailable ? (
              <Text style={styles.vetName}>Available Vet Slot</Text>
            ) : (
              <Text style={styles.ownerName}>
                Owner: {item.owner?.name || 'Unknown'} • {item.vetName}
              </Text>
            )}
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '15' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {item.status.toUpperCase()}
            </Text>
          </View>
        </View>
      
      <View style={styles.cardFooter}>
        <View style={styles.footerItem}>
          <Ionicons name="calendar-outline" size={16} color={COLORS.textLight} />
          <Text style={styles.footerText}>{new Date(item.date).toLocaleDateString()}</Text>
        </View>
        <View style={[styles.footerItem, { marginLeft: SPACING.md }]}>
          <Ionicons name="time-outline" size={16} color={COLORS.textLight} />
          <Text style={styles.footerText}>{new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
        </View>
      </View>
    </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {isManager && (
        <View style={styles.tabBar}>
          <TouchableOpacity 
            style={[styles.tabItem, selectedTab === 'availability' && styles.tabItemActive]}
            onPress={() => setSelectedTab('availability')}
          >
            <Ionicons name="calendar-outline" size={20} color={selectedTab === 'availability' ? COLORS.primary : COLORS.textLight} />
            <Text style={[styles.tabText, selectedTab === 'availability' && styles.tabTextActive]}>Appt Slots</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tabItem, selectedTab === 'bookings' && styles.tabItemActive]}
            onPress={() => setSelectedTab('bookings')}
          >
            <Ionicons name="list-outline" size={20} color={selectedTab === 'bookings' ? COLORS.primary : COLORS.textLight} />
            <Text style={[styles.tabText, selectedTab === 'bookings' && styles.tabTextActive]}>Vet Appointments</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tabItem, selectedTab === 'history' && styles.tabItemActive]}
            onPress={() => setSelectedTab('history')}
          >
            <Ionicons name="archive-outline" size={20} color={selectedTab === 'history' ? COLORS.primary : COLORS.textLight} />
            <Text style={[styles.tabText, selectedTab === 'history' && styles.tabTextActive]}>History</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.content}>
        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <View style={{ flex: 1 }}>
            {user?.role === 'owner' ? (
              <>
                {appointments.some(a => a.status === 'Available') && (
                  <View style={styles.sectionHeader}>
                    <Ionicons name="sparkles" size={20} color={COLORS.primary} />
                    <Text style={styles.sectionTitle}>Available Slots</Text>
                  </View>
                )}
                <FlatList 
                  data={appointments.filter(a => a.status === 'Available')} 
                  keyExtractor={item => 'available_' + item._id}
                  renderItem={renderItem}
                  scrollEnabled={false}
                  contentContainerStyle={styles.subListContent}
                />

                <View style={[styles.sectionHeader, { marginTop: SPACING.md }]}>
                  <Ionicons name="calendar" size={20} color={COLORS.primary} />
                  <Text style={styles.sectionTitle}>My Appointments</Text>
                </View>
                <FlatList 
                  data={appointments.filter(a => a.status !== 'Available')} 
                  keyExtractor={item => item._id}
                  renderItem={renderItem}
                  contentContainerStyle={styles.listContent}
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                      <Ionicons name="calendar-outline" size={64} color={COLORS.border} />
                      <Text style={styles.emptyText}>No appointments found</Text>
                    </View>
                  }
                />
              </>
            ) : (
              <FlatList 
                data={groupAppointmentsByDate(
                  appointments.filter(a => {
                    const matchesTab = (
                      (selectedTab === 'availability' && a.status === 'Available') ||
                      (selectedTab === 'bookings' && ['Pending', 'Scheduled'].includes(a.status)) ||
                      (selectedTab === 'history' && ['Completed', 'Cancelled'].includes(a.status))
                    );

                    if (!matchesTab) return false;

                    // Specialized filtering for Vaccination Manager
                    if (user?.role === 'vaccine_manager' && selectedTab !== 'availability') {
                      return a.reason?.toLowerCase().includes('vaccination');
                    }

                    return true;
                  })
                )} 
                keyExtractor={item => item.date}
                renderItem={({ item }) => (
                  <View style={styles.dateGroup}>
                    <Text style={styles.dateGroupHeader}>{item.date}</Text>
                    {item.data.map(appt => (
                      <View key={appt._id}>
                        {renderItem({ item: appt })}
                      </View>
                    ))}
                  </View>
                )}
                contentContainerStyle={styles.listContent}
                refreshing={refreshing}
                onRefresh={onRefresh}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Ionicons name={selectedTab === 'availability' ? "calendar-outline" : "list-outline"} size={64} color={COLORS.border} />
                    <Text style={styles.emptyText}>
                      {selectedTab === 'availability' ? 'No appointment slots listed' : 'No patient bookings found'}
                    </Text>
                    {selectedTab === 'availability' && (
                      <TouchableOpacity 
                        style={styles.emptyBtn}
                        onPress={() => navigation.navigate('AppointmentForm')}
                      >
                        <Text style={styles.emptyBtnText}>Add Appointment Slot</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                }
              />
            )}
          </View>
        )}
      </View>
      
      {(!isManager || selectedTab === 'availability') && (
        <TouchableOpacity 
          style={styles.fab}
          onPress={() => navigation.navigate(user?.role === 'owner' ? 'AvailableSlots' : 'AppointmentForm')}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={30} color={COLORS.white} />
        </TouchableOpacity>
      )}
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: FONTS.bold,
    color: COLORS.text,
  },
  subListContent: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
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
    backgroundColor: COLORS.primary + '15',
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
  vetName: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  ownerName: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: FONTS.medium,
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
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
  },
  tabItemActive: {
    backgroundColor: COLORS.primary + '10',
  },
  tabText: {
    fontSize: 14,
    fontWeight: FONTS.semiBold,
    color: COLORS.textLight,
  },
  tabTextActive: {
    color: COLORS.primary,
  },
  dateGroup: {
    marginBottom: SPACING.md,
  },
  dateGroupHeader: {
    fontSize: 14,
    fontWeight: FONTS.bold,
    color: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: SPACING.sm,
    alignSelf: 'flex-start',
    textTransform: 'uppercase',
  }
});