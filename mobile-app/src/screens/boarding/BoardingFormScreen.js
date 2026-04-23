import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  ActivityIndicator, 
  ScrollView, 
  Image,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Modal
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { COLORS, SPACING, FONTS, SHADOWS } from '../../theme/theme';

export default function BoardingFormScreen({ navigation, route }) {
  const { user } = useContext(AuthContext);
  const isOwner = user?.role === 'owner';
  const editId = route.params?.id;
  const [petName, setPetName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [petAge, setPetAge] = useState('');
  const [breed, setBreed] = useState('');
  const [phone, setPhone] = useState('');
  const [checkInDate, setCheckInDate] = useState(new Date());
  const [checkOutDate, setCheckOutDate] = useState(new Date(Date.now() + 86400000));
  const [showInPicker, setShowInPicker] = useState(false);
  const [showOutPicker, setShowOutPicker] = useState(false);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [notes, setNotes] = useState('');
  const [image, setImage] = useState(null);
  const [cages, setCages] = useState([]);
  const [selectedCageId, setSelectedCageId] = useState('');
  const [showCagePicker, setShowCagePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [pets, setPets] = useState([]);
  const [petsLoading, setPetsLoading] = useState(false);

  useEffect(() => { 
    if (editId) loadBoarding(); 
    if (isOwner) fetchPets();
  }, []);

  const fetchPets = async () => {
    try {
      setPetsLoading(true);
      const res = await api.get('/pets');
      setPets(res.data);
    } catch (err) {
      console.log('Error fetching pets:', err);
    } finally {
      setPetsLoading(false);
    }
  };
  
  const handlePetSelect = (pet) => {
    setPetName(pet.name);
    if (pet.breed) setBreed(pet.breed);
    if (pet.age) setPetAge(String(pet.age));
  };

  useEffect(() => {
    fetchCages();
  }, [checkInDate, checkOutDate]);

  const fetchCages = async () => {
    try {
      const inStr = checkInDate.toISOString().split('T')[0];
      const outStr = checkOutDate.toISOString().split('T')[0];
      const res = await api.get(`/cages?checkIn=${inStr}&checkOut=${outStr}`);
      setCages(res.data);
      // Reset selection if the current cage is no longer available
      if (selectedCageId && !res.data.find(c => c._id === selectedCageId)) {
        setSelectedCageId('');
      }
    } catch (err) {
      console.log('Error fetching cages:', err);
    }
  };

  const loadBoarding = async () => {
    setFetching(true);
    try {
      const res = await api.get(`/boarding/${editId}`);
      setPetName(res.data.petName);
      setOwnerName(res.data.ownerName || '');
      setPetAge(res.data.petAge ? String(res.data.petAge) : '');
      setBreed(res.data.breed || '');
      setSelectedCageId(res.data.cage?._id || '');
      setCheckInDate(new Date(res.data.checkInDate));
      setCheckOutDate(new Date(res.data.checkOutDate));
      setSpecialInstructions(res.data.specialInstructions || '');
      setNotes(res.data.notes || '');
    } catch (err) { 
      Alert.alert('Error', 'Could not load boarding record'); 
    } finally {
      setFetching(false);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });
    if (!result.canceled) setImage(result.assets[0]);
  };

  const handleSubmit = async () => {
    if (!petName || !checkInDate || !checkOutDate) {
      return Alert.alert('Missing Fields', 'Please fill in all required fields marked with *');
    }
    if (!phone) {
      return Alert.alert('Missing Fields', 'Please enter a contact phone number');
    }
    if (!/^0\d{9}$/.test(phone)) {
      return Alert.alert('Invalid Phone', 'Phone number must be 10 digits and start with 0');
    }
    
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('petName', petName);
      formData.append('ownerName', ownerName);
      if (petAge) formData.append('petAge', petAge);
      if (breed) formData.append('breed', breed);
      formData.append('phone', phone);
      formData.append('cage', selectedCageId);
      formData.append('checkInDate', checkInDate.toISOString());
      formData.append('checkOutDate', checkOutDate.toISOString());
      formData.append('specialInstructions', specialInstructions);
      formData.append('notes', notes);
      
      if (image) {
        const uriParts = image.uri.split('.');
        const fileType = uriParts[uriParts.length - 1];
        formData.append('image', {
          uri: image.uri,
          name: `boarding_${Date.now()}.${fileType}`,
          type: `image/${fileType}`,
        });
      }

      const headers = { 'Content-Type': 'multipart/form-data' };
      if (editId) {
        await api.put(`/boarding/${editId}`, formData, { headers });
      } else {
        await api.post('/boarding', formData, { headers });
      }
      
      Alert.alert('Success', 'Successfully booked');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to save boarding record');
    } finally { 
      setLoading(false); 
    }
  };

  if (fetching) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.title}>{editId ? 'Edit Boarding' : 'New Boarding'}</Text>
            <Text style={styles.subtitle}>Enter the pet and stay details below</Text>
          </View>

          <View style={styles.form}>
            {isOwner ? (
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Select Pet *</Text>
                {petsLoading ? (
                  <ActivityIndicator size="small" color={COLORS.primary} style={{ alignSelf: 'flex-start' }} />
                ) : pets.length > 0 ? (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.petSelector}>
                    {pets.map(pet => (
                      <TouchableOpacity 
                        key={pet._id} 
                        style={[styles.petOption, petName === pet.name && styles.petOptionSelected]}
                        onPress={() => handlePetSelect(pet)}
                      >
                        <Ionicons 
                          name="paw" 
                          size={16} 
                          color={petName === pet.name ? COLORS.white : COLORS.primary} 
                          style={{ marginRight: 6 }}
                        />
                        <Text style={[styles.petOptionText, petName === pet.name && styles.petOptionTextSelected]}>
                          {pet.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                ) : (
                  <TouchableOpacity 
                    style={styles.noPetWarning}
                    onPress={() => navigation.navigate('PetForm')}
                  >
                    <Ionicons name="alert-circle" size={20} color={COLORS.error} />
                    <Text style={styles.noPetText}>No pets found. <Text style={styles.linkText}>Register one now First.</Text></Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <CustomInput 
                label="Pet Name *" 
                value={petName} 
                onChangeText={setPetName} 
                placeholder="e.g. Buddy" 
                icon="paw-outline"
              />
            )}

            <CustomInput 
              label="Owner Name" 
              value={ownerName} 
              onChangeText={setOwnerName} 
              placeholder="e.g. John Smith" 
              icon="person-outline"
            />

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: SPACING.sm }}>
                <CustomInput 
                  label="Pet Age (years)" 
                  value={petAge} 
                  onChangeText={(t) => setPetAge(t.replace(/[^0-9.]/g, ''))}
                  placeholder="e.g. 3" 
                  icon="hourglass-outline"
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flex: 1, marginLeft: SPACING.sm }}>
                <CustomInput 
                  label="Breed" 
                  value={breed} 
                  onChangeText={setBreed} 
                  placeholder="e.g. Labrador" 
                  icon="git-branch-outline"
                />
              </View>
            </View>

            <CustomInput 
              label="Contact Phone Number *" 
              value={phone} 
              onChangeText={(text) => setPhone(text.replace(/[^0-9]/g, ''))}
              placeholder="e.g. 0771234567" 
              icon="call-outline"
              keyboardType="phone-pad"
              maxLength={10}
            />
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Select Cage (Size/Type)</Text>
              <TouchableOpacity 
                style={styles.pickerTrigger}
                onPress={() => setShowCagePicker(true)}
              >
                <View style={styles.pickerContent}>
                  <Ionicons name="cube-outline" size={20} color={COLORS.textLight} style={{ marginRight: 10 }} />
                  <Text style={[styles.pickerValue, !selectedCageId && { color: COLORS.textLight + '80' }]}>
                    {selectedCageId 
                      ? `${cages.find(c => c._id === selectedCageId)?.cageNumber} (${cages.find(c => c._id === selectedCageId)?.size} - ${cages.find(c => c._id === selectedCageId)?.type})`
                      : 'Choose a cage...'}
                  </Text>
                </View>
                <Ionicons name="chevron-down" size={20} color={COLORS.textLight} />
              </TouchableOpacity>
            </View>

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: SPACING.sm }}>
                <Text style={styles.label}>Check-in *</Text>
                {Platform.OS === 'web' ? (
                  React.createElement('input', {
                    type: 'date',
                    value: checkInDate.toISOString().split('T')[0],
                    min: new Date().toISOString().split('T')[0],
                    onChange: (e) => {
                      if (e.target.value) {
                        const [year, month, day] = e.target.value.split('-');
                        setCheckInDate(new Date(year, month - 1, day));
                      }
                    },
                    style: {
                      padding: '12px 16px',
                      borderRadius: 12,
                      border: '1px solid #E2E8F0',
                      backgroundColor: '#FFFFFF',
                      fontSize: 16,
                      color: '#1E293B',
                      fontFamily: 'inherit',
                      width: '100%',
                      boxSizing: 'border-box',
                      outline: 'none',
                    }
                  })
                ) : (
                  <TouchableOpacity 
                    style={styles.datePickerTrigger}
                    onPress={() => setShowInPicker(true)}
                  >
                    <Ionicons name="calendar-outline" size={20} color={COLORS.textLight} style={{ marginRight: 10 }} />
                    <Text style={styles.dateText}>{checkInDate.toLocaleDateString()}</Text>
                  </TouchableOpacity>
                )}
              </View>
              <View style={{ flex: 1, marginLeft: SPACING.sm }}>
                <Text style={styles.label}>Check-out *</Text>
                {Platform.OS === 'web' ? (
                  React.createElement('input', {
                    type: 'date',
                    value: checkOutDate.toISOString().split('T')[0],
                    min: new Date(checkInDate.getTime() + 86400000).toISOString().split('T')[0],
                    onChange: (e) => {
                      if (e.target.value) {
                        const [year, month, day] = e.target.value.split('-');
                        setCheckOutDate(new Date(year, month - 1, day));
                      }
                    },
                    style: {
                      padding: '12px 16px',
                      borderRadius: 12,
                      border: '1px solid #E2E8F0',
                      backgroundColor: '#FFFFFF',
                      fontSize: 16,
                      color: '#1E293B',
                      fontFamily: 'inherit',
                      width: '100%',
                      boxSizing: 'border-box',
                      outline: 'none',
                    }
                  })
                ) : (
                  <TouchableOpacity 
                    style={styles.datePickerTrigger}
                    onPress={() => setShowOutPicker(true)}
                  >
                    <Ionicons name="exit-outline" size={20} color={COLORS.textLight} style={{ marginRight: 10 }} />
                    <Text style={styles.dateText}>{checkOutDate.toLocaleDateString()}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {Platform.OS !== 'web' && showInPicker && (
              <DateTimePicker
                value={checkInDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, date) => {
                  setShowInPicker(false);
                  if (date) setCheckInDate(date);
                }}
                minimumDate={new Date()}
              />
            )}

            {Platform.OS !== 'web' && showOutPicker && (
              <DateTimePicker
                value={checkOutDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, date) => {
                  setShowOutPicker(false);
                  if (date) setCheckOutDate(date);
                }}
                minimumDate={new Date(checkInDate.getTime() + 86400000)}
              />
            )}

            <CustomInput 
              label="Special Instructions" 
              value={specialInstructions} 
              onChangeText={setSpecialInstructions} 
              placeholder="Any special needs or care..." 
              multiline 
              numberOfLines={3}
              icon="alert-circle-outline"
            />

            <CustomInput 
              label="General Notes" 
              value={notes} 
              onChangeText={setNotes} 
              placeholder="Additional information..." 
              multiline 
              numberOfLines={3}
              icon="document-text-outline"
            />

            <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
              {image ? (
                <View style={styles.imagePreviewContainer}>
                  <Image source={{ uri: image.uri }} style={styles.imagePreview} />
                  <View style={styles.imageBadge}>
                    <Ionicons name="camera" size={16} color={COLORS.white} />
                    <Text style={styles.imageBadgeText}>Change Image</Text>
                  </View>
                </View>
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Ionicons name="camera-outline" size={40} color={COLORS.textLight} />
                  <Text style={styles.imagePlaceholderText}>Add Pet Photo</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.submitBtn} 
              onPress={handleSubmit} 
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color={COLORS.white} style={{ marginRight: 8 }} />
                  <Text style={styles.submitBtnText}>{editId ? 'Update Record' : 'Book'}</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.cancelBtn} 
              onPress={() => navigation.goBack()}
              activeOpacity={0.6}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={showCagePicker} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select a Cage</Text>
            <ScrollView>
              {cages.map((cage) => (
                <TouchableOpacity 
                  key={cage._id}
                  style={styles.optionItem}
                  onPress={() => {
                    setSelectedCageId(cage._id);
                    setShowCagePicker(false);
                  }}
                >
                  <View>
                    <Text style={[styles.optionText, selectedCageId === cage._id && styles.optionTextActive]}>
                      Cage {cage.cageNumber}
                    </Text>
                    <Text style={styles.optionSubtext}>{cage.size} | {cage.type}</Text>
                  </View>
                  {selectedCageId === cage._id && <Ionicons name="checkmark" size={20} color={COLORS.primary} />}
                </TouchableOpacity>
              ))}
              <TouchableOpacity 
                style={styles.closeBtn}
                onPress={() => setShowCagePicker(false)}
              >
                <Text style={styles.closeBtnText}>Cancel</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const CustomInput = ({ label, icon, multiline, ...props }) => (
  <View style={styles.inputContainer}>
    <Text style={styles.label}>{label}</Text>
    <View style={[styles.inputWrapper, multiline && styles.textAreaWrapper]}>
      <Ionicons name={icon} size={20} color={COLORS.textLight} style={styles.inputIcon} />
      <TextInput 
        style={[styles.input, multiline && styles.textArea]} 
        placeholderTextColor={COLORS.textLight + '80'}
        multiline={multiline}
        {...props} 
      />
    </View>
  </View>
);

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
  scrollContent: {
    padding: SPACING.lg,
  },
  header: {
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: FONTS.bold,
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textLight,
    marginTop: 4,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: 14,
    fontWeight: FONTS.semiBold,
    color: COLORS.text,
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    ...SHADOWS.sm,
  },
  textAreaWrapper: {
    alignItems: 'flex-start',
    paddingTop: SPACING.sm,
  },
  inputIcon: {
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.text,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  datePickerTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    ...SHADOWS.sm,
  },
  dateText: {
    fontSize: 16,
    color: COLORS.text,
  },
  imagePicker: {
    marginTop: SPACING.md,
    marginBottom: SPACING.xl,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    height: 180,
    overflow: 'hidden',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    marginTop: 8,
    color: COLORS.textLight,
    fontSize: 14,
  },
  imagePreviewContainer: {
    flex: 1,
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  imageBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  imageBadgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: FONTS.semiBold,
    marginLeft: 6,
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.md,
    ...SHADOWS.md,
  },
  submitBtnText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: FONTS.bold,
  },
  cancelBtn: {
    padding: 16,
    alignItems: 'center',
    marginTop: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  cancelBtnText: {
    color: COLORS.textLight,
    fontSize: 16,
    fontWeight: FONTS.semiBold,
  },
  pickerTrigger: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    ...SHADOWS.sm,
  },
  pickerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pickerValue: {
    fontSize: 16,
    color: COLORS.text,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: SPACING.xl,
    maxHeight: '60%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: FONTS.bold,
    color: COLORS.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  optionText: {
    fontSize: 16,
    color: COLORS.text,
  },
  optionTextActive: {
    color: COLORS.primary,
    fontWeight: FONTS.bold,
  },
  optionSubtext: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  closeBtn: {
    marginTop: 20,
    padding: 15,
    alignItems: 'center',
  },
  closeBtnText: {
    color: COLORS.error,
    fontWeight: FONTS.bold,
  },
  petSelector: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  petOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  petOptionSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  petOptionText: {
    fontSize: 14,
    fontWeight: FONTS.semiBold,
    color: COLORS.text,
  },
  petOptionTextSelected: {
    color: COLORS.white,
  },
  noPetWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.error + '10',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.error + '30',
  },
  noPetText: {
    marginLeft: 8,
    fontSize: 13,
    color: COLORS.text,
  },
  linkText: {
    color: COLORS.primary,
    fontWeight: FONTS.bold,
  }
});
