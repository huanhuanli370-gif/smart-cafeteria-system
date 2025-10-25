import { createNativeStackNavigator } from '@react-navigation/native-stack';
import OrderPage from '../screens/OrderPage';
import OrderStatusPage from '../screens/OrderStatusPage'; 
import OrderDetailPage from '../screens/OrderDetailPage';

const Stack = createNativeStackNavigator();

export default function OrderStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="OrderHome" component={OrderPage} options={{ title: "Order" }} />
      <Stack.Screen name="OrderStatusPage" component={OrderStatusPage} options={{ title: 'Order Status' }} initialParams={{ orderId: null }} />
      <Stack.Screen name="OrderDetailPage" component={OrderDetailPage} options={{ title: 'Order Details' }} />
    </Stack.Navigator>
  );
}
