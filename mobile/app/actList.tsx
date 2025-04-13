import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  ToastAndroid,
} from 'react-native';
import { colors, fonts, fontSize, radius } from '@/components/tokens';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { ActBlock } from '@/components/actBlock';
import { Button } from '@/components/ui/button';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePhoto } from '@/store/photo';
import axios from 'axios';
import { useAct } from '@/store/act';
import { useUserStore } from '@/store/user';

export default function ActList() {
  const [search, setSearch] = useState('');
  const [isLoad, setIsLoad] = useState(false);
  const [name, setName] = useState('');
  const [lastUpdate, setLastUpdate] = useState('');
  const [data, setData] = useState([]);
  const [totalActs, setTotalActs] = useState();
  const [filteredData, setFilteredData] = useState([]);
  const { setId } = useAct();
  const { sur_name, key_join, setSurName, setKeyJoin } = useUserStore();

  const { photoOne, photoTwo, photoThree, resetPhoto } = usePhoto();

  if (photoOne !== null || photoTwo !== null || photoThree !== null) {
    resetPhoto(1);
    resetPhoto(2);
    resetPhoto(3);
  }

  const handleSearch = (text) => {
    setSearch(text);
    const filtered = data.filter(
      (item) =>
        item.locality.toLowerCase().includes(text.toLowerCase()) ||
        item.street.toLowerCase().includes(text.toLowerCase()) ||
        item.flat.includes(text) ||
        item.house.includes(text),
    );
    setFilteredData(filtered);
  };

  useEffect(() => {
    if (!sur_name || !key_join) {
      return;
    }

    axios
      .post('http://185.112.83.245:8000/server/tasks/', {
        sur_name: sur_name,
        key: key_join,
      })
      .then((m) => {
        setName(m.data.full_name);
        const updateLastUpdate = () => {
          const now = new Date();
          const pad = (n) => String(n).padStart(2, '0');

          const hours = pad(now.getHours());
          const minutes = pad(now.getMinutes());
          const day = pad(now.getDate());
          const month = pad(now.getMonth() + 1);
          const year = now.getFullYear();

          const formatted = `${hours}:${minutes} ${day}.${month}.${year}`;

          setLastUpdate(formatted);
        };
        updateLastUpdate();
        setTotalActs(m.data.total_acts);
        setData(m.data.tasks);
        setFilteredData(m.data.tasks);
        setId(0);
        setIsLoad(true);
      })
      .catch((e) => {
        ToastAndroid.showWithGravity(
          'Нет соединения со сервером',
          ToastAndroid.LONG,
          ToastAndroid.BOTTOM,
        );
      });
  }, [sur_name, key_join]);

  return (
    <SafeAreaView style={styles.mainContainer}>
      {!isLoad ? (
        <View style={styles.indicator}>
          <ActivityIndicator size="large" color={colors.blue} />
        </View>
      ) : (
        <>
          <View style={styles.controllesContainer}>
            <Text style={styles.titleText}>
              Контролер: <Text style={styles.contentText}>{name}</Text>
            </Text>
            <Text style={styles.titleText}>
              Последнее обновление: <Text style={styles.contentText}>{lastUpdate}</Text>
            </Text>
            <Text style={styles.titleText}>
              Ближайшая выгрузка:{' '}
              <Text style={styles.contentText}>
                20:00 {new Date().getHours() > 19 ? new Date().getDate() + 1 : new Date().getDate()}
                .04.25
              </Text>
            </Text>
            <Text style={styles.titleText}>
              Создано актов сегодня:{' '}
              <Text style={styles.contentText}>
                <Text style={styles.contentTextN}>{totalActs}</Text>
              </Text>
            </Text>
          </View>
          <Button
            text={'Выйти из аккаунта'}
            icon={<MaterialIcons name={'logout'} size={24} color={colors.white} />}
            posIcon="right"
            active={true}
            type={'alarm'}
            onPress={() => {
              setSurName('');
              setKeyJoin('');
              router.replace('/');
            }}
          />
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Поиск..."
              placeholderTextColor={colors.gray}
              value={search}
              onChangeText={handleSearch}
            />
            <TouchableOpacity style={styles.searchIcon}>
              <MaterialIcons name={'search'} size={24} color={colors.gray} />
            </TouchableOpacity>
          </View>
          <ScrollView>
            <View style={styles.actContainer}>
              {filteredData.length > 0 ? (
                filteredData.map((dt) => (
                  <ActBlock
                    key={dt.id}
                    streetName={`${dt?.locality}, ул. ${dt?.street}, дом ${dt?.house}${
                      dt?.flat ? `, кв. ${dt?.flat}` : ''
                    }`}
                    active={dt.act_count > 0 ? false : true}
                    actName={
                      dt?.type_of_work === 'возобновление'
                        ? 'Акт о возобновлении'
                        : dt?.type_of_work === 'контроль'
                        ? 'Контроль ранее введенного ограничения'
                        : 'Акт о введении ограничения'
                    }
                    actStatus={
                      dt.type_of_work === 'возобновление'
                        ? 'green'
                        : dt.type_of_work === 'контроль'
                        ? 'blue'
                        : 'red'
                    }
                    brigadeNames={[dt?.inspector_one, dt?.inspector_two]}
                    onPress={() => {
                      if (dt.act_count === 0) {
                        router.replace('/act');
                        setId(dt.id);
                      }
                    }}
                  />
                ))
              ) : (
                <Text>Нет результатов для вашего запроса</Text>
              )}
            </View>
          </ScrollView>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: colors.veryLightGray,
    paddingHorizontal: 22,
    gap: 16,
    paddingBottom: 25,
  },
  indicator: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actContainer: {
    gap: 12,
  },
  controllesContainer: {
    backgroundColor: colors.white,
    paddingVertical: 16,
    paddingHorizontal: 12,
    gap: 8,
    borderRadius: radius.r12,
  },
  titleText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.f16,
  },
  contentText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.f16,
  },
  contentTextN: {
    fontFamily: fonts.medium,
    color: colors.blue,
  },
  searchContainer: {
    justifyContent: 'center',
    borderRadius: radius.r12,
    padding: 10,
    backgroundColor: colors.white,
  },
  searchInput: {
    width: 350,
    height: 40,
    fontFamily: fonts.regular,
    fontSize: fontSize.f16,
    textAlignVertical: 'top',
  },
  searchIcon: {
    position: 'absolute',
    left: '91.5%',
  },
});
