import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ToastAndroid } from 'react-native';
import { colors, fonts, fontSize, radius } from '@/components/tokens';
import { router, SplashScreen } from 'expo-router';
import { Button } from '@/components/ui/button';
import { InputText } from '@/components/ui/inputText';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import { useUserStore } from '@/store/user';

export default function Index() {
  const [loginText, setLoginText] = useState('');
  const [passText, setPassText] = useState('');

  const { setSurName, setKeyJoin } = useUserStore();

  const Login = () => {
    axios
      .post('https://beed-2a12-5940-db1b-00-2.ngrok-free.app/server/tasks/', {
        sur_name: loginText,
        key: passText,
      })
      .then(() => {
        setSurName(loginText);
        setKeyJoin(passText);
        router.replace('/actList');
      })
      .catch((e) => {
        ToastAndroid.show('Неверный логин или пароль', ToastAndroid.LONG);
      });
  };

  return (
    <SafeAreaView style={styles.mainContainer}>
      <View style={styles.helloContainer}>
        <Text style={styles.helloTitle}>Добро пожаловать</Text>
        <Text style={styles.helloDesc}>в систему составления актов энергоинспектора!</Text>
      </View>
      <View style={styles.loginContainer}>
        <View>
          <Text style={styles.titleText}>Логин</Text>
          <InputText text={loginText} input={setLoginText} placeholder={'Логин...'} />
        </View>
        <View>
          <Text style={styles.titleText}>Пароль</Text>
          <InputText text={passText} input={setPassText} placeholder={'Пароль...'} />
        </View>
      </View>
      <Button text={'Войти   '} active={true} onPress={() => Login()} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: colors.veryLightGray,
    paddingHorizontal: 22,
    gap: 28,
  },
  helloContainer: {
    padding: 18,
    backgroundColor: colors.white,
    borderRadius: radius.r12,
  },
  helloTitle: {
    width: 250,
    color: colors.blue,
    fontSize: fontSize.f40,
    lineHeight: 40,
    fontFamily: fonts.bold,
  },
  helloDesc: {
    width: 310,
    color: colors.black,
    fontSize: fontSize.f32,
    lineHeight: 32,
    fontFamily: fonts.medium,
  },
  loginContainer: {
    padding: 20,
    borderRadius: radius.r12,
    backgroundColor: colors.white,
    gap: 16,
  },
  titleText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.f16,
    lineHeight: 16,
    color: colors.black,
    marginBottom: 8,
  },
});
