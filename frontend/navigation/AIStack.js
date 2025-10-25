// frontend/navigation/AIStack.js

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AIScreen from '../screens/AIScreen';

const Stack = createNativeStackNavigator();

export default function AIStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="AIHome" 
        component={AIScreen} 
        options={{ title: "AI Assistant" }} 
      />
    </Stack.Navigator>
  );
}