import React from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { usePosts } from '@/context/posts';
import { useRouter } from 'expo-router';

export default function MapComponent() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const { posts } = usePosts();

  const initialRegion = {
    latitude: 61.524,
    longitude: 105.318,
    latitudeDelta: 40,
    longitudeDelta: 60,
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={initialRegion}
        userInterfaceStyle={colorScheme === 'dark' ? 'dark' : 'light'}
      >
        {posts
          .filter(post => post.latitude != null && post.longitude != null)
          .map(post => (
            <Marker
              key={post.id}
              coordinate={{ latitude: post.latitude!, longitude: post.longitude! }}
              title={post.title}
              description={post.description}
              onCalloutPress={() => router.push(`/place/${post.id}`)}
            >
              <Callout tooltip={false} />
            </Marker>
          ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
});
