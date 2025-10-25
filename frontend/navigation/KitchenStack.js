import { createNativeStackNavigator } from '@react-navigation/native-stack';
import KitchenPage from '../screens/KitchenPage';
import OrderDetailPage from '../screens/OrderDetailPage';

const Stack = createNativeStackNavigator();

export default function KitchenStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="KitchenHome" component={KitchenPage} options={{ title: "Kitchen" }} />
      <Stack.Screen name="OrderDetailPage" component={OrderDetailPage} options={{ title: 'Order Details' }} />
    </Stack.Navigator>
  );
}
