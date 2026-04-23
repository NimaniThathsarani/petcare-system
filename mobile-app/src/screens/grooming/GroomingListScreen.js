import React, { useState, useCallback, useContext } from 'react';
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
  StatusBar,
  ScrollView
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { COLORS, SPACING, FONTS, SHADOWS } from '../../theme/theme';

export default function GroomingListScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const [groomings, setGroomings] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const isManager = user?.role !== 'owner';

  const fetchData = async (isRefreshing = false) => {
    if (!isRefreshing) setLoading(true);
    try {
      const [groomRes, servRes] = await Promise.all([
        api.get('/grooming'),
        api.get('/grooming-services')
      ]);
      setGroomings(groomRes.data);
      setServices(servRes.data);
    } catch (err) {
      Alert.alert('Error', 'Could not load grooming data');
    } finally { 
      setLoading(false); 
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchData(); }, []));

  const onRefresh = () => {
    setRefreshing(true);
    fetchData(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return COLORS.success;
      case 'Cancelled': return COLORS.error;
      default: return COLORS.secondary;
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => navigation.navigate('GroomingDetail', { id: item._id })}
      activeOpacity={0.7}
    >
      {item.image && (
        <Image 
          source={{ uri: `${api.defaults.baseURL.split('/api')[0]}${item.image}` }} 
          style={styles.image} 
        />
      )}
      <View style={styles.cardHeader}>
        <View style={[styles.petIconContainer, { backgroundColor: COLORS.accent + '15' }]}>
          <Ionicons name="cut" size={20} color={COLORS.accent} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.petName}>{item.petName}</Text>
          {isManager && item.owner ? (
            <Text style={styles.ownerName}>Owner: {item.owner.name}</Text>
          ) : (
            <Text style={styles.serviceType}>{item.serviceType}</Text>
          )}
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '15' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
        </View>
      </View>
      
      <View style={styles.cardFooter}>
        <View style={styles.footerItem}>
          <Ionicons name="calendar-outline" size={16} color={COLORS.textLight} />
          <Text style={styles.footerText}>{new Date(item.date).toLocaleDateString()}</Text>
        </View>
        <View style={[styles.footerItem, { marginLeft: SPACING.md }]}>
          <Ionicons name="cash-outline" size={16} color={COLORS.textLight} />
          <Text style={styles.footerText}>LKR {item.cost || '0'}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.listHeader}>
        <Text style={styles.title}>{isManager ? 'Active Bookings' : 'Grooming Sessions'}</Text>
      </View>
      
      {!isManager && services.length > 0 && (
        <View style={styles.servicesHeader}>
          <Text style={styles.servicesTitle}>Our Services & Rates</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.servicesScroll}>
            {services.map(s => (
              <View key={s._id} style={styles.serviceMiniCard}>
                <Text style={styles.miniServiceName}>{s.name}</Text>
                <Text style={styles.miniServicePrice}>LKR {s.price}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      <View style={styles.content}>
        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <FlatList 
            data={groomings} 
            keyExtractor={item => item._id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            refreshing={refreshing}
            onRefresh={onRefresh}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="cut-outline" size={64} color={COLORS.border} />
                <Text style={styles.emptyText}>No grooming found</Text>
                <TouchableOpacity 
                  style={styles.emptyBtn}
                  onPress={() => navigation.navigate('GroomingForm')}
                >
                  <Text style={styles.emptyBtnText}>Book Grooming</Text>
                </TouchableOpacity>
              </View>
            }
          />
        )}
      </View>
      
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => navigation.navigate('GroomingForm')}
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
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  title: {
    fontSize: 22,
    fontWeight: FONTS.bold,
    color: COLORS.text,
  },
  manageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '15',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  manageBtnText: {
    fontSize: 14,
    fontWeight: FONTS.semiBold,
    color: COLORS.primary,
    marginLeft: 6,
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
  serviceType: {
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
  servicesHeader: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  servicesTitle: {
    fontSize: 14,
    fontWeight: FONTS.bold,
    color: COLORS.textLight,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.sm,
  },
  servicesScroll: {
    paddingBottom: 4,
  },
  serviceMiniCard: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    marginRight: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  miniServiceName: {
    fontSize: 14,
    fontWeight: FONTS.bold,
    color: COLORS.text,
  },
  miniServicePrice: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: FONTS.semiBold,
    marginTop: 2,
  },
});