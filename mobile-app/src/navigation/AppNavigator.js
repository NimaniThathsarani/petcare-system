import React, { useContext } from 'react';
import { View, Alert, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import { COLORS, FONTS } from '../theme/theme';

// Auth & Common
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import StaffLoginScreen from '../screens/auth/StaffLoginScreen';
import DashboardScreen from '../screens/common/DashboardScreen';
import ProfileScreen from '../screens/common/ProfileScreen';
import PetFormScreen from '../screens/common/PetFormScreen';
import CompletedVisitsScreen from '../screens/common/CompletedVisitsScreen';
import NotificationsScreen from '../screens/common/NotificationsScreen';

// Guest
import HomeScreen from '../screens/guest/HomeScreen';
import ServicesScreen from '../screens/guest/ServicesScreen';
import AboutScreen from '../screens/guest/AboutScreen';

// Modules
import AppointmentListScreen from '../screens/appointments/AppointmentListScreen';
import AppointmentFormScreen from '../screens/appointments/AppointmentFormScreen';
import AppointmentDetailScreen from '../screens/appointments/AppointmentDetailScreen';
import AvailableSlotsScreen from '../screens/appointments/AvailableSlotsScreen';
import VaccinationListScreen from '../screens/vaccinations/VaccinationListScreen';
import VaccinationFormScreen from '../screens/vaccinations/VaccinationFormScreen';
import VaccinationDetailScreen from '../screens/vaccinations/VaccinationDetailScreen';
import MedicationListScreen from '../screens/medications/MedicationListScreen';
import MedicationFormScreen from '../screens/medications/MedicationFormScreen';
import MedicationDetailScreen from '../screens/medications/MedicationDetailScreen';
import GroomingListScreen from '../screens/grooming/GroomingListScreen';
import GroomingFormScreen from '../screens/grooming/GroomingFormScreen';
import GroomingDetailScreen from '../screens/grooming/GroomingDetailScreen';
import DietListScreen from '../screens/diet/DietListScreen';
import DietFormScreen from '../screens/diet/DietFormScreen';
import DietDetailScreen from '../screens/diet/DietDetailScreen';
import BoardingListScreen from '../screens/boarding/BoardingListScreen';
import BoardingFormScreen from '../screens/boarding/BoardingFormScreen';
import BoardingDetailScreen from '../screens/boarding/BoardingDetailScreen';
import BoardingDashboardScreen from '../screens/boarding/BoardingDashboardScreen';
import CageManagementScreen from '../screens/boarding/CageManagementScreen';
import GroomingServiceManagementScreen from '../screens/grooming/GroomingServiceManagementScreen';
import VaccinePrescriptionListScreen from '../screens/vaccinations/VaccinePrescriptionListScreen';
import VaccinePrescriptionFormScreen from '../screens/medications/VaccinePrescriptionFormScreen';
import DoctorSessionsScreen from '../screens/doctor/DoctorSessionsScreen';
import SessionFormScreen from '../screens/doctor/SessionFormScreen';
import ManageSessionsScreen from '../screens/appointments/ManageSessionsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// --- Module Stacks ---
const AppointmentStack = () => (
  <Stack.Navigator screenOptions={navigatorStyles}>
    <Stack.Screen name="AppointmentList" component={AppointmentListScreen} options={{ title: 'Appointments' }} />
    <Stack.Screen name="AppointmentForm" component={AppointmentFormScreen} options={{ title: 'New Appointment' }} />
    <Stack.Screen name="AppointmentDetail" component={AppointmentDetailScreen} options={{ title: 'Details' }} />
    <Stack.Screen name="AvailableSlots" component={AvailableSlotsScreen} options={{ title: 'Available Slots' }} />
    <Stack.Screen name="MedicationForm" component={MedicationFormScreen} options={{ title: 'New Medication' }} />
    <Stack.Screen name="VaccinationForm" component={VaccinationFormScreen} options={{ title: 'New Vaccination' }} />
    <Stack.Screen name="DietForm" component={DietFormScreen} options={{ title: 'New Diet' }} />
    <Stack.Screen name="VaccinePrescriptionForm" component={VaccinePrescriptionFormScreen} options={{ title: 'Prescribe Vaccine' }} />
  </Stack.Navigator>
);

const VaccinationStack = () => (
  <Stack.Navigator screenOptions={navigatorStyles}>
    <Stack.Screen name="VaccinationList" component={VaccinationListScreen} options={{ title: 'Vaccinations' }} />
    <Stack.Screen name="VaccinationForm" component={VaccinationFormScreen} options={{ title: 'New Vaccination' }} />
    <Stack.Screen name="VaccinationDetail" component={VaccinationDetailScreen} options={{ title: 'Details' }} />
  </Stack.Navigator>
);

const MedicationStack = () => (
  <Stack.Navigator screenOptions={navigatorStyles}>
    <Stack.Screen name="MedicationList" component={MedicationListScreen} options={{ title: 'Medications' }} />
    <Stack.Screen name="MedicationForm" component={MedicationFormScreen} options={{ title: 'New Medication' }} />
    <Stack.Screen name="MedicationDetail" component={MedicationDetailScreen} options={{ title: 'Details' }} />
  </Stack.Navigator>
);

const GroomingStack = () => (
  <Stack.Navigator screenOptions={navigatorStyles}>
    <Stack.Screen name="GroomingList" component={GroomingListScreen} options={{ title: 'Grooming' }} />
    <Stack.Screen name="GroomingForm" component={GroomingFormScreen} options={{ title: 'New Grooming' }} />
    <Stack.Screen name="GroomingDetail" component={GroomingDetailScreen} options={{ title: 'Details' }} />
    <Stack.Screen name="GroomingServiceManagement" component={GroomingServiceManagementScreen} options={{ title: 'Manage Services' }} />
  </Stack.Navigator>
);

const DietStack = () => (
  <Stack.Navigator screenOptions={navigatorStyles}>
    <Stack.Screen name="DietList" component={DietListScreen} options={{ title: 'Diet Plans' }} />
    <Stack.Screen name="DietForm" component={DietFormScreen} options={{ title: 'New Diet' }} />
    <Stack.Screen name="DietDetail" component={DietDetailScreen} options={{ title: 'Details' }} />
  </Stack.Navigator>
);

const BoardingStack = () => (
  <Stack.Navigator screenOptions={navigatorStyles}>
    <Stack.Screen name="BoardingList" component={BoardingListScreen} options={{ title: 'Boarding' }} />
    <Stack.Screen name="BoardingForm" component={BoardingFormScreen} options={{ title: 'New Boarding' }} />
    <Stack.Screen name="BoardingDetail" component={BoardingDetailScreen} options={{ title: 'Details' }} />
  </Stack.Navigator>
);

const BoardingManagerTabs = () => {
  const { logout } = useContext(AuthContext);
  return (
    <Tab.Navigator screenOptions={tabOptions({
      Dashboard: 'grid',
      Requests: 'mail-unread',
      Cages: 'cube',
    })}>
      <Tab.Screen name="Dashboard" component={BoardingDashboardScreen} />
      <Tab.Screen name="Requests" component={BoardingListScreen} initialParams={{ managerView: true }} />
      <Tab.Screen name="Cages" component={CageManagementScreen} />
    </Tab.Navigator>
  );
};

const DashboardStack = () => (
  <Stack.Navigator screenOptions={navigatorStyles}>
    <Stack.Screen name="DashboardMain" component={DashboardScreen} options={{ title: 'Dashboard' }} />
    <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'User Profile' }} />
    <Stack.Screen name="PetForm" component={PetFormScreen} options={{ title: 'Register Pet' }} />
    <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Notifications' }} />
  </Stack.Navigator>
);

