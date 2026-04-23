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
  StatusBar,
  Modal,
  TextInput,
  Platform
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { COLORS, SPACING, FONTS, SHADOWS } from '../../theme/theme';

export default function AvailableSlotsScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [bookingModalVisible, setBookingModalVisible] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [petName, setPetName] = useState('');
  const [reason, setReason] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [filterDate, setFilterDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const fetchSlots = async (isRefreshing = false) => {
    if (!isRefreshing) setLoading(true);
    try {
      const res = await api.get('/appointments');
      const available = res.data.filter(a => a.status === 'Available');
      setSlots(available);
    } catch (err) {
      Alert.alert('Error', 'Could not load available slots');
    } finally { 
      setLoading(false); 
      setRefreshing(false);
    }
  };

  const filteredSlots = slots.filter(slot => {
    const slotDate = new Date(slot.date).toDateString();
    const filterDateStr = filterDate.toDateString();
    return slotDate === filterDateStr && new Date(slot.date) >= new Date();
  });

  useFocusEffect(useCallback(() => { fetchSlots(); }, []));

  const onRefresh = () => {
    setRefreshing(true);
    fetchSlots(true);
  };

  const handleBookSlot = async () => {
    if (!petName) return Alert.alert('Error', 'Please enter your pet\'s name');
    
    try {
      setBookingLoading(true);
      await api.put(`/appointments/${selectedSlot._id}/book`, { petName, reason });
      setBookingModalVisible(false);
      setPetName('');
      setReason('');
      await fetchSlots();
      Alert.alert('Success', 'Appointment booked successfully!');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Could not book slot');
    } finally {
      setBookingLoading(false);
    }
  };

  const renderItem = ({ item }) => {
    const apptDate = new Date(item.date);
    return (
      <TouchableOpacity 
        style={styles.card}
        onPress={() => {
          setSelectedSlot(item);
          setBookingModalVisible(true);
        }}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={styles.iconContainer}>
            <Ionicons name="medical" size={20} color={COLORS.primary} />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.vetName}>Dr. {item.vetName}</Text>
            <Text style={styles.slotSubtitle}>Available Appointment</Text>
          </View>
          <View style={styles.bookBadge}>
            <Text style={styles.bookBadgeText}>BOOK</Text>
          </View>
        </View>
        
        <View style={styles.cardFooter}>
          <View style={styles.footerItem}>
            <Ionicons name="calendar-outline" size={16} color={COLORS.textLight} />
            <Text style={styles.footerText}>{apptDate.toLocaleDateString()}</Text>
          </View>
          <View style={[styles.footerItem, { marginLeft: SPACING.md }]}>
            <Ionicons name="time-outline" size={16} color={COLORS.textLight} />
            <Text style={styles.footerText}>{apptDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Select a Slot</Text>
      </View>

      <View style={styles.filterBar}>
        <Text style={styles.filterLabel}>Filter by Date:</Text>
        {Platform.OS === 'web' ? (
          React.createElement('input', {
            type: 'date',
            value: filterDate.toISOString().split('T')[0],
            min: new Date().toISOString().split('T')[0],
            onChange: (e) => {
              const [year, month, day] = e.target.value.split('-');
              setFilterDate(new Date(year, month - 1, day));
            },
            style: webInputStyle
          })
        ) : (
          <TouchableOpacity 
            style={styles.datePickerBtn}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons name="calendar" size={18} color={COLORS.primary} />
            <Text style={styles.datePickerBtnText}>{filterDate.toLocaleDateString()}</Text>
          </TouchableOpacity>
        )}
      </View>

      {Platform.OS !== 'web' && showDatePicker && (
        <DateTimePicker
          value={filterDate}
          mode="date"
          display="default"
          minimumDate={new Date()}
          onChange={(event, date) => {
            setShowDatePicker(false);
            if (date) setFilterDate(date);
          }}
        />
      )}

      <View style={styles.content}>
        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <FlatList 
            data={filteredSlots} 
            keyExtractor={item => item._id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            refreshing={refreshing}
            onRefresh={onRefresh}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="calendar-outline" size={64} color={COLORS.border} />
                <Text style={styles.emptyText}>No available slots found</Text>
                <Text style={styles.emptySubText}>Please check back later for new openings.</Text>
              </View>
            }
          />
        )}
      </View>

      {/* Booking Modal */}
      <Modal
        visible={bookingModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setBookingModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Book Appointment</Text>
              <TouchableOpacity onPress={() => setBookingModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>Please provide details for your pet's visit.</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Pet Name</Text>
              <TextInput
                style={styles.input}
                value={petName}
                onChangeText={setPetName}
                placeholder="E.g. Buddy"
                placeholderTextColor={COLORS.textLight + '80'}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Reason for Visit</Text>
              <TextInput
                style={[styles.input, { height: 80 }]}
                value={reason}
                onChangeText={setReason}
                placeholder="E.g. Annual Checkup"
                placeholderTextColor={COLORS.textLight + '80'}
                multiline
                textAlignVertical="top"
              />
            </View>

            <TouchableOpacity 
              style={[styles.primaryBtn, bookingLoading && { opacity: 0.7 }]} 
              onPress={handleBookSlot}
              disabled={bookingLoading}
            >
              {bookingLoading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <>
                  <Ionicons name="checkmark-circle-outline" size={20} color={COLORS.white} />
                  <Text style={styles.primaryBtnText}>Confirm Booking</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    ...SHADOWS.sm,
  },
  backBtn: {
    marginRight: SPACING.md,
  },
  title: {
    fontSize: 20,
    fontWeight: FONTS.bold,
    color: COLORS.text,
  },
  content: {
    flex: 1,
  },
  listContent: {
    padding: SPACING.md,
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
  iconContainer: {
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
  vetName: {
    fontSize: 16,
    fontWeight: FONTS.bold,
    color: COLORS.text,
  },
  slotSubtitle: {
    fontSize: 13,
    color: COLORS.textLight,
  },
  bookBadge: {
    backgroundColor: COLORS.success + '15',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  bookBadgeText: {
    color: COLORS.success,
    fontSize: 12,
    fontWeight: FONTS.bold,
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
    fontSize: 18,
    fontWeight: FONTS.bold,
    color: COLORS.text,
    marginTop: SPACING.md,
  },
  emptySubText: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 4,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: SPACING.lg,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: FONTS.bold,
    color: COLORS.text,
  },
  modalSubtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: SPACING.lg,
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: FONTS.semiBold,
    color: COLORS.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    color: COLORS.text,
  },
  primaryBtn: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.md,
    ...SHADOWS.sm,
  },
  primaryBtnText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: FONTS.bold,
    marginLeft: 8,
  },
  filterBar: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: FONTS.semiBold,
    color: COLORS.textLight,
    marginRight: SPACING.md,
  },
  datePickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  datePickerBtnText: {
    fontSize: 14,
    fontWeight: FONTS.bold,
    color: COLORS.primary,
    marginLeft: 8,
  }
});

const webInputStyle = {
  padding: '8px 12px',
  borderRadius: 8,
  border: '1px solid #E2E8F0',
  backgroundColor: '#F8FAFC',
  fontSize: 14,
  color: '#1E293B',
  fontFamily: 'inherit',
  outline: 'none',
};
