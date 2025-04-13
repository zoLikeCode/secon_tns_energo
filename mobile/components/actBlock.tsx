import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { ActTag } from './ui/actTag';
import { Button } from './ui/button';
import { colors, fonts, fontSize, radius } from './tokens';
import { MaterialIcons } from '@expo/vector-icons';
import { Linking } from 'react-native';

interface actBlockProps {
  streetName: string;
  actName: string;
  actStatus: string;
  brigadeNames: string[];
  active: boolean;
  activeButton: boolean;
  link: string;
  onPress: () => void;
}

export const ActBlock = ({
  streetName,
  actName,
  actStatus,
  brigadeNames,
  active,
  activeButton = true,
  link,
  onPress,
}: actBlockProps) => {
  const color = active ? colors.blue : colors.gray;
  return (
    <View style={styles.mainContainer}>
      <TouchableOpacity
        style={styles.location}
        onPress={() => Linking.openURL(`https://yandex.ru/maps/?text=${streetName}`)}
      >
        <MaterialIcons name={'location-on'} color={colors.gray} size={28} />
      </TouchableOpacity>
      <Text style={styles.streetText}>{streetName}</Text>
      <ActTag text={actName} status={actStatus} active={active} />
      <Text style={[styles.brigadeText]}>
        Бригада:{' '}
        <Text style={styles.brigadeNameText}>
          {brigadeNames.map((name, index) => (
            <Text key={index}>
              {name}
              {index < brigadeNames.length - 1 ? ', ' : ''}
            </Text>
          ))}
        </Text>
      </Text>
      {activeButton && (
        <Button
          text={active ? 'Составить акт' : 'Акт составлен'}
          active={active}
          onPress={onPress}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    padding: 18,
    borderRadius: radius.r12,
    backgroundColor: colors.white,
    gap: 12,
  },
  streetText: {
    width: 256,
    color: colors.black,
    fontFamily: fonts.medium,
    fontSize: fontSize.f20,
  },
  brigadeText: {
    marginBottom: 12,
    fontSize: fontSize.f14,
    fontFamily: fonts.medium,
  },
  brigadeNameText: {
    fontSize: fontSize.f14,
    fontFamily: fonts.regular,
    color: colors.black,
  },
  location: {
    position: 'absolute',
    left: '95%',
    top: '15%',
  },
});
