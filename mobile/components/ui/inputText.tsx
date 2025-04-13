import { StyleSheet, TextInput, View } from 'react-native';
import { colors, fonts, fontSize, radius } from '../tokens';

interface InputTextProps {
  text: string;
  placeholder: string;
  input: () => void;
}

export const InputText = ({ text, placeholder, input }: InputTextProps) => {
  return (
    <View style={styles.mainContainer}>
      <TextInput
        value={text}
        placeholder={placeholder}
        placeholderTextColor={colors.gray}
        onChangeText={input}
        style={styles.textInput}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    borderRadius: radius.r12,
    borderColor: colors.regularLightGray,
    borderWidth: 1,
    height: 42,
    width: '100%',
    justifyContent: 'center',
    // alignItems: 'center',
    paddingHorizontal: 12,
  },

  textInput: {
    fontFamily: fonts.regular,
    fontSize: fontSize.f16,
    color: colors.black,
  },
});