// --- Shared Styles ---
const navigatorStyles = {
  headerStyle: { backgroundColor: COLORS.surface },
  headerTintColor: COLORS.text,
  headerTitleStyle: { fontWeight: FONTS.bold },
};

const tabOptions = (iconMapping) => ({ route }) => ({
  headerShown: false,
  tabBarIcon: ({ focused, color, size }) => {
    const baseIcon = iconMapping[route.name] || 'help-circle';
    const iconName = baseIcon + (focused ? '' : '-outline');
    return <Ionicons name={iconName} size={size} color={color} />;
  },
  tabBarActiveTintColor: COLORS.primary,
  tabBarInactiveTintColor: COLORS.textLight,
  tabBarStyle: {
    backgroundColor: COLORS.surface,
    borderTopColor: COLORS.border,
    height: 60,
    paddingBottom: 8,
    paddingTop: 8,
  },
  tabBarLabelStyle: { fontSize: 12, fontWeight: FONTS.medium },
});

// --- Role-Based Navigators ---

const GuestTabs = () => (
  <Tab.Navigator screenOptions={tabOptions({
    Home: 'home',
    Services: 'apps',
    About: 'information-circle',
    Login: 'log-in',
    StaffLogin: 'briefcase'
  })}>
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Services" component={ServicesScreen} />
    <Tab.Screen name="About" component={AboutScreen} />
    <Tab.Screen name="Login" component={LoginScreen} />
    <Tab.Screen name="StaffLogin" component={StaffLoginScreen} options={{ title: 'Staff Portal', tabBarLabel: 'Staff' }} />
  </Tab.Navigator>
);

