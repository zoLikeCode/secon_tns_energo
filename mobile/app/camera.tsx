import { CameraView, useCameraPermissions } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library'; // для работы с медиатекой
import { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import Slider from '@react-native-community/slider';
import { colors, fonts, fontSize, radius } from '@/components/tokens';
import { MaterialIcons } from '@expo/vector-icons';
import { usePhoto } from '@/store/photo';
import { useRouter } from 'expo-router';
import { useAct } from '@/store/act';
import axios from 'axios';

export default function Camera() {
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [mediaPermission, requestMediaPermission] = MediaLibrary.usePermissions();
  const [cameraProps, setCameraProps] = useState({
    zoom: 0,
    flash: 'off',
    enableTorch: false,
  });

  const [image, setImage] = useState(null);
  const cameraRef = useRef(null);

  const { nowPhoto, setPhoto } = usePhoto();
  const router = useRouter();

  const { id } = useAct();

  if (!cameraPermission || !mediaPermission) {
    return <View />;
  }

  if (!cameraPermission.granted || mediaPermission.status !== 'granted') {
    return (
      <View style={styles.allowContainer}>
        <View style={styles.allowContent}>
          <Text style={styles.allowText}>
            Сейчас у приложения нет доступа к камере / медиатеке. Для работоспособности приложения
            дайте ему сопутствующие разрешения.
          </Text>
          <TouchableOpacity
            style={styles.touchButton}
            onPress={() => {
              requestCameraPermission();
              requestMediaPermission();
            }}
          >
            <Text style={styles.buttonText}>Разрешить доступ</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const toggleProp = (prop, opt1, opt2) => {
    setCameraProps((curr) => ({
      ...curr,
      [prop]: curr[prop] === opt1 ? opt2 : opt1,
    }));
  };

  const zoomIn = () => {
    setCameraProps((curr) => ({
      ...curr,
      zoom: Math.min(curr.zoom + 0.1, 1),
    }));
  };

  const zoomOut = () => {
    setCameraProps((curr) => ({
      ...curr,
      zoom: Math.max(curr.zoom - 0.1, 0),
    }));
  };

  const savePicture = async () => {
    if (image) {
      try {
        const asset = await MediaLibrary.createAssetAsync(image);
        const assetInfo = await MediaLibrary.getAssetInfoAsync(asset.id);
        Alert.alert('Photo saved', image);
        setImage(null);
      } catch (e) {}
    }
  };

  const uploadImage = async (imageUri) => {
    const url = 'https://beed-2a12-5940-db1b-00-2.ngrok-free.app/server/save_photo/';

    const formData = new FormData();
    formData.append('photo', {
      uri: imageUri,
      name: 'image.jpg',
      type: 'image/jpeg',
    });

    formData.append('task_id', id);
    formData.append('number', nowPhoto);

    try {
      const response = await axios.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    } catch (e) {}
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const picture = await cameraRef.current.takePictureAsync();
        setImage(picture.uri);
        setPhoto(nowPhoto, picture.uri);
        savePicture();
        uploadImage(picture.uri);
        router.replace('/act');
      } catch (e) {}
    }
  };

  return (
    <View style={styles.container}>
      <>
        <TouchableOpacity
          onPress={() => router.replace('/act')}
          style={{ alignSelf: 'flex-start', margin: 20, height: 30, position: 'absolute' }}
        >
          <Text style={{ fontSize: 18, color: colors.black }}>← Назад</Text>
        </TouchableOpacity>

        <CameraView
          style={styles.camera}
          zoom={cameraProps.zoom}
          flash={cameraProps.flash}
          enableTorch={cameraProps.enableTorch}
          ref={cameraRef}
        />
        <View style={styles.sliderWrapper}>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={1}
            value={cameraProps.zoom}
            onValueChange={(value) => setCameraProps((curr) => ({ ...curr, zoom: value }))}
            step={0.05}
            minimumTrackTintColor={colors.blue}
            maximumTrackTintColor={colors.mediumLightGray}
            thumbTintColor={colors.blue}
          />
        </View>
        <View style={styles.buttonContainer}>
          <View style={styles.sideButton}>
            <TouchableOpacity onPress={zoomIn}>
              <MaterialIcons name={'zoom-in'} size={40} />
            </TouchableOpacity>
            <TouchableOpacity onPress={zoomOut}>
              <MaterialIcons name={'zoom-out'} size={40} />
            </TouchableOpacity>
          </View>
          <View style={styles.centerButton}>
            <TouchableOpacity onPress={takePicture}>
              <MaterialIcons name={'radio-button-checked'} size={80} />
            </TouchableOpacity>
          </View>
          <View style={styles.sideButton}>
            <TouchableOpacity onPress={() => toggleProp('enableTorch', true, false)}>
              <MaterialIcons name={cameraProps.enableTorch ? 'flash-off' : 'flash-on'} size={40} />
            </TouchableOpacity>
          </View>
        </View>
      </>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.veryLightGray,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  camera: {
    marginTop: 30,
    flex: 1,
    width: '100%',
  },
  button: {
    position: 'absolute',
    bottom: 25,
    zIndex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.blue,
    borderRadius: radius.r50,
  },
  buttonText: {
    fontSize: fontSize.f14,
    fontWeight: '500',
    color: colors.white,
  },
  sliderWrapper: {
    width: '80%',
    alignSelf: 'center',
    marginBottom: 10,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  buttonContainer: {
    paddingHorizontal: 30,
    height: 100,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sideButton: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  allowContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    backgroundColor: colors.veryLightGray,
  },
  allowContent: {
    width: '80%',
    padding: 20,
    backgroundColor: colors.white,
    borderRadius: radius.r10,
    alignItems: 'center',
  },
  allowText: {
    textAlign: 'center',
    fontFamily: fonts.regular,
    fontSize: fontSize.f14,
  },
  touchButton: {
    marginTop: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.blue,
    borderRadius: radius.r50,
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});
