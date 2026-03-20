import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

export default function MapComponent() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Интерактивная карта недоступна в веб-версии.</Text>
      <Text style={styles.subText}>Пожалуйста, откройте приложение на iOS или Android.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subText: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
  }
});
