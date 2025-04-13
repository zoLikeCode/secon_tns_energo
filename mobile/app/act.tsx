import { ActBlock } from '@/components/actBlock';
import { colors, fonts, fontSize, radius } from '@/components/tokens';
import { Button } from '@/components/ui/button';
import { Check } from '@/components/ui/check';
import { InputText } from '@/components/ui/inputText';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TextInput,
  ActivityIndicator,
  ToastAndroid,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { PhotoBlock } from '@/components/photoBlock';
import axios from 'axios';
import { useAct } from '@/store/act';
import { usePhoto } from '@/store/photo';

export default function Act({}: ActProps) {
  const [type, setType] = useState('');
  const [isLoad, setIsLoad] = useState(false);
  const { id } = useAct();

  const [data, setData] = useState(null);

  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [hasGeoPermission, setHasGeoPermission] = useState<boolean | null>(null);

  const { countPhotos, count_photo } = usePhoto();

  const requestGeoPermission = async () => {
    const { status: statusGEO } = await Location.requestForegroundPermissionsAsync();

    if (statusGEO !== 'granted') {
      setHasGeoPermission(false);
      ToastAndroid.showWithGravity(
        'Вы не можете составить акт, так как запретили передавать вашу геопозицию!',
        ToastAndroid.LONG,
        ToastAndroid.BOTTOM,
      );
      router.replace('/actList');
      return;
    }

    setHasGeoPermission(true);

    const location = await Location.getCurrentPositionAsync({});
    setCoords(location.coords);
  };

  useEffect(() => {
    requestGeoPermission();
  }, []);

  useEffect(() => {
    axios.get(`https://beed-2a12-5940-db1b-00-2.ngrok-free.app/server/task/${id}/`).then((m) => {
      setData(m.data);
      setIsLoad(true);
      setType(m.data.type_of_work === 'контроль' ? 'control' : 'act');
    });
  }, [id]);

  const [name, setName] = useState(''); //фио
  const [numberPhone, setNumberPhone] = useState(''); //телефон
  const [numberBill, setNumberBill] = useState(''); // номер счета

  //коммутационный аппарат
  const [haveComDev, setHaveComDev] = useState(false);
  const [noHaveComDev, setNoHaveComDev] = useState(false);

  //нарушение ограничения
  const [haveViolationRest, setHaveViolationRest] = useState(false);
  const [noHaveViolationRest, setNoHaveViolationRest] = useState(false);

  //основание для ограничения
  const [haveRest, setHaveRest] = useState(false);
  const [statusTextHaveRest, setStatusHaveRest] = useState(false);
  const [textHaveRest, setTextHaveRest] = useState('');

  //подача энергии
  const [startPower, setStartPower] = useState(false);
  const [stopPower, setStopPower] = useState(false);
  const [resumePower, setResumePower] = useState(false);

  //ограничена/приоставлена/возоблена
  const [clientPower, setClientPower] = useState(false);
  const [companyPower, setCompanyPower] = useState(false);

  //описание выявленного нарушения
  const [haveFlowEnergy, setHaveFlowEnergy] = useState(false);
  const [statusHaveFlowText, setHaveFlowText] = useState(false);
  const [textHaveFlow, setTextHaveFlow] = useState('');

  //самовольное подключение
  const [haveIllegalConnect, setHaveIllegalConnect] = useState(false);
  const [noHaveIllegalConnect, setNoHaveIllegalConnect] = useState(false);

  //описание места и способа подключения
  const [textDescIllegalConnect, setTextDescIllegalConnect] = useState('');

  //объяснение лица
  const [descPeopleIllegalConnect, setDescPeopleIllegalConnect] = useState('');

  //способ введения ограничения
  const [typeOnViolation, setTypeOnViolation] = useState('');

  //ограничение/приоставление/возообновление не введено по причине
  const [whyDontDesc, setWhyDontDesc] = useState('');

  //Место установки прибора учета
  const [placeInHome, setPlaceInHome] = useState(false);
  const [placeOnStairs, setPlaceOnStairs] = useState(false);
  const [statusPlaceText, setStatusPlaceText] = useState(false);
  const [placeText, setPlaceText] = useState('');

  //текущие показания
  const [currentData, setCurrentData] = useState('');

  //наличие пломб
  const [seal, setSeal] = useState('');

  const updateCountPhoto = () => {
    const count = usePhoto.getState().countPhotos(); // Получаем количество загруженных фото
    usePhoto.setState({ count_photo: count }); // Обновляем count_photo
  };

  const sendAct = () => {
    if (!coords) {
      ToastAndroid.showWithGravity(
        'Приложение не смогло распознать вашу геолокацию, попробуйте заново.',
        ToastAndroid.LONG,
        ToastAndroid.BOTTOM,
      );
      return;
    }

    updateCountPhoto();

    axios
      .post(
        'https://beed-2a12-5940-db1b-00-2.ngrok-free.app/server/act_ed/',
        {
          task_id: id,
          personal_number: numberBill || '',
          have_device: haveComDev ? 'имеется' : noHaveComDev ? 'отсутствует' : '',
          pay: haveRest ? 'оплата' : statusTextHaveRest && textHaveRest ? textHaveRest : '',
          supply: resumePower ? 'возобновлена' : startPower ? 'ограничена' : '',
          who_supply: clientPower ? 'потребителем' : companyPower ? 'исполнителем' : '',
          supply_text: whyDontDesc || '',
          where_device: placeInHome
            ? 'в квартире'
            : placeOnStairs
            ? 'на лестничной площадке'
            : statusPlaceText && placeText
            ? placeText
            : '',
          indicator: currentData || '',
          availability: seal || '',
          client: name?.trim() || '',
          latitude: String(coords.latitude),
          logitude: String(coords.longitude),
          count_photo: count_photo,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      )
      .then(() => {
        setTimeout(() => {
          router.replace('/actList');
        }, 1000);
      })
      .catch((e) => ToastAndroid.show('Возникла ошибка при отправке', ToastAndroid.SHORT));
  };

  const sendControl = () => {
    if (!coords) {
      ToastAndroid.showWithGravity(
        'Приложение не смогло распознать вашу геолокацию, попробуйте заново.',
        ToastAndroid.LONG,
        ToastAndroid.BOTTOM,
      );
      return;
    }

    updateCountPhoto();

    axios
      .post(
        'https://beed-2a12-5940-db1b-00-2.ngrok-free.app/server/act_control/',
        {
          task_id: id,
          warn: haveViolationRest ? 'выявлено' : noHaveViolationRest ? 'не выявлено' : '',
          phone: numberPhone || '',
          expenditure: haveFlowEnergy ? 'расход' : textHaveFlow || '',
          describe: textDescIllegalConnect || '',
          personal_number: numberBill || '',
          have_device: haveComDev ? 'имеется' : noHaveComDev ? 'отсутствует' : '',
          pay: haveRest ? 'оплата' : textHaveRest || '',
          where_device: placeInHome
            ? 'в квартире'
            : placeOnStairs
            ? 'на лестничной площадке'
            : placeText || '',
          indicator: currentData || '',
          client: name || '',
          why: descPeopleIllegalConnect || '',
          latitude: String(coords.latitude),
          logitude: String(coords.longitude),
          count_photo: count_photo,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      )
      .then(() => {
        setTimeout(() => {
          router.replace('/actList');
        }, 1000);
      })
      .catch((e) => ToastAndroid.show('Возникла ошибка при отправке', ToastAndroid.SHORT));
  };

  return (
    <SafeAreaView style={styles.mainContainer}>
      {!isLoad ? (
        <View style={styles.indicator}>
          <ActivityIndicator size="large" color={colors.blue} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <ActBlock
            streetName={`${data?.locality}, ул. ${data?.street}, дом ${data?.house}${
              data?.flat ? `, кв. ${data?.flat}` : ''
            }`}
            active={true}
            actName={
              data?.type_of_work === 'возобновление'
                ? 'Акт о возобновлении'
                : data?.type_of_work === 'контроль'
                ? 'Контроль ранее введенного ограничения'
                : 'Акт о введении ограничения'
            }
            actStatus={
              data?.type_of_work === 'возобновление'
                ? 'green'
                : data?.type_of_work === 'контроль'
                ? 'blue'
                : 'red'
            }
            brigadeNames={[data?.inspector_1, data?.inspector_2]}
            activeButton={false}
          />
          <Button
            text="Выбрать другой адрес"
            active={true}
            icon={<MaterialIcons name="arrow-back-ios" size={16} color={colors.white} />}
            posIcon="left"
            onPress={() => router.replace('/actList')}
          />

          <View style={styles.infoContainer}>
            <Text style={styles.infoTitle}>Фотоотчет</Text>
            <View
              style={[
                styles.infoContent,
                { flexDirection: 'column', justifyContent: 'space-between' },
              ]}
            >
              <View
                style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}
              >
                <PhotoBlock id={1} />
                <PhotoBlock id={2} />
                <PhotoBlock id={3} />
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ width: 100, fontSize: 14, fontFamily: fonts.regular }}>
                  Фото до начала работ
                </Text>
                <Text style={{ width: 100, fontSize: 14, fontFamily: fonts.regular }}>
                  Фото после окончания работ
                </Text>
                <Text style={{ width: 100, fontSize: 14, fontFamily: fonts.regular }}>
                  Доп.фото при надобности
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.infoContainer}>
            <Text style={styles.infoTitle}>Сведения о потребителе</Text>
            <View style={styles.infoContent}>
              <Text style={[styles.textTitle, { marginBottom: 8 }]}>ФИО потребителя:</Text>
              <InputText text={name} input={setName} placeholder="Ввод..." />
              {type === 'control' && (
                <>
                  <Text style={[styles.textTitle, { marginTop: 12, marginBottom: 8 }]}>
                    Телефон потребителя:
                  </Text>
                  <InputText text={numberPhone} input={setNumberPhone} placeholder="Ввод..." />
                </>
              )}
              <Text style={[styles.textTitle, { marginTop: 12, marginBottom: 8 }]}>
                Номер лицевого счета:
              </Text>
              <InputText text={numberBill} input={setNumberBill} placeholder="Ввод..." />
            </View>
          </View>

          <View style={styles.infoContainer}>
            <Text style={styles.infoTitle}>Сведения о нарушении</Text>
            <View style={styles.infoContent}>
              <Text style={[styles.textTitle, { marginBottom: 16 }]}>
                Коммутационный (вводной) аппарат:
              </Text>
              <View style={{ flexDirection: 'row', gap: 39 }}>
                <Check
                  text={'Имеется'}
                  active={haveComDev}
                  onPress={() => {
                    setHaveComDev(!haveComDev);
                    setNoHaveComDev(false);
                  }}
                />
                <Check
                  text={'Отсутствует'}
                  active={noHaveComDev}
                  onPress={() => {
                    setNoHaveComDev(!noHaveComDev);
                    setHaveComDev(false);
                  }}
                />
              </View>

              {type === 'control' && (
                <>
                  <Text style={[styles.textTitle, { marginBottom: 16, marginTop: 28, width: 300 }]}>
                    Нарушение потребителем введенного ограничения:
                  </Text>
                  <View style={{ flexDirection: 'row', gap: 18 }}>
                    <Check
                      text={'Не выявлено'}
                      active={noHaveViolationRest}
                      onPress={() => {
                        setNoHaveViolationRest(true);
                        setHaveViolationRest(false);
                      }}
                    />
                    <Check
                      text={'Выявлено'}
                      active={haveViolationRest}
                      onPress={() => {
                        setNoHaveViolationRest(false);
                        setHaveViolationRest(true);
                      }}
                    />
                  </View>
                </>
              )}

              <Text style={[styles.textTitle, { marginBottom: 16, marginTop: 28, width: 300 }]}>
                Основание введения ограничения энергии:
              </Text>
              <View style={{ gap: 14, width: 300 }}>
                <Check
                  text={'Не полная оплата коммунальной услуги'}
                  active={haveRest}
                  onPress={() => {
                    setHaveRest(!haveRest);
                    setStatusHaveRest(false);
                  }}
                />
                <Check
                  text={'Другое'}
                  active={statusTextHaveRest}
                  onPress={() => {
                    setStatusHaveRest(!statusTextHaveRest);
                    setHaveRest(false);
                  }}
                />
                {statusTextHaveRest && (
                  <InputText placeholder="Ввод..." text={textHaveRest} input={setTextHaveRest} />
                )}
              </View>

              {type === 'act' && (
                <>
                  <Text style={[styles.textTitle, { marginBottom: 16, marginTop: 28, width: 300 }]}>
                    Подача электроэнергии
                  </Text>
                  <View style={{ gap: 14 }}>
                    <Check
                      text={'Ограничена'}
                      active={startPower}
                      onPress={() => {
                        setStartPower(!startPower);
                        setStopPower(false);
                        setResumePower(false);
                      }}
                    />
                    <Check
                      text={'Возобновлена'}
                      active={resumePower}
                      onPress={() => {
                        setStartPower(false);
                        setStopPower(false);
                        setResumePower(!resumePower);
                      }}
                    />
                  </View>
                </>
              )}

              {type === 'act' && (
                <>
                  <Text style={[styles.textTitle, { marginBottom: 16, marginTop: 28, width: 300 }]}>
                    Ограничена/приоставлена/возобновлена
                  </Text>
                  <View style={{ gap: 14 }}>
                    <Check
                      text={'Потребителем'}
                      active={clientPower}
                      onPress={() => {
                        setClientPower(!clientPower);
                        setCompanyPower(false);
                      }}
                    />
                    <Check
                      text={'Исполнителем'}
                      active={companyPower}
                      onPress={() => {
                        setCompanyPower(!companyPower);
                        setClientPower(false);
                      }}
                    />
                  </View>
                </>
              )}

              {type === 'control' && (
                <>
                  <Text style={[styles.textTitle, { marginBottom: 16, marginTop: 28, width: 300 }]}>
                    Описание выявленного нарушения/сведения, на основании которого сделан вывод о
                    нарушении:
                  </Text>
                  <View style={{ gap: 14, width: 300 }}>
                    <Check
                      text={'Наличие расхода после введенного ограничения'}
                      active={haveFlowEnergy}
                      onPress={() => {
                        setHaveFlowEnergy(!haveFlowEnergy);
                        setHaveFlowText(false);
                      }}
                    />
                    <Check
                      text={'Другое'}
                      active={statusHaveFlowText}
                      onPress={() => {
                        setHaveFlowText(!statusHaveFlowText);
                        setHaveFlowEnergy(false);
                      }}
                    />
                    {statusHaveFlowText && (
                      <InputText
                        text={textHaveFlow}
                        input={setTextHaveFlow}
                        placeholder="Ввод..."
                      />
                    )}
                  </View>
                </>
              )}

              {type === 'control' && (
                <>
                  <Text style={[styles.textTitle, { marginBottom: 16, marginTop: 28, width: 300 }]}>
                    Самовольное подключение энергопринимающих устройств Потребителя к электросетям:
                  </Text>
                  <View style={{ gap: 14, flexDirection: 'row' }}>
                    <Check
                      text={'Не выявлено'}
                      active={haveIllegalConnect}
                      onPress={() => {
                        setHaveIllegalConnect(!haveIllegalConnect);
                        setNoHaveIllegalConnect(false);
                      }}
                    />
                    <Check
                      text={'Выявлено'}
                      active={noHaveIllegalConnect}
                      onPress={() => {
                        setNoHaveIllegalConnect(!noHaveIllegalConnect);
                        setHaveIllegalConnect(false);
                      }}
                    />
                  </View>
                </>
              )}

              {type === 'control' && (
                <>
                  <Text style={[styles.textTitle, { marginTop: 28, width: 300 }]}>
                    Описание места и способа самовольного подключения к сетям:
                  </Text>
                  <View style={[styles.boxInput, { marginTop: 8, marginBottom: 28, width: 300 }]}>
                    <TextInput
                      style={styles.boxText}
                      placeholderTextColor={colors.gray}
                      multiline={true}
                      value={textDescIllegalConnect}
                      onChangeText={setTextDescIllegalConnect}
                      placeholder="Ввод..."
                    />
                  </View>
                </>
              )}

              {type === 'act' && (
                <>
                  <Text style={[styles.textTitle, { marginTop: 28, width: 300 }]}>
                    Способ введения ограничения, приостановления, возобновления режима потребления;
                    номера и место установки пломб (знаков визуального контроля), установленных для
                    контроля ограничения
                  </Text>
                  <View style={[styles.boxInput, { marginTop: 8, width: 300 }]}>
                    <TextInput
                      style={styles.boxText}
                      placeholderTextColor={colors.gray}
                      value={typeOnViolation}
                      onChangeText={setTypeOnViolation}
                      multiline={true}
                      placeholder="Ввод..."
                    />
                  </View>
                </>
              )}

              {type === 'act' && (
                <>
                  <Text style={[styles.textTitle, { marginTop: 28, width: 300 }]}>
                    Ограничение/приостановление/возобновление не введено по причине:
                  </Text>
                  <View style={[styles.boxInput, { marginTop: 8, marginBottom: 28, width: 300 }]}>
                    <TextInput
                      style={styles.boxText}
                      placeholderTextColor={colors.gray}
                      value={whyDontDesc}
                      onChangeText={setWhyDontDesc}
                      multiline={true}
                      placeholder="Ввод..."
                    />
                  </View>
                </>
              )}

              {type === 'control' && (
                <>
                  <Text style={[styles.textTitle, { marginBottom: 8, width: 300 }]}>
                    Объяснение лица, допустившего самовольное подключение к электросетям:
                  </Text>
                  <View style={[styles.boxInput, { width: 300 }]}>
                    <TextInput
                      style={styles.boxText}
                      placeholderTextColor={colors.gray}
                      value={descPeopleIllegalConnect}
                      onChangeText={setDescPeopleIllegalConnect}
                      multiline={true}
                      placeholder="Ввод..."
                    />
                  </View>
                </>
              )}
            </View>
          </View>

          <View style={styles.infoContainer}>
            <Text style={styles.infoTitle}>Сведения о приборе учета</Text>
            <View style={styles.infoContent}>
              <Text style={[styles.textTitle, { marginBottom: 20 }]}>
                Место установки прибора учета:
              </Text>
              <View style={{ gap: 14, marginBottom: 30, width: 300 }}>
                <Check
                  text={'В квартире'}
                  active={placeInHome}
                  onPress={() => {
                    setPlaceInHome(!placeInHome);
                    setPlaceOnStairs(false);
                    setStatusPlaceText(false);
                  }}
                />
                <Check
                  text={'На лестничной площадке'}
                  active={placeOnStairs}
                  onPress={() => {
                    setPlaceInHome(false);
                    setPlaceOnStairs(!placeOnStairs);
                    setStatusPlaceText(false);
                  }}
                />
                <Check
                  text={'Другое'}
                  active={statusPlaceText}
                  onPress={() => {
                    setPlaceInHome(false);
                    setPlaceOnStairs(false);
                    setStatusPlaceText(!statusPlaceText);
                  }}
                />
                {statusPlaceText && (
                  <InputText text={placeText} placeholder="Ввод..." input={setPlaceText} />
                )}
              </View>
              <Text style={[styles.textTitle, { marginBottom: 8 }]}>Текущие показания:</Text>
              <View style={{ width: 300, marginBottom: 28 }}>
                <InputText text={currentData} placeholder="Ввод..." input={setCurrentData} />
              </View>
              <Text style={[styles.textTitle, { marginBottom: 8 }]}>
                Наличие, номера пломб (знаков визуального контроля) на системе учета:
              </Text>
              <View style={[styles.boxInput, { width: 300 }]}>
                <TextInput
                  style={styles.boxText}
                  placeholderTextColor={colors.gray}
                  value={seal}
                  onChangeText={setSeal}
                  multiline={true}
                  placeholder="Номер, место установки..."
                />
              </View>
            </View>
          </View>

          {haveViolationRest && (
            <View style={styles.infoContainer}>
              <Text style={styles.infoTitle}>Сведения о работах</Text>
              <Text style={[styles.addInfoTitle, { width: 320 }]}>
                Вы указали наличие нарушения. Будет заполнено{' '}
                <Text style={{ color: colors.blackBlue }}>сразу два акта</Text> - о контроле и об
                ограничении электроэнергии
              </Text>
              <View style={styles.infoContent}>
                <Text style={[styles.textTitle, { marginBottom: 16, width: 300 }]}>
                  Подача электроэнергии
                </Text>
                <View style={{ gap: 14 }}>
                  <Check
                    text={'Ограничена'}
                    active={startPower}
                    onPress={() => {
                      setStartPower(!startPower);
                      setStopPower(false);
                      setResumePower(false);
                    }}
                  />
                  <Check
                    text={'Возобновлена'}
                    active={resumePower}
                    onPress={() => {
                      setStartPower(false);
                      setStopPower(false);
                      setResumePower(!resumePower);
                    }}
                  />
                </View>
                <Text style={[styles.textTitle, { marginBottom: 16, marginTop: 28, width: 300 }]}>
                  Ограничена/приоставлена/возобновлена
                </Text>
                <View style={{ gap: 14 }}>
                  <Check
                    text={'Потребителем'}
                    active={clientPower}
                    onPress={() => {
                      setClientPower(!clientPower);
                      setCompanyPower(false);
                    }}
                  />
                  <Check
                    text={'Исполнителем'}
                    active={companyPower}
                    onPress={() => {
                      setCompanyPower(!companyPower);
                      setClientPower(false);
                    }}
                  />
                </View>
                <Text style={[styles.textTitle, { marginTop: 28, width: 300 }]}>
                  Способ введения ограничения, приостановления, возобновления режима потребления;
                  номера и место установки пломб (знаков визуального контроля), установленных для
                  контроля ограничения
                </Text>
                <View style={[styles.boxInput, { marginTop: 8, width: 300 }]}>
                  <TextInput
                    style={styles.boxText}
                    placeholderTextColor={colors.gray}
                    value={typeOnViolation}
                    onChangeText={setTypeOnViolation}
                    multiline={true}
                    placeholder="Ввод..."
                  />
                </View>
                <Text style={[styles.textTitle, { marginTop: 28, width: 300 }]}>
                  Ограничение/приостановление/возобновление не введено по причине:
                </Text>
                <View style={[styles.boxInput, { marginTop: 8, width: 300 }]}>
                  <TextInput
                    style={styles.boxText}
                    placeholderTextColor={colors.gray}
                    value={whyDontDesc}
                    onChangeText={setWhyDontDesc}
                    multiline={true}
                    placeholder="Ввод..."
                  />
                </View>
              </View>
            </View>
          )}

          <Button
            text="Сохранить и отправить акт"
            active={true}
            onPress={() => {
              if (type === 'act') {
                sendAct();
              } else {
                if (haveViolationRest) {
                  sendAct();
                  sendControl();
                } else {
                  sendControl();
                }
              }
            }}
          />
          <View style={styles.alertWrapper}>
            <Text style={styles.alertPush}>После отправки внести изменения будет невозможно</Text>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  indicator: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 22,
    paddingBottom: 25,
    paddingTop: 10,
    gap: 12,
  },
  alertWrapper: {
    alignItems: 'center',
  },
  alertPush: {
    width: 240,
    textAlign: 'center',
    alignItems: 'center',
    fontFamily: fonts.medium,
    fontSize: fontSize.f16,
    color: colors.blackGray,
  },
  infoContainer: {
    marginTop: 20,
    gap: 16,
  },
  infoTitle: {
    fontFamily: fonts.medium,
    fontSize: fontSize.f24,
    color: colors.blackBlue,
  },
  infoContent: {
    padding: 11,
    backgroundColor: colors.white,
    borderRadius: radius.r12,
  },
  textTitle: {
    fontSize: fontSize.f16,
    fontFamily: fonts.medium,
    color: colors.black,
  },
  boxInput: {
    textAlignVertical: 'top',
    borderRadius: radius.r12,
    borderWidth: 1,
    borderColor: colors.gray,
    paddingVertical: 2,
    paddingHorizontal: 16,
    minHeight: 84,
  },
  boxText: {
    fontSize: fontSize.f16,
    fontFamily: fonts.regular,
    color: colors.black,
    textAlignVertical: 'top',
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
  buttonText: {
    fontSize: fontSize.f14,
    fontWeight: '500',
    color: colors.white,
  },
  addInfoTitle: {
    fontSize: fontSize.f16,
    fontFamily: fonts.medium,
  },
});
