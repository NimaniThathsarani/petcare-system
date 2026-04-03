import React, { useState, useEffect, useCallback, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { COLORS, SPACING, FONTS, SHADOWS } from '../../theme/theme';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - SPACING.lg * 3) / 2;

export default function BoardingDashboardScreen({ navigation }) {
  const { logout } = useContext(AuthContext);
  const [boardings, setBoardings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState('Requests'); // 'Requests', 'Active', 'History'
  
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  const fetchBoardings = async () => {
    try {
      const res = await api.get('/boarding');
      setBoardings(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.log('FETCH ERR:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchBoardings(); }, []));

  const requests = boardings.filter(b => ['Pending', 'Approved'].includes(b.status));
  const activeStays = boardings.filter(b => b.status === 'Checked-in');
  const history = boardings.filter(b => ['Completed', 'Cancelled'].includes(b.status));

  const renderActiveCage = ({ item }) => (
    <TouchableOpacity 
      style={styles.cageCard}
      onPress={() => {
        setSelectedBooking(item);
        setModalVisible(true);
      }}
    >
      <View style={styles.cageHeader}>
        <Ionicons name="cube-outline" size={24} color={COLORS.primary} />
        <Text style={styles.cageNumber}>Cage {item.cage?.cageNumber || item.cageNumber || 'N/A'}</Text>
      </View>
      <View style={styles.cageInfo}>
        <Text style={styles.petNameActive}>{item.petName}</Text>
        <Text style={styles.ownerNameActive}>{item.owner?.name || item.ownerName}</Text>
      </View>
      <View style={styles.activeBadge}>
        <Text style={styles.activeText}>Active</Text>
      </View>
    </TouchableOpacity>
  );

  const renderHistoryItem = ({ item }) => (
    <View style={styles.historyCard}>
      <View style={styles.historyInfo}>
        <Text style={styles.petNameHistory}>{item.petName}</Text>
        <Text style={styles.historyDates}>
          {new Date(item.checkInDate).toLocaleDateString()} - {new Date(item.checkOutDate).toLocaleDateString()}
        </Text>
      </View>
      <View style={[styles.statusBadge, { backgroundColor: item.status === 'Completed' ? COLORS.success + '15' : COLORS.error + '15' }]}>
        <Text style={[styles.statusText, { color: item.status === 'Completed' ? COLORS.success : COLORS.error }]}>
          {item.status}
        </Text>
      </View>
    </View>
  );

  const renderRequestItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.historyCard}
      onPress={() => {
        setSelectedBooking(item);
        setModalVisible(true);
      }}
    >
      <View style={styles.historyInfo}>
        <Text style={styles.petNameHistory}>{item.petName}</Text>
        <Text style={styles.historyDates}>
          {new Date(item.checkInDate).toLocaleDateString()} - {new Date(item.checkOutDate).toLocaleDateString()}
        </Text>
      </View>
      <View style={[styles.statusBadge, { backgroundColor: item.status === 'Pending' ? COLORS.pending + '15' : COLORS.approved + '15' }]}>
        <Text style={[styles.statusText, { color: item.status === 'Pending' ? COLORS.pending : COLORS.approved }]}>
          {item.status}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Boarding Manager</Text>
          <Text style={styles.headerSub}>Manage stays and facility resources</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.refreshBtn}
            onPress={() => {
              setRefreshing(true);
              fetchBoardings();
            }}
          >
            <Ionicons name="refresh-outline" size={24} color={COLORS.primary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.refreshBtn, { marginLeft: 12, backgroundColor: COLORS.error + '10' }]}
            onPress={() => setLogoutModalVisible(true)}
            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          >
            <Ionicons name="log-out-outline" size={24} color={COLORS.error} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={[styles.tab, tab === 'Requests' && styles.activeTab]}
          onPress={() => setTab('Requests')}
        >
          <Text style={[styles.tabText, tab === 'Requests' && styles.activeTabText]}>Requests</Text>
          {requests.length > 0 && (
            <View style={[styles.countBadge, { backgroundColor: COLORS.pending + '15' }]}>
              <Text style={[styles.countText, { color: COLORS.pending }]}>{requests.length}</Text>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, tab === 'Active' && styles.activeTab]}
          onPress={() => setTab('Active')}
        >
          <Text style={[styles.tabText, tab === 'Active' && styles.activeTabText]}>Active Stays</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{activeStays.length}</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, tab === 'History' && styles.activeTab]}
          onPress={() => setTab('History')}
        >
          <Text style={[styles.tabText, tab === 'History' && styles.activeTabText]}>History</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={tab === 'Requests' ? requests : (tab === 'Active' ? activeStays : history)}
          keyExtractor={item => item._id}
          renderItem={tab === 'Active' ? renderActiveCage : (tab === 'Requests' ? renderRequestItem : renderHistoryItem)}
          numColumns={tab === 'Active' ? 2 : 1}
          key={tab === 'Active' ? 'h-grid' : 'v-list'}
          contentContainerStyle={styles.listContent}
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            fetchBoardings();
          }}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="bed-outline" size={64} color={COLORS.border} />
              <Text style={styles.emptyStateText}>No {tab.toLowerCase()} stays found</Text>
            </View>
          }
        />
      )}

      {/* Logout Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={logoutModalVisible}
        onRequestClose={() => setLogoutModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.logoutModalContent}>
            <Ionicons name="log-out-outline" size={48} color={COLORS.error} />
            <Text style={styles.logoutTitle}>Logout</Text>
            <Text style={styles.logoutSub}>Are you sure you want to logout of the manager portal?</Text>
            
            <View style={styles.logoutActions}>
              <TouchableOpacity 
                style={styles.cancelBtn}
                onPress={() => setLogoutModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.confirmBtn}
                onPress={async () => {
                  try {
                    setLogoutModalVisible(false);
                    await logout();
                  } catch (err) {
                    console.log('LOGOUT ERR:', err);
                  }
                }}
              >
                <Text style={styles.confirmBtnText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Enhanced Detail Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Stay Details</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            {selectedBooking && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.detailCard}>
                  <View style={styles.petHeader}>
                    <View style={styles.avatarLarge}>
                      <Ionicons name="paw" size={40} color={COLORS.white} />
                    </View>
                    <View style={styles.petMeta}>
                      <Text style={styles.petNameModal}>{selectedBooking.petName}</Text>
                      <View style={styles.cageBadgeModal}>
                        <Text style={styles.cageBadgeText}>Cage: {selectedBooking.cage?.cageNumber || selectedBooking.cageNumber || 'N/A'}</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.infoSection}>
                    <Text style={styles.sectionTitle}>Owner Details</Text>
                    <View style={styles.infoRow}>
                      <Ionicons name="person-outline" size={18} color={COLORS.primary} />
                      <Text style={styles.infoText}>{selectedBooking.owner?.name || selectedBooking.ownerName}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Ionicons name="mail-outline" size={18} color={COLORS.primary} />
                      <Text style={styles.infoText}>{selectedBooking.owner?.email || 'N/A'}</Text>
                    </View>
                  </View>

                  <View style={styles.infoSection}>
                    <Text style={styles.sectionTitle}>Stay Information</Text>
                    <View style={styles.dateContainer}>
                      <View style={styles.dateBlock}>
                        <Text style={styles.dateLabel}>Check-In</Text>
                        <Text style={styles.dateValue}>{new Date(selectedBooking.checkInDate).toLocaleDateString()}</Text>
                      </View>
                      <Ionicons name="arrow-forward" size={20} color={COLORS.border} />
                      <View style={styles.dateBlock}>
                        <Text style={styles.dateLabel}>Check-Out</Text>
                        <Text style={styles.dateValue}>{new Date(selectedBooking.checkOutDate).toLocaleDateString()}</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.infoSection}>
                    <Text style={styles.sectionTitle}>Food & Special Care</Text>
                    <View style={styles.careBox}>
                      <Text style={styles.careText}>
                        {selectedBooking.specialInstructions || 'No special requirements listed.'}
                      </Text>
                    </View>
                  </View>
                </View>

                {selectedBooking.status === 'Pending' && (
                  <View style={styles.modalActions}>
                    <TouchableOpacity 
                      style={[styles.actionBtn, { backgroundColor: COLORS.success }]}
                      onPress={async () => {
                        try {
                          await api.put(`/boarding/${selectedBooking._id}`, { status: 'Approved' });
                          setModalVisible(false);
                          fetchBoardings();
                          Alert.alert('Success', 'Booking Approved');
                        } catch (err) {
                          Alert.alert('Error', 'Failed to approve booking');
                        }
                      }}
                    >
                      <Ionicons name="checkmark" size={20} color={COLORS.white} />
                      <Text style={styles.actionBtnText}>Approve</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.actionBtn, { backgroundColor: COLORS.error }]}
                      onPress={async () => {
                        try {
                          await api.put(`/boarding/${selectedBooking._id}`, { status: 'Cancelled' });
                          setModalVisible(false);
                          fetchBoardings();
                          Alert.alert('Success', 'Booking Cancelled');
                        } catch (err) {
                          Alert.alert('Error', 'Failed to cancel booking');
                        }
                      }}
                    >
                      <Ionicons name="close" size={20} color={COLORS.white} />
                      <Text style={styles.actionBtnText}>Decline</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {selectedBooking.status === 'Approved' && (
                  <TouchableOpacity 
                    style={[styles.checkOutBtn, { backgroundColor: COLORS.primary }]}
                    onPress={async () => {
                      try {
                        await api.put(`/boarding/${selectedBooking._id}`, { status: 'Checked-in' });
                        setModalVisible(false);
                        fetchBoardings();
                        Alert.alert('Success', 'Pet Checked-in');
                      } catch (err) {
                        Alert.alert('Error', 'Failed to check-in');
                      }
                    }}
                  >
                    <Ionicons name="log-in-outline" size={20} color={COLORS.white} />
                    <Text style={styles.checkOutBtnText}>Check-In Now</Text>
                  </TouchableOpacity>
                )}

                {selectedBooking.status === 'Checked-in' && (
                  <TouchableOpacity 
                    style={styles.checkOutBtn}
                    onPress={async () => {
                      try {
                        await api.put(`/boarding/${selectedBooking._id}`, { status: 'Completed' });
                        setModalVisible(false);
                        fetchBoardings();
                        Alert.alert('Success', 'Check-out completed');
                      } catch (err) {
                        Alert.alert('Error', 'Failed to complete check-out');
                      }
                    }}
                  >
                    <Ionicons name="log-out-outline" size={20} color={COLORS.white} />
                    <Text style={styles.checkOutBtnText}>Complete Stay (Check-Out)</Text>
                  </TouchableOpacity>
                )}
              </ScrollView>
            )}
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: FONTS.bold,
    color: COLORS.text,
  },
  headerSub: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  refreshBtn: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    ...SHADOWS.sm,
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  activeTab: {
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: 14,
    color: COLORS.textLight,
    fontWeight: FONTS.medium,
  },
  activeTabText: {
    color: COLORS.primary,
    fontWeight: FONTS.bold,
  },
  countBadge: {
    backgroundColor: COLORS.primary + '15',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 6,
  },
  countText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: FONTS.semiBold,
  },
  listContent: {
    padding: SPACING.lg,
    paddingTop: 0,
  },
  cageCard: {
    width: COLUMN_WIDTH,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    marginHorizontal: SPACING.lg / 2,
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  cageHeader: {
    alignItems: 'center',
    marginBottom: 8,
  },
  cageNumber: {
    fontSize: 16,
    fontWeight: FONTS.bold,
    color: COLORS.primary,
    marginTop: 4,
  },
  cageInfo: {
    alignItems: 'center',
  },
  petNameActive: {
    fontSize: 18,
    fontWeight: FONTS.bold,
    color: COLORS.text,
  },
  ownerNameActive: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  activeBadge: {
    backgroundColor: COLORS.success + '15',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 12,
  },
  activeText: {
    fontSize: 10,
    color: COLORS.success,
    fontWeight: FONTS.bold,
    textTransform: 'uppercase',
  },
  historyCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  petNameHistory: {
    fontSize: 16,
    fontWeight: FONTS.bold,
    color: COLORS.text,
  },
  historyDates: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: FONTS.bold,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 100,
  },
  emptyStateText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.textLight,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    maxHeight: '90%',
    padding: SPACING.xl,
  },
  logoutModalContent: {
    backgroundColor: COLORS.surface,
    width: '85%',
    borderRadius: 24,
    padding: SPACING.xl,
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 'auto',
    marginTop: 'auto',
    ...SHADOWS.md,
  },
  logoutTitle: {
    fontSize: 20,
    fontWeight: FONTS.bold,
    color: COLORS.text,
    marginTop: 12,
  },
  logoutSub: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  logoutActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: FONTS.semiBold,
    color: COLORS.text,
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: COLORS.error,
    alignItems: 'center',
  },
  confirmBtnText: {
    fontSize: 14,
    fontWeight: FONTS.bold,
    color: COLORS.white,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: FONTS.bold,
    color: COLORS.text,
  },
  detailCard: {
    backgroundColor: COLORS.background,
    borderRadius: 24,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  petHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  petMeta: {
    marginLeft: SPACING.md,
  },
  petNameModal: {
    fontSize: 24,
    fontWeight: FONTS.bold,
    color: COLORS.text,
  },
  cageBadgeModal: {
    backgroundColor: COLORS.primary + '15',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 4,
  },
  cageBadgeText: {
    color: COLORS.primary,
    fontWeight: FONTS.bold,
    fontSize: 13,
  },
  infoSection: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 14,
    color: COLORS.textLight,
    fontWeight: FONTS.bold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  infoText: {
    fontSize: 16,
    color: COLORS.text,
    marginLeft: 10,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 16,
  },
  dateBlock: {
    alignItems: 'center',
  },
  dateLabel: {
    fontSize: 10,
    color: COLORS.textLight,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 15,
    fontWeight: FONTS.bold,
    color: COLORS.text,
  },
  careBox: {
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.accent,
  },
  careText: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.text,
  },
  checkOutBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 18,
    borderRadius: 16,
    marginBottom: 40,
    ...SHADOWS.md,
  },
  checkOutBtnText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: FONTS.bold,
    marginLeft: 10,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 40,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    ...SHADOWS.sm,
  },
  actionBtnText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: FONTS.bold,
    marginLeft: 8,
  },
});
