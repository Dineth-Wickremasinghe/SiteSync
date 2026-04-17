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

const Stack = createNativeStackNavigator()
const Tab   = createBottomTabNavigator()

function WorkersStack({ token }) {
  return (
    <Stack.Navigator>
      <Stack.Screen name="WorkerListScreen">
        {props => <WorkerListScreen {...props} token={token} />}
      </Stack.Screen>
      <Stack.Screen name="WorkerFormScreen">
        {props => <WorkerFormScreen {...props} token={token} />}
      </Stack.Screen>
    </Stack.Navigator>
  )
}

function ProjectsStack({ token }) {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle:          { backgroundColor: '#1B4332' },
        headerTintColor:      '#FFFFFF',
        headerTitleStyle:     { fontWeight: '700', fontSize: 17 },
        headerBackTitleVisible: false,
        contentStyle:         { backgroundColor: '#F4F6F4' },
      }}
    >
      <Stack.Screen
        name="ProjectList"
        options={{ headerShown: false }}
      >
        {props => <ProjectListScreen {...props} token={token} />}
      </Stack.Screen>
      <Stack.Screen
        name="ProjectForm"
        options={({ route }) => ({ title: route.params?.project ? 'Edit Project' : 'New Project' })}
      >
        {props => <ProjectFormScreen {...props} token={token} />}
      </Stack.Screen>
      <Stack.Screen
        name="ProjectDetail"
        options={{ title: 'Project Details' }}
      >
        {props => <ProjectDetailScreen {...props} token={token} />}
      </Stack.Screen>
    </Stack.Navigator>
  )
}

function EquipmentStack({ token }) {
  return (
    <Stack.Navigator>
      <Stack.Screen name="EquipmentListScreen">
        {props => <EquipmentListScreen {...props} token={token} />}
      </Stack.Screen>
      <Stack.Screen name="EquipmentFormScreen">
        {props => <EquipmentFormScreen {...props} token={token} />}
      </Stack.Screen>
    </Stack.Navigator>
  )
}

function ReportsStack({ token }) {
  return (
    <Stack.Navigator>
      <Stack.Screen name="ReportListScreen">
        {props => <ReportListScreen {...props} token={token} />}
      </Stack.Screen>
      <Stack.Screen name="ReportFormScreen">
        {props => <ReportFormScreen {...props} token={token} />}
      </Stack.Screen>
    </Stack.Navigator>
  )
}

function IncidentsStack({ token }) {
  return (
    <Stack.Navigator>
      <Stack.Screen name="IncidentListScreen">
        {props => <IncidentListScreen {...props} token={token} />}
      </Stack.Screen>
      <Stack.Screen name="IncidentFormScreen">
        {props => <IncidentFormScreen {...props} token={token} />}
      </Stack.Screen>
    </Stack.Navigator>
  )
}

function NoticesStack({ token }) {
  return (
    <Stack.Navigator>
      <Stack.Screen name="NoticeListScreen">
        {props => <NoticeListScreen {...props} token={token} />}
      </Stack.Screen>
      <Stack.Screen name="NoticeFormScreen">
        {props => <NoticeFormScreen {...props} token={token} />}
      </Stack.Screen>
    </Stack.Navigator>
  )
}

function ProfileStack({ token, setToken }) {
  return (
    <Stack.Navigator>
      <Stack.Screen name="ProfileScreen">
        {props => <ProfileScreen {...props} token={token} setToken={setToken} />}
      </Stack.Screen>
    </Stack.Navigator>
  )
}

function AppTabs({ token, setToken }) {
  return (
    <Tab.Navigator>
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
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!token ? (
          <>
            <Stack.Screen name="Login">
              {props => <LoginScreen {...props} setToken={setToken} />}
            </Stack.Screen>
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          <Stack.Screen name="App">
            {() => <AppTabs token={token} setToken={setToken} />}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}