import { MaterialIcons } from '@expo/vector-icons';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { colors, fonts, fontSize } from '../tokens';

interface CheckProps {
  text: string;
  active: boolean;
  onPress: () => void;
}

export const Check = ({ text, active, onPress }: CheckProps) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.mainContainer}>
      <View style={styles.icon}>
        <MaterialIcons name={active ? 'check-box' : 'check-box-outline-blank'} size={18} />
      </View>
      <Text style={styles.text}>{text}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  icon: {
    top: 1,
  },
  text: {
    fontSize: fontSize.f14,
    color: colors.black,
    fontFamily: fonts.regular,
  },
});
