import 'react-native-gesture-handler';
import React, { Context } from 'react';
import { OffsidesAppState } from './types/OffsidesTypes.js';
import { InteractionManager, StatusBar, useColorScheme, View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import crashlytics from '@react-native-firebase/crashlytics';
import { SidechatAPIClient } from 'sidechat.js';
import HomeScreen from './screens/HomeScreen';
import SettingsScreen from './screens/SettingsScreen';
import LoginScreen from './screens/LoginScreen';
import MyProfileScreen from './screens/MyProfileScreen';
import CommentModal from './components/CommentModal';
import ExploreGroupsScreen from './screens/ExploreGroupsScreen';
import EditProfileScreen from './screens/EditProfileScreen';
import WriterScreen from './screens/WriterScreen';
import MessageScreen from './screens/MessagesScreen';
import ThreadScreen from './screens/ThreadScreen';
import UserProfileScreen from './screens/UserProfileScreen';
import { storage, hasMigratedFromAsyncStorage, migrateFromAsyncStorage } from './utils/mmkv';
import { useMMKVString } from 'react-native-mmkv';
import { KeyboardProvider } from 'react-native-keyboard-controller';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

/**
 * Global app context for Offsides. Contains API as well as current app state.
 * @type {Context<{appState: OffsidesAppState, setAppState: Function}>}
 */
const AppContext = React.createContext();

// Red badge indicator seen on the Fizz bottom navigation icons
const TabBadge = () => <View style={styles.badgeDot} />;

function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: '#8E8E93',
      }}>
      <Tab.Screen
        name="FeedTab"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ExploreTab"
        component={ExploreGroupsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <View>
              <Ionicons name="compass-outline" size={26} color={color} />
              <TabBadge />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="MessagesTab"
        component={MessageScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="paper-plane-outline" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="GamesTab"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <View>
              <Ionicons name="game-controller-outline" size={25} color={color} />
              <TabBadge />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={MyProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <View>
              <Ionicons name="person-outline" size={24} color={color} />
              <TabBadge />
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const colorScheme = useColorScheme();
  const [needsLogin, setNeedsLogin] = React.useState(null);
  const [appState, setAppState] = React.useState(null);
  const [hasMigrated, setHasMigrated] = React.useState(hasMigratedFromAsyncStorage);
  const [postSortMethod, setPostSortMethod] = useMMKVString('postSortMethod');

  React.useEffect(() => {
    crashlytics().log('Loading App');
    crashlytics().log('Fetching initial app variables');
    if (!hasMigrated) {
      InteractionManager.runAfterInteractions(async () => {
        try {
          await migrateFromAsyncStorage();
          setHasMigrated(true);
        } catch (e) {
          crashlytics().recordError(e);
        }
      });
    } else {
      crashlytics().log('Initial app variables fetched successfully');
      let tempState = {
        userToken: storage.getString('userToken'),
        userID: storage.getString('userID'),
        groupID: storage.getString('groupID'),
        groupName: storage.getString('groupName'),
        groupImage: storage.getString('groupImage'),
        groupColor: storage.getString('groupColor'),
        schoolGroupID: storage.getString('schoolGroupID'),
        schoolGroupName: storage.getString('schoolGroupName'),
        schoolGroupImage: storage.getString('schoolGroupImage'),
        schoolGroupColor: storage.getString('schoolGroupColor'),
      };
      if (storage.contains('userToken')) {
        tempState.API = new SidechatAPIClient(storage.getString('userToken'));
        crashlytics().log('User successfully logged in');
        setNeedsLogin(false);
      } else {
        crashlytics().log('User is not logged in');
        tempState.API = new SidechatAPIClient();
        crashlytics().log('Redirecting to LoginScreen');
        setNeedsLogin(true);
      }
      if (!postSortMethod) {
        setPostSortMethod('hot');
      }
      crashlytics().log('App state set successfully');
      setAppState(tempState);
    }
  }, [hasMigrated]);

  return (
    <SafeAreaProvider>
      <KeyboardProvider>
        <AppContext.Provider value={{ appState, setAppState }}>
          <NavigationContainer>
            <StatusBar barStyle="light-content" backgroundColor="#000000" />
            {needsLogin != null && appState != null && (
              <Stack.Navigator
                initialRouteName={needsLogin ? 'Login' : 'MainTabs'}
                screenOptions={{ headerShown: false }}>
                <Stack.Screen name="MainTabs" component={MainTabNavigator} />
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Settings" component={SettingsScreen} />
                <Stack.Screen name="MyProfile" component={MyProfileScreen} />
                <Stack.Screen name="UserProfile" component={UserProfileScreen} />
                <Stack.Screen name="EditProfile" component={EditProfileScreen} />
                <Stack.Screen name="Messages" component={MessageScreen} />
                <Stack.Screen name="Thread" component={ThreadScreen} />
                <Stack.Screen name="ExploreGroups" component={ExploreGroupsScreen} />
                <Stack.Screen
                  name="Comments"
                  component={CommentModal}
                  options={{
                    presentation: 'fullScreenModal',
                    animation: 'fade_from_bottom',
                  }}
                />
                <Stack.Screen
                  name="Writer"
                  component={WriterScreen}
                  options={{
                    presentation: 'fullScreenModal',
                    animation: 'fade_from_bottom',
                  }}
                />
              </Stack.Navigator>
            )}
          </NavigationContainer>
        </AppContext.Provider>
      </KeyboardProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#000000',
    borderTopColor: '#1A1A1A',
    borderTopWidth: 0.8,
    height: 62,
    paddingTop: 8,
    paddingBottom: 8,
  },
  badgeDot: {
    position: 'absolute',
    top: -2,
    right: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF3B47',
  },
});

export { AppContext };
