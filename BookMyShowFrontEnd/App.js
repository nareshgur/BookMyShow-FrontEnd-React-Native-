import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import AppNavigator from './navigation/AppNavigator';
import { Provider } from 'react-redux';
import { persistor, store } from './redux/store';
import { PersistGate } from 'redux-persist/integration/react';

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate
        loading={
          <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
            <ActivityIndicator size="large" color="#FF0A54" />
          </View>
        }
        persistor={persistor}
      >
         <AppNavigator/>
      </PersistGate>
    </Provider>
  );
}

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
// });
