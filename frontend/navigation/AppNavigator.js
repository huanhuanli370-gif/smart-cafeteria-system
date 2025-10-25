import React, { useContext } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import { TouchableOpacity, Text, View } from 'react-native'; // 引入 TouchableOpacity 和 Text

import OrderStack from './OrderStack';
import KitchenStack from './KitchenStack';
import SettingStack from './SettingStack';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import AIStack from './AIStack';
// import AuthStack from './AuthStack';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function screenIcon(name) {
  switch (name) {
    case 'OrderTab': return 'fast-food-outline';
    case 'OrderStatusTab': return 'list-outline';
    case 'KitchenTab': return 'restaurant-outline';
    case 'SettingTab': return 'settings-outline';
    case 'AITab': return 'sparkles-outline';
    default: return 'ellipse-outline';
  }
}

// 登录/注册的堆栈导航器，用于模态或独立页面
function AuthStack({ onSignInSuccess }) {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Sign In' }} />
      <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Sign Up' }} />
    </Stack.Navigator>
  );
}

// 将 RoleTabs 重命名为更通用的 Tabs，并添加 isLoggedIn 标志
function MainTabs({ role, isLoggedIn }) {
  const isCustomer = role === 'student' || role === 'faculty';
  const isStaff = role === 'staff';
  const isAdmin = role === 'admin';

  // 基础的 Tab 屏幕配置，未登录时用于过滤
  const customerTabs = [
    { name: "OrderTab", component: OrderStack, options: { title: 'Order' } },
    { name: "AITab", component: AIStack, options: { title: "AI Assistant", tabBarIcon: ({ color, size }) => (<Ionicons name="sparkles-outline" size={size} color={color} />) } },
    { name: "OrderStatusTab", component: OrderStack, options: { title: 'Order Status' }, 
      // 保持原有的 OrderStatusTab 导航逻辑
      initialParams: { screen: 'OrderStatusPage' }, 
      listeners: ({ navigation }) => ({
        tabPress: e => {
          e.preventDefault();
          navigation.navigate('OrderStatusTab', { screen: 'OrderStatusPage', params: { orderId: null } });
        },
      }),
    },
    { name: "SettingTab", component: SettingStack, options: { title: 'Settings' } },
  ];

  // 根据角色和登录状态决定显示的 Tab
  let tabScreens = [];
  let initialRoute = 'OrderTab';

  if (isAdmin) {
      tabScreens = [
          { name: "OrderTab", component: OrderStack, options: { title: 'Order' } },
          { name: "KitchenTab", component: KitchenStack, options: { title: 'Kitchen' } },
          { name: "SettingTab", component: SettingStack, options: { title: 'Settings' } },
      ];
  } else if (isStaff) {
      tabScreens = [
          { name: "KitchenTab", component: KitchenStack, options: { title: 'Kitchen' } },
          { name: "SettingTab", component: SettingStack, options: { title: 'Settings' } },
      ];
      initialRoute = 'KitchenTab';
  } else {
      // Customer（student/faculty）或兜底未登录角色
      tabScreens = customerTabs.filter(tab => {
          // 未登录时只显示 OrderTab 和 AITab
          if (!isLoggedIn) {
              return tab.name === 'OrderTab';
          }
          // 已登录时显示所有 Customer Tabs
          return true;
      });
  }

  return (
    <Tab.Navigator
      initialRouteName={initialRoute}
      screenOptions={({ route, navigation }) => ({
        tabBarIcon: ({ color, size }) => <Ionicons name={screenIcon(route.name)} color={color} size={size} />,
        headerShown: route.name === 'OrderTab' ? false : false, // 统一隐藏，让 OrderStack/OrderPage 管理头部
      })}
    >
      {tabScreens.map(screen => (
          <Tab.Screen 
              key={screen.name}
              name={screen.name} 
              component={screen.component} 
              options={screen.options}
              listeners={screen.listeners}
              initialParams={screen.initialParams}
          />
      ))}
    </Tab.Navigator>
  );
}


export default function AppNavigator() {
  const { loading, user } = useContext(AuthContext);
  const isLoggedIn = !!user;

  if (loading) return null;

  // 当用户未登录时，我们使用一个包含 MainTabs 和 AuthStack 的主堆栈导航器
  if (!isLoggedIn) {
    return (
      <Stack.Navigator>
          {/* OrderTab 位于主堆栈的第一个屏幕，这样可以定制头部 */}
          <Stack.Screen 
              name="MainTabs" 
              options={({ navigation }) => ({ 
                headerTitle: 'Free to sign in', // 为 OrderPage 设置一个默认标题
                headerShown: true, // 确保有头部
                // headerLeft: () => <View />,
                headerRight: () => (
                    // 未登录时显示 Sign In 按钮
                    <TouchableOpacity
                        onPress={() => navigation.navigate('AuthStack')}
                        style={{ marginLeft: 5, padding: 5 }}
                    >
                        <Text style={{ color: '#007AFF', fontSize: 16 }}>Sign In</Text>
                    </TouchableOpacity>
                )
            })}
          >
              {/* 这里使用匿名函数来传递 isLoggedIn 标志 */}
              {(props) => <MainTabs {...props} isLoggedIn={false} role={null} />}
          </Stack.Screen>

          {/* 登录/注册的堆栈，作为模态或单独的屏幕进行导航 */}
          <Stack.Screen 
              name="AuthStack" 
              component={AuthStack} 
              options={{ 
                  headerShown: false,
                  presentation: 'modal', // 可以使用 modal 方式展示
              }} 
          />
      </Stack.Navigator>
    );
  }

  // 已登录：直接渲染 MainTabs (RoleTabs)
  return <MainTabs role={user.role} isLoggedIn={true} />;
}