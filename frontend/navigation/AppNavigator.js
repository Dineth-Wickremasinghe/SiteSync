import React, { useState } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import LoginScreen from '../screens/auth/LoginScreen'
import RegisterScreen from '../screens/auth/RegisterScreen'
import WorkerListScreen from '../screens/workers/WorkerListScreen'
import WorkerFormScreen from '../screens/workers/WorkerFormScreen'
import EquipmentListScreen from '../screens/equipment/EquipmentListScreen'
import EquipmentFormScreen from '../screens/equipment/EquipmentFormScreen'
import ProjectListScreen from '../screens/projects/ProjectListScreen'
import ProjectFormScreen from '../screens/projects/ProjectFormScreen'
import ProjectDetailScreen from '../screens/projects/ProjectDetailScreen'
import NoticeListScreen from '../screens/notices/NoticeListScreen'
import NoticeFormScreen from '../screens/notices/NoticeFormScreen'
import ReportListScreen from '../screens/reports/ReportListScreen'
import ReportFormScreen from '../screens/reports/ReportFormScreen'
import IncidentListScreen from '../screens/incidents/IncidentListScreen'
import IncidentFormScreen from '../screens/incidents/IncidentFormScreen'
import ProfileScreen from '../screens/ProfileScreen'
import { colors } from '../theme'
import { Text } from 'react-native'

const Stack = createNativeStackNavigator()
const Tab   = createBottomTabNavigator()

const stackScreenOptions = {
  headerStyle:            { backgroundColor: colors.background },
  headerTintColor:        colors.primary,
  headerTitleStyle:       { fontWeight: '700', fontSize: 17, color: colors.textDark },
  headerBackTitleVisible: false,
  contentStyle:           { backgroundColor: colors.background },
}

const tabBarOptions = {
  headerShown:             false,
  tabBarStyle:             {  marginBottom: 3,backgroundColor: colors.card, borderTopColor: colors.primary, borderTopWidth: 2 },
  tabBarActiveTintColor:   colors.primary,
  tabBarInactiveTintColor: colors.textMuted,
  tabBarLabelStyle:        { fontSize: 11, fontWeight: '600' },
  tabBarShowLabel: false,
}

function WorkersStack({ token }) {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="WorkerListScreen" options={{ headerShown: false }}>
        {props => <WorkerListScreen {...props} token={token} />}
      </Stack.Screen>
      <Stack.Screen name="WorkerFormScreen" options={{ title: 'Worker Details' }}>
        {props => <WorkerFormScreen {...props} token={token} />}
      </Stack.Screen>
    </Stack.Navigator>
  )
}

function ProjectsStack({ token }) {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="ProjectList" options={{ headerShown: false }}>
        {props => <ProjectListScreen {...props} token={token} />}
      </Stack.Screen>
      <Stack.Screen
        name="ProjectForm"
        options={({ route }) => ({ title: route.params?.project ? 'Edit Project' : 'New Project' })}
      >
        {props => <ProjectFormScreen {...props} token={token} />}
      </Stack.Screen>
      <Stack.Screen name="ProjectDetail" options={{ title: 'Project Details' }}>
        {props => <ProjectDetailScreen {...props} token={token} />}
      </Stack.Screen>
    </Stack.Navigator>
  )
}

function EquipmentStack({ token }) {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="EquipmentListScreen" options={{ headerShown: false }}>
        {props => <EquipmentListScreen {...props} token={token} />}
      </Stack.Screen>
      <Stack.Screen name="EquipmentFormScreen" options={{ title: 'Equipment Details' }}>
        {props => <EquipmentFormScreen {...props} token={token} />}
      </Stack.Screen>
    </Stack.Navigator>
  )
}

function ReportsStack({ token }) {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="ReportListScreen" options={{ headerShown: false }}>
        {props => <ReportListScreen {...props} token={token} />}
      </Stack.Screen>
      <Stack.Screen name="ReportFormScreen" options={{ title: 'Report Details' }}>
        {props => <ReportFormScreen {...props} token={token} />}
      </Stack.Screen>
    </Stack.Navigator>
  )
}

