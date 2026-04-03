import React, { useContext } from 'react';
import { View, Alert } from 'react-native';
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

// Guest
import HomeScreen from '../screens/guest/HomeScreen';
import ServicesScreen from '../screens/guest/ServicesScreen';
import AboutScreen from '../screens/guest/AboutScreen';

// Modules
import AppointmentListScreen from '../screens/appointments/AppointmentListScreen';
import AppointmentFormScreen from '../screens/appointments/AppointmentFormScreen';
import AppointmentDetailScreen from '../screens/appointments/AppointmentDetailScreen';
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

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// --- Module Stacks ---
const AppointmentStack = () => (
  <Stack.Navigator screenOptions={navigatorStyles}>
    <Stack.Screen name="AppointmentList" component={AppointmentListScreen} options={{ title: 'Appointments' }} />
    <Stack.Screen name="AppointmentForm" component={AppointmentFormScreen} options={{ title: 'New Appointment' }} />
    <Stack.Screen name="AppointmentDetail" component={AppointmentDetailScreen} options={{ title: 'Details' }} />
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
    const iconName = iconMapping[route.name] + (focused ? '' : '-outline');
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
    Login: 'log-in'
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
    Vaccinations: 'shield-checkmark',
    Medications: 'medkit',
    Grooming: 'cut',
    Boarding: 'bed'
  })}>
    <Tab.Screen name="Dashboard" component={DashboardStack} />
    <Tab.Screen name="Appointments" component={AppointmentStack} />
    <Tab.Screen name="Vaccinations" component={VaccinationStack} />
    <Tab.Screen name="Medications" component={MedicationStack} />
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
    case 'vet_manager':        return <ManagerTabs moduleStack={AppointmentStack} moduleName="Appointments" icon="calendar" />;
    case 'vaccine_manager':    return <ManagerTabs moduleStack={VaccinationStack} moduleName="Vaccinations" icon="shield-checkmark" />;
    case 'medication_manager': return <ManagerTabs moduleStack={MedicationStack} moduleName="Medications" icon="medkit" />;
    case 'grooming_manager':   return <ManagerTabs moduleStack={GroomingStack} moduleName="Grooming" icon="cut" />;
    case 'diet_manager':       return <ManagerTabs moduleStack={DietStack} moduleName="Diet" icon="restaurant" />;
    case 'boarding_manager':   return <BoardingManagerTabs />;
    case 'admin':              return <AdminTabs />;
    default:                   return <OwnerTabs />;
  }
};

// --- Root Navigator ---
const AppNavigator = () => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return null;

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