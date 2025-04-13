import { MaterialIcons } from '@expo/vector-icons';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { colors, radius } from './tokens';
import { router } from 'expo-router';
import { usePhoto } from '@/store/photo';

interface PhotoBlockProps {
  id: number;
}

export const PhotoBlock = ({ id }: PhotoBlockProps) => {
  const { photoOne, photoTwo, photoThree, setNowPhoto, resetPhoto } = usePhoto();

  const source = id === 1 ? photoOne : id === 2 ? photoTwo : photoThree;
  return (
    <View style={styles.mainContainer}>
      <View style={styles.icon}>
        <TouchableOpacity
          onPress={() => {
            if (source === null) {
              router.replace('/camera');
              setNowPhoto(id);
            } else {
              resetPhoto(id);
            }
          }}
        >
          <MaterialIcons name={source === null ? 'add-circle' : 'cancel'} size={24} />
        </TouchableOpacity>
      </View>

      {source ? (
        <Image source={{ uri: source }} style={styles.image} resizeMode="cover" />
      ) : (
        <MaterialIcons name="photo-camera" size={40} color={colors.white} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    width: 100,
    height: 100,
    backgroundColor: colors.mediumLightGray,
    borderRadius: radius.r12,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  icon: {
    position: 'absolute',
    borderColor: colors.white,
    backgroundColor: colors.white,
    borderWidth: 4,
    borderRadius: radius.r1000,
    zIndex: 100,
    bottom: 75,
    left: 75,
  },
  image: {
    width: '100%',
    height: '100%',
    zIndex: 10,
    borderRadius: radius.r12,
  },
});