function IncidentsStack({ token }) {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="IncidentListScreen" options={{ headerShown: false }}>
        {props => <IncidentListScreen {...props} token={token} />}
      </Stack.Screen>
      <Stack.Screen name="IncidentFormScreen" options={{ title: 'Incident Details' }}>
        {props => <IncidentFormScreen {...props} token={token} />}
      </Stack.Screen>
    </Stack.Navigator>
  )
}

function NoticesStack({ token }) {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="NoticeListScreen" options={{ headerShown: false }}>
        {props => <NoticeListScreen {...props} token={token} />}
      </Stack.Screen>
      <Stack.Screen name="NoticeFormScreen" options={{ title: 'Notice Details' }}>
        {props => <NoticeFormScreen {...props} token={token} />}
      </Stack.Screen>
    </Stack.Navigator>
  )
}

function ProfileStack({ token, setToken }) {
  


  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="ProfileScreen" options={{ headerShown: false }}>
        {props => <ProfileScreen {...props} token={token} setToken={setToken} />}
      </Stack.Screen>
    </Stack.Navigator>
  )
}

// ── Worker tab navigator — Reports, Incidents, Notices, Profile only ──────────
function WorkerTabs({ token, setToken }) {
  return (
    <Tab.Navigator 
    screenOptions={({ route }) => ({
        ...tabBarOptions,
        tabBarIcon: ({ color }) => {
          let emoji = '❓'

          if (route.name === 'Reports') emoji = '📊'
          else if (route.name === 'Incidents') emoji = '⚠️'
          else if (route.name === 'Notices') emoji = '📢'
          else if (route.name === 'Profile') emoji = '👤'

          return <Text style={{ fontSize: 18 }}>{emoji}</Text>
        }
      })}
    >
      <Tab.Screen name="Reports"   children={() => <ReportsStack   token={token} />} />
      <Tab.Screen name="Incidents" children={() => <IncidentsStack token={token} />} />
      <Tab.Screen name="Notices"   children={() => <NoticesStack   token={token} />} />
      <Tab.Screen name="Profile"   children={() => <ProfileStack   token={token} setToken={setToken} />} />
    </Tab.Navigator>
  )
}

// ── Admin/Supervisor tab navigator — all screens ──────────────────────────────
function AdminTabs({ token, setToken }) {
  return (
    <Tab.Navigator 
     screenOptions={({ route }) => ({
        ...tabBarOptions,
        tabBarIcon: ({ color }) => {
          let emoji = '❓'

          if (route.name === 'Workers') emoji = '👷'
          else if (route.name === 'Projects') emoji = '📁'
          else if (route.name === 'Equipment') emoji = '🛠️'
          else if (route.name === 'Reports') emoji = '📊'
          else if (route.name === 'Incidents') emoji = '⚠️'
          else if (route.name === 'Notices') emoji = '📢'
          else if (route.name === 'Profile') emoji = '👤'

          return <Text style={{ fontSize: 18 }}>{emoji}</Text>
        }
      })}
    >
      <Tab.Screen name="Workers"   children={() => <WorkersStack   token={token} />} />
      <Tab.Screen name="Projects"  children={() => <ProjectsStack  token={token} />} />
      <Tab.Screen name="Equipment" children={() => <EquipmentStack token={token} />} />
      <Tab.Screen name="Reports"   children={() => <ReportsStack   token={token} />} />
      <Tab.Screen name="Incidents" children={() => <IncidentsStack token={token} />} />
      <Tab.Screen name="Notices"   children={() => <NoticesStack   token={token} />} />
      <Tab.Screen name="Profile"   children={() => <ProfileStack   token={token} setToken={setToken} />} />
    </Tab.Navigator>
  )
}

export default function AppNavigator() {
  const [token, setToken] = useState(null)
  const [role,  setRole]  = useState(null)

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!token ? (
          <>
            <Stack.Screen name="Login">
              {props => <LoginScreen {...props} setToken={setToken} setRole={setRole} />}
            </Stack.Screen>
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : role === 'worker' ? (
          <Stack.Screen name="App">
            {() => <WorkerTabs token={token} setToken={setToken} />}
          </Stack.Screen>
        ) : (
          <Stack.Screen name="App">
            {() => <AdminTabs token={token} setToken={setToken} />}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}