const OwnerTabs = () => (
  <Tab.Navigator screenOptions={tabOptions({
    Dashboard: 'grid',
    Appointments: 'calendar',
    Grooming: 'cut',
    Boarding: 'bed'
  })}>
    <Tab.Screen name="Dashboard" component={DashboardStack} />
    <Tab.Screen name="Appointments" component={AppointmentStack} />
    <Tab.Screen name="Grooming" component={GroomingStack} />
    <Tab.Screen name="Boarding" component={BoardingStack} />
  </Tab.Navigator>
);


// Specialized Manager Stacks (Standardized for efficiency)
const ManagerTabs = ({ role, moduleStack, moduleName, icon }) => (
  <Tab.Navigator screenOptions={tabOptions({
    Dashboard: 'grid',
    [moduleName]: icon
  })}>
    <Tab.Screen name="Dashboard" component={DashboardStack} />
    <Tab.Screen name={moduleName} component={moduleStack} />
  </Tab.Navigator>
);

const AdminTabs = () => (
  <Tab.Navigator screenOptions={tabOptions({
    Dashboard: 'grid',
    Users: 'people',
    Staff: 'briefcase',
    Reports: 'bar-chart'
  })}>
    <Tab.Screen name="Dashboard" component={DashboardStack} />
    {/* Admin Specific screens would go here */}
  </Tab.Navigator>
);

