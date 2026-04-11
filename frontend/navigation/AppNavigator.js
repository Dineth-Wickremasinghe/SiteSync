import React, { useState } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'

import LoginScreen from '../screens/auth/LoginScreen'
import RegisterScreen from '../screens/auth/RegisterScreen'
import WorkerListScreen from '../screens/workers/WorkerListScreen'
import WorkerFormScreen from '../screens/workers/WorkerFormScreen'
import EquipmentListScreen from '../screens/equipment/EquipmentListScreen'
import EquipmentFormScreen from '../screens/equipment/EquipmentFormScreen'

const Stack = createNativeStackNavigator()

export default function AppNavigator() {
  const [token, setToken] = useState(null)

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {!token ? (
          <>
            <Stack.Screen name="Login">
              {props => <LoginScreen {...props} setToken={setToken} />}
            </Stack.Screen>
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="EquipmentList" options={{ title: 'Equipment' }}>
              {props => <EquipmentListScreen {...props} token={token} />}
            </Stack.Screen>
            <Stack.Screen name="EquipmentForm" options={{ title: 'Equipment Details' }}>
              {props => <EquipmentFormScreen {...props} token={token} />}
            </Stack.Screen>
            <Stack.Screen name="WorkerList">
              {props => <WorkerListScreen {...props} token={token} />}
            </Stack.Screen>
            <Stack.Screen name="WorkerForm">
              {props => <WorkerFormScreen {...props} token={token} />}
            </Stack.Screen>
            
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}