import React, { useState, useEffect } from 'react'
import { NavigationContainer }         from '@react-navigation/native'
import { createNativeStackNavigator }  from '@react-navigation/native-stack'
import { ActivityIndicator, View }     from 'react-native'
import AsyncStorage                    from '@react-native-async-storage/async-storage'
import ProjectNavigator                from './navigation/ProjectNavigator'
import LoginScreen                     from './screens/auth/LoginScreen'
import RegisterScreen                  from './screens/auth/RegisterScreen'

const Stack = createNativeStackNavigator()

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [checking,   setChecking]   = useState(true)

  useEffect(() => { checkAuth() }, [])

  const checkAuth = async () => {
    const token = await AsyncStorage.getItem('token')
    setIsLoggedIn(!!token)
    setChecking(false)
  }

  // This is what LoginScreen calls — it saves the token and flips isLoggedIn
  const handleSetToken = async (token) => {
    await AsyncStorage.setItem('token', token)
    setIsLoggedIn(true)
  }

  if (checking) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1B4332' }}>
        <ActivityIndicator size="large" color="#52B788" />
      </View>
    )
  }

  return (
    <NavigationContainer>
      {isLoggedIn ? (
        <ProjectNavigator onLogout={() => setIsLoggedIn(false)} />
      ) : (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login">
            {(props) => (
              <LoginScreen
                {...props}
                setToken={handleSetToken}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="Register" component={RegisterScreen} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  )
}