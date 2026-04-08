import React, { useState } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'

import LoginScreen from '../screens/auth/LoginScreen'
import RegisterScreen from '../screens/auth/RegisterScreen'
import WorkerListScreen from '../screens/workers/WorkerListScreen'
import WorkerFormScreen from '../screens/workers/WorkerFormScreen'
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
      <Stack.Screen name="WorkerList">
        {props => <WorkerListScreen {...props} token={token} />}
      </Stack.Screen>
      <Stack.Screen name="WorkerForm">
        {props => <WorkerFormScreen {...props} token={token} />}
      </Stack.Screen>
    </Stack.Navigator>
  )
}

function ReportsStack({ token }) {
  return (
    <Stack.Navigator>
      <Stack.Screen name="ReportList">
        {props => <ReportListScreen {...props} token={token} />}
      </Stack.Screen>
      <Stack.Screen name="ReportForm">
        {props => <ReportFormScreen {...props} token={token} />}
      </Stack.Screen>
    </Stack.Navigator>
  )
}

function IncidentsStack({ token }) {
  return (
    <Stack.Navigator>
      <Stack.Screen name="IncidentList">
        {props => <IncidentListScreen {...props} token={token} />}
      </Stack.Screen>
      <Stack.Screen name="IncidentForm">
        {props => <IncidentFormScreen {...props} token={token} />}
      </Stack.Screen>
    </Stack.Navigator>
  )
}

function ProfileStack({ token, setToken }) {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Profile">
        {props => <ProfileScreen {...props} token={token} setToken={setToken} />}
      </Stack.Screen>
    </Stack.Navigator>
  )
}

function AppTabs({ token, setToken }) {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Workers"   children={() => <WorkersStack   token={token} />} />
      <Tab.Screen name="Reports"   children={() => <ReportsStack   token={token} />} />
      <Tab.Screen name="Incidents" children={() => <IncidentsStack token={token} />} />
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