import React, { useState } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Ionicons } from '@expo/vector-icons'
import LoginScreen from '../screens/auth/LoginScreen'
import RegisterScreen from '../screens/auth/RegisterScreen'
import WorkerListScreen from '../screens/workers/WorkerListScreen'
import WorkerFormScreen from '../screens/workers/WorkerFormScreen'
import WorkerDetailScreen from '../screens/workers/WorkerDetailScreen'
import EquipmentListScreen from '../screens/equipment/EquipmentListScreen'
import EquipmentFormScreen from '../screens/equipment/EquipmentFormScreen'
import ProjectListScreen from '../screens/projects/ProjectListScreen'
import ProjectFormScreen from '../screens/projects/ProjectFormScreen'
import ProjectDetailScreen from '../screens/projects/ProjectDetailScreen'
import NoticeListScreen from '../screens/notices/NoticeListScreen'
import NoticeFormScreen from '../screens/notices/NoticeFormScreen'
import ReportListScreen from '../screens/reports/ReportListScreen'
import ReportFormScreen from '../screens/reports/ReportFormScreen'
import ReportDetailScreen from '../screens/reports/ReportDetailScreen'
import IncidentListScreen from '../screens/incidents/IncidentListScreen'
import IncidentFormScreen from '../screens/incidents/IncidentFormScreen'
import ProfileScreen from '../screens/ProfileScreen'
import { colors } from '../theme'

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
  tabBarStyle: {
    backgroundColor:  colors.card,
    borderTopColor:   colors.primary,
    borderTopWidth:   2,
    paddingBottom:    20,
    paddingTop:       4,
    height:           78,
  },
  tabBarActiveTintColor:   colors.primary,
  tabBarInactiveTintColor: colors.textMuted,
  tabBarLabelStyle:        { fontSize: 10, fontWeight: '600', marginTop: 2 },
  tabBarShowLabel:         true,
}

// Icon map — active icons are filled, inactive are outline
const ICONS = {
  Workers:   { active: 'people',         inactive: 'people-outline' },
  Projects:  { active: 'folder',         inactive: 'folder-outline' },
  Equipment: { active: 'construct',      inactive: 'construct-outline' },
  Reports:   { active: 'bar-chart',      inactive: 'bar-chart-outline' },
  Incidents: { active: 'warning',        inactive: 'warning-outline' },
  Notices:   { active: 'megaphone',      inactive: 'megaphone-outline' },
  Profile:   { active: 'person-circle',  inactive: 'person-circle-outline' },
}

const tabIcon = (routeName) => ({ color, focused }) => {
  const icon = ICONS[routeName]
  return (
    <Ionicons
      name={focused ? icon.active : icon.inactive}
      size={22}
      color={color}
    />
  )
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
      <Stack.Screen name="WorkerDetailScreen" options={{ title: 'Worker Details' }}>
        {props => <WorkerDetailScreen {...props} token={token} />}
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

function ReportsStack({ token, role }) {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="ReportListScreen" options={{ headerShown: false }}>
        {props => <ReportListScreen {...props} token={token} role={role} />}
      </Stack.Screen>
      <Stack.Screen name="ReportDetailScreen" options={{ title: 'Report Details' }}>
        {props => <ReportDetailScreen {...props} token={token} role={role} />}
      </Stack.Screen>
      <Stack.Screen name="ReportFormScreen" options={{ title: 'Report Details' }}>
        {props => <ReportFormScreen {...props} token={token} role={role} />}
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

function WorkerTabs({ token, role, setToken }) {
  return (
    <Tab.Navigator screenOptions={({ route }) => ({
      ...tabBarOptions,
      tabBarIcon: tabIcon(route.name),
    })}>
      <Tab.Screen name="Reports"   children={() => <ReportsStack   token={token} role={role} />} />
      <Tab.Screen name="Incidents" children={() => <IncidentsStack token={token} />} />
      <Tab.Screen name="Notices"   children={() => <NoticesStack   token={token} />} />
      <Tab.Screen name="Profile"   children={() => <ProfileStack   token={token} setToken={setToken} />} />
    </Tab.Navigator>
  )
}

function AdminTabs({ token, role, setToken }) {
  return (
    <Tab.Navigator screenOptions={({ route }) => ({
      ...tabBarOptions,
      tabBarIcon: tabIcon(route.name),
    })}>
      <Tab.Screen name="Workers"   children={() => <WorkersStack   token={token} />} />
      <Tab.Screen name="Projects"  children={() => <ProjectsStack  token={token} />} />
      <Tab.Screen name="Equipment" children={() => <EquipmentStack token={token} />} />
      <Tab.Screen name="Reports"   children={() => <ReportsStack   token={token} role={role} />} />
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
            {() => <WorkerTabs token={token} role={role} setToken={setToken} />}
          </Stack.Screen>
        ) : (
          <Stack.Screen name="App">
            {() => <AdminTabs token={token} role={role} setToken={setToken} />}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}