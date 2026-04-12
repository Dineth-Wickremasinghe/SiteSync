import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import ProjectListScreen  from '../screens/projects/ProjectListScreen'
import ProjectFormScreen  from '../screens/projects/ProjectFormScreen'
import ProjectDetailScreen from '../screens/projects/ProjectDetailScreen'

const Stack = createNativeStackNavigator()

export default function ProjectNavigator() {
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
        component={ProjectListScreen}
        options={{ headerShown: false }}   // custom header inside screen
      />
      <Stack.Screen
        name="ProjectForm"
        component={ProjectFormScreen}
        options={({ route }) =>
          ({ title: route.params?.project ? 'Edit Project' : 'New Project' })
        }
      />
      <Stack.Screen
        name="ProjectDetail"
        component={ProjectDetailScreen}
        options={{ title: 'Project Details' }}
      />
    </Stack.Navigator>
  )
}