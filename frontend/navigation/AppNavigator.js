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

// ← new
function ProfileStack({ token, setToken }) {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Profile">
        {props => <ProfileScreen {...props} token={token} setToken={setToken} />}
      </Stack.Screen>
    </Stack.Navigator>
  )
}

// ← setToken added
function AppTabs({ token, setToken }) {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Workers">
        {() => <WorkersStack token={token} />}
      </Tab.Screen>
      <Tab.Screen name="Reports">
        {() => <ReportsStack token={token} />}
      </Tab.Screen>
      <Tab.Screen name="Profile">
        {() => <ProfileStack token={token} setToken={setToken} />}
      </Tab.Screen>
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
          
          <Stack.Screen name="App" component={() => <AppTabs token={token} setToken={setToken} />} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}