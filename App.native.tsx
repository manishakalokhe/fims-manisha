import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text, SafeAreaView } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Camera, FileText, BarChart3, LogOut } from 'lucide-react-native';
import { supabase } from './src/lib/supabase';
import { SignInScreen } from './src/screens/SignInScreen';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { InspectionsScreen } from './src/screens/InspectionsScreen';
import { NewInspectionScreen } from './src/screens/NewInspectionScreen';
import type { User } from '@supabase/supabase-js';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function MainTabs({ onSignOut }: { onSignOut: () => void }) {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#7C3AED',
        tabBarInactiveTintColor: '#6B7280',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        headerStyle: {
          backgroundColor: '#7C3AED',
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerRight: () => (
          <View style={{ marginRight: 15 }}>
            <LogOut 
              color="#FFFFFF" 
              size={24} 
              onPress={onSignOut}
            />
          </View>
        ),
      }}
    >
      <Tab.Screen
        name="Dashboard"
        children={() => <DashboardScreen onSignOut={onSignOut} />}
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <BarChart3 color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Inspections"
        component={InspectionsScreen}
        options={{
          title: 'Inspections',
          tabBarIcon: ({ color, size }) => (
            <FileText color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="NewInspection"
        component={NewInspectionScreen}
        options={{
          title: 'New Inspection',
          tabBarIcon: ({ color, size }) => (
            <Camera color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleSignOut = async () => {
    try {
      if (supabase) {
        await supabase.auth.signOut();
      }
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  useEffect(() => {
    // Check if user is already signed in
    const checkUser = async () => {
      try {
        if (!supabase) {
          console.error('Supabase client not initialized');
          setIsLoading(false);
          return;
        }
        
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
      } catch (error) {
        console.error('Error checking user:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();

    // Listen for auth changes
    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        setUser(session?.user ?? null);
        setIsLoading(false);
      });

      return () => subscription.unsubscribe();
    }
  }, []);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <Camera color="#7C3AED" size={48} />
          <Text style={styles.loadingTitle}>FIMS</Text>
        <Text style={styles.loadingText}>Loading FIMS...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="light" backgroundColor="#7C3AED" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="Main">
            {() => <MainTabs onSignOut={handleSignOut} />}
          </Stack.Screen>
        ) : (
          <Stack.Screen name="SignIn" component={SignInScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#7C3AED',
    marginTop: 16,
    marginBottom: 8,
  },
  loadingText: {
    fontSize: 18,
    color: '#6B7280',
    fontWeight: '500',
  },
});