// --- Root Navigator ---
// --- Role-Based Tab Switcher ---
const RoleTabs = ({ user }) => {
  switch (user?.role) {
    case 'owner':              return <OwnerTabs />;
    case 'vet_manager':        
      return (
        <Tab.Navigator screenOptions={tabOptions({ Dashboard: 'grid' })}>
          <Tab.Screen name="Dashboard">
            {() => (
              <Stack.Navigator screenOptions={navigatorStyles}>
                <Stack.Screen name="DashboardMain" component={DashboardScreen} options={{ title: 'Dashboard' }} />
                <Stack.Screen name="Appointments" component={AppointmentListScreen} options={{ title: 'Schedule' }} />
                <Stack.Screen name="AppointmentForm" component={AppointmentFormScreen} options={{ title: 'Manage Slot' }} />
                <Stack.Screen name="AppointmentDetail" component={AppointmentDetailScreen} options={{ title: 'Details' }} />
                <Stack.Screen name="MedicationForm" component={MedicationFormScreen} options={{ title: 'New Medication' }} />
                <Stack.Screen name="VaccinationForm" component={VaccinationFormScreen} options={{ title: 'New Vaccination' }} />
                <Stack.Screen name="VaccinePrescriptionForm" component={VaccinePrescriptionFormScreen} options={{ title: 'New Prescription' }} />
                <Stack.Screen name="DietForm" component={DietFormScreen} options={{ title: 'New Diet' }} />
                <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Notifications' }} />
                <Stack.Screen name="ManageSessions" component={ManageSessionsScreen} options={{ title: 'Doctor Sessions' }} />
              </Stack.Navigator>
            )}
          </Tab.Screen>
        </Tab.Navigator>
      );
    case 'vaccine_manager':    
      return (
        <Tab.Navigator screenOptions={tabOptions({ Dashboard: 'grid' })}>
          <Tab.Screen name="Dashboard">
            {() => (
              <Stack.Navigator screenOptions={navigatorStyles}>
                <Stack.Screen name="DashboardMain" component={DashboardScreen} options={{ title: 'Dashboard' }} />
                <Stack.Screen name="Vaccinations" component={VaccinationListScreen} options={{ title: 'Vaccine Records' }} />
                <Stack.Screen name="CompletedVisits" component={CompletedVisitsScreen} options={{ title: 'Select Visit' }} />
                <Stack.Screen name="VaccineRequests" component={VaccinePrescriptionListScreen} options={{ title: 'Vaccine Rx' }} />
                <Stack.Screen name="VaccinePrescriptionForm" component={VaccinePrescriptionFormScreen} options={{ title: 'Edit Prescription' }} />
                <Stack.Screen name="Appointments" component={AppointmentListScreen} options={{ title: 'Schedule' }} />
                <Stack.Screen name="VaccinationDetail" component={VaccinationDetailScreen} options={{ title: 'Details' }} />
              </Stack.Navigator>
            )}
          </Tab.Screen>
        </Tab.Navigator>
      );
    case 'grooming_manager':   
      return (
        <Tab.Navigator screenOptions={tabOptions({ Dashboard: 'grid' })}>
          <Tab.Screen name="Dashboard">
            {() => (
              <Stack.Navigator screenOptions={navigatorStyles}>
                <Stack.Screen name="DashboardMain" component={DashboardScreen} options={{ title: 'Dashboard' }} />
                <Stack.Screen name="Grooming" component={GroomingListScreen} options={{ title: 'Grooming Bookings' }} />
                <Stack.Screen name="GroomingDetail" component={GroomingDetailScreen} options={{ title: 'Details' }} />
                <Stack.Screen name="GroomingServiceManagement" component={GroomingServiceManagementScreen} options={{ title: 'Services' }} />
              </Stack.Navigator>
            )}
          </Tab.Screen>
        </Tab.Navigator>
      );
    case 'boarding_manager':   
      return (
        <Tab.Navigator screenOptions={tabOptions({ Dashboard: 'grid' })}>
          <Tab.Screen name="Dashboard">
            {() => (
              <Stack.Navigator screenOptions={navigatorStyles}>
                <Stack.Screen name="DashboardMain" component={DashboardScreen} options={{ title: 'Dashboard' }} />
                <Stack.Screen name="Boarding" component={BoardingDashboardScreen} options={{ title: 'Boarding Stays' }} />
                <Stack.Screen name="BoardingDetail" component={BoardingDetailScreen} options={{ title: 'Stay Details' }} />
                <Stack.Screen name="Cages" component={CageManagementScreen} options={{ title: 'Cage Layout' }} />
              </Stack.Navigator>
            )}
          </Tab.Screen>
        </Tab.Navigator>
      );
    case 'doctor':
      return (
        <Tab.Navigator screenOptions={tabOptions({ Dashboard: 'grid', Sessions: 'calendar', Medications: 'medkit', Diet: 'restaurant' })}>
          <Tab.Screen name="Dashboard">
            {() => (
              <Stack.Navigator screenOptions={navigatorStyles}>
                <Stack.Screen name="DashboardMain" component={DashboardScreen} options={{ title: 'Dashboard' }} />
                <Stack.Screen name="DoctorSessions" component={DoctorSessionsScreen} options={{ title: 'My Sessions' }} />
                <Stack.Screen name="SessionForm" component={SessionFormScreen} options={{ title: 'Reschedule' }} />
                <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'User Profile' }} />
                <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Notifications' }} />
                <Stack.Screen name="Appointments" component={AppointmentListScreen} options={{ title: 'Clinical Schedule' }} />
                <Stack.Screen name="AppointmentDetail" component={AppointmentDetailScreen} options={{ title: 'Patient Visit' }} />
                <Stack.Screen name="MedicationForm" component={MedicationFormScreen} options={{ title: 'Prescribe' }} />
                <Stack.Screen name="VaccinePrescriptionForm" component={VaccinePrescriptionFormScreen} options={{ title: 'Prescribe Vaccine' }} />
                <Stack.Screen name="DietForm" component={DietFormScreen} options={{ title: 'Dietary Plan' }} />
              </Stack.Navigator>
            )}
          </Tab.Screen>
          <Tab.Screen name="Medications" component={MedicationStack} />
          <Tab.Screen name="Diet" component={DietStack} />
        </Tab.Navigator>
      );
    case 'admin':              return <AdminTabs />;
    default:                   return <OwnerTabs />;
  }
};

// --- Root Navigator ---
const AppNavigator = () => {
  const { user, loading } = useContext(AuthContext);
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <>
            <Stack.Screen name="Guest" component={GuestTabs} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          <Stack.Screen name="Main">
            {props => <RoleTabs {...props} user={user} />}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;