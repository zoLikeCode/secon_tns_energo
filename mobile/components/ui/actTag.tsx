import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts, fontSize, radius } from '../tokens';

interface ActTagProps {
  text: string;
  status: string;
  active: boolean;
}

const getColor = (status: string, active: boolean) => {
  if (active) {
    switch (status) {
      case 'blue':
        return colors.lightBlue;
      case 'green':
        return colors.lightGreen;
      case 'red':
        return colors.lightRed;
    }
  } else {
    return colors.lightGray;
  }
};

const getColorBackground = (status: string, active: boolean) => {
  if (active) {
    switch (status) {
      case 'blue':
        return colors.lightBlue_tenVisible;
      case 'green':
        return colors.lightGreen_tenVisible;
      case 'red':
        return colors.lightRed_tenVisible;
    }
  } else {
    return colors.lightGray_tenVisible;
  }
};

export const ActTag = ({ text, status, active }: ActTagProps) => {
  const borderColor = getColor(status, active);
  const color = getColor(status, active);
  const backgroundColor = getColorBackground(status, active);

  return (
    <View style={[styles.mainContainer, { borderColor, backgroundColor }]}>
      <Text style={[styles.text, { color }]}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    padding: 6,
    borderRadius: radius.r4,
    borderWidth: 1,
    zIndex: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontFamily: fonts.medium,
    fontSize: fontSize.f14,
    zIndex: 100,
  },
});
