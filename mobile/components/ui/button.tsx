import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, fonts, fontSize, radius } from '../tokens';

interface ButtonProps {
  text: string;
  active: boolean;
  type?: string;
  icon?: React.ReactNode;
  posIcon?: 'left' | 'right';
  onPress: () => void;
}

export const Button = ({ text, active, type, icon, posIcon, onPress }: ButtonProps) => {
  const backgroundColor = type === 'alarm' ? colors.pink : active ? colors.blue : colors.gray;

  return (
    <TouchableOpacity
      style={[
        styles.mainContainer,
        { backgroundColor },
        type === 'custom' && { alignSelf: 'flex-start' },
      ]}
      onPress={onPress}
    >
      <View style={styles.content}>
        {posIcon === 'left' && icon && <View style={[styles.icon, { right: 5 }]}>{icon}</View>}
        <Text style={styles.text}>{text}</Text>
        {posIcon === 'right' && icon && <View style={[styles.icon, { left: 5 }]}>{icon}</View>}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    borderRadius: radius.r12,
    paddingHorizontal: 16,
    paddingVertical: 13,
    alignItems: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    position: 'relative',
    marginHorizontal: 6,
    top: 1,
  },
  text: {
    color: colors.white,
    fontFamily: fonts.medium,
    fontSize: fontSize.f16,
    lineHeight: 20,
  },
});
