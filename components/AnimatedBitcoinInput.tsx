import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo, useRef, useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { StyleSheet, Text, TextInput, TextStyle } from "react-native";
import Animated, {
  LinearTransition,
  SlideInDown,
  SlideOutDown,
} from "react-native-reanimated";

function formatNumberWithCommas(formatter: Intl.NumberFormat, num: number, rawValue: string) {
  const hasDecimal = rawValue.includes('.');
  
  // If the raw value has a decimal, we need to preserve the decimal portion exactly as typed
  // This handles cases like "0.0", "0.00", "123.450" where trailing zeros matter
  if (hasDecimal) {
    const [integerPart, decimalPart] = rawValue.split('.');
    // Format only the integer part with commas
    const formattedInteger = formatter.format(parseInt(integerPart || '0'));
    
    const result: { value: string; key: string }[] = [];
    let commaCount = 0;
    
    // Add formatted integer digits
    for (let i = 0; i < formattedInteger.length; i++) {
      const char = formattedInteger[i];
      if (char === ",") {
        result.push({ value: char, key: `comma-${i}` });
        commaCount++;
      } else {
        result.push({ value: char, key: `digit-${i - commaCount}` });
      }
    }
    
    // Add decimal point
    result.push({ value: '.', key: 'decimal' });
    
    // Add decimal digits exactly as typed (preserving trailing zeros)
    for (let i = 0; i < decimalPart.length; i++) {
      result.push({ value: decimalPart[i], key: `decimal-digit-${i}` });
    }
    
    return result;
  }
  
  // No decimal - use original formatting logic
  const formattedNum = formatter.format(num);
  const result: { value: string; key: string }[] = [];
  let commaCount = 0;

  for (let i = 0; i < formattedNum.length; i++) {
    const char = formattedNum[i];
    if (char === ",") {
      result.push({ value: char, key: `comma-${i}` });
      commaCount++;
    } else {
      result.push({ value: char, key: `digit-${i - commaCount}` });
    }
  }

  return result;
}

type AnimatedInputProps = {
  style?: TextStyle;
  onChangeText?: (text: string) => void;
  gradientColors?: string[];
  initialValue?: string | number;
  value?: string | number;
  currencySymbol?: string;
  formatter?: Intl.NumberFormat;
  autoFocus?: boolean;
};

const AnimatedBitcoinInput = forwardRef<TextInput, AnimatedInputProps>(({
  style,
  onChangeText,
  gradientColors = ["black", "transparent"],
  initialValue = "0",
  value,
  currencySymbol = "",
  formatter = new Intl.NumberFormat("en-US"),
  autoFocus = true,
}, ref) => {
  const [amount, setAmount] = useState(value !== undefined ? String(value) : String(initialValue));
  const inputRef = useRef<TextInput>(null);

  useImperativeHandle(ref, () => inputRef.current as TextInput);

  useEffect(() => {
    if (value !== undefined) {
      const newValue = String(value);
      if (newValue !== amount) {
        setAmount(newValue);
        // Update the hidden TextInput as well
        if (inputRef.current) {
          inputRef.current.setNativeProps({ text: newValue });
        }
      }
    }
  }, [value, amount]);

  const initialFontSize = style?.fontSize ?? 124;
  const animationDuration = 300;
  const [fontSize, setFontSize] = useState(initialFontSize);

  const formattedNumbers = React.useMemo(() => {
    return formatNumberWithCommas(formatter, parseFloat(String(amount) || "0"), String(amount));
  }, [amount, formatter]);

  const gradients = useMemo(() => {
    return {
      normal: [...gradientColors],
      reversed: [...gradientColors.reverse()],
    };
  }, [gradientColors]);

  return (
    <Animated.View
      style={{
        height: fontSize * 1.2,
        width: "100%",
        marginBottom: 0,
      }}>
      {/*
        We are using a dummy Text to let React Native do the math for the font size,
        in case the text will not fit on a single line.
      */}
      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        style={{
          // Initial FontSize
          fontSize: initialFontSize,
          lineHeight: initialFontSize,
          color: "white",
          fontWeight: "bold",
          textAlign: "center",
          width: "120%",
          position: "absolute",
          top: -10000,
          left: 0,
          right: 0,
          paddingHorizontal: 20,
          opacity: 1,
        }}
        onTextLayout={(e) => {
          setFontSize(e.nativeEvent.lines[0].capHeight);
        }}>
        ₿{formattedNumbers.map((x) => x.value).join("")}
      </Text>
      <Animated.View
        style={{
          flexDirection: "row",
          width: "100%",
          justifyContent: "center",
          overflow: "hidden",
        }}>
        <Animated.Text
          layout={LinearTransition.duration(animationDuration)}
          style={[styles.text, style, { fontSize, marginRight: fontSize * 0.1 }]}>
          ₿
        </Animated.Text>
        {formattedNumbers.map((formattedNumber, idx) => {
          return (
            <Animated.Text
              layout={LinearTransition.duration(animationDuration)}
              key={formattedNumber.key}
              entering={SlideInDown.duration(
                animationDuration
              ).withInitialValues({
                originY: initialFontSize / 2,
              })}
              exiting={SlideOutDown.duration(
                animationDuration
              ).withInitialValues({
                transform: [{ translateY: -initialFontSize / 2 }],
              })}
              style={[styles.text, style, { fontSize }]}>
              {formattedNumber.value}
            </Animated.Text>
          );
        })}
        {/**
         *
         * Hidden text input. This is because we're using the native keyboard.
         * TODO: Add a custom keyboard as well :)
         */}
        <TextInput
          ref={inputRef}
          returnKeyType='default'
          selectionColor='black'
          keyboardType='numeric'
          defaultValue={String(initialValue)}
          style={[
            StyleSheet.absoluteFillObject,
            {
              opacity: 0,
            },
          ]}
          autoFocus={autoFocus}
          onChangeText={(text) => {
            setAmount(text);
            onChangeText?.(text);
          }}
          value={amount}
        />
      </Animated.View>
      {/* <LinearGradient
        colors={[...gradients.normal] as [string, string, ...string[]]}
        style={{
          height: fontSize / 2,
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
        }}
        pointerEvents='none'
      />
      <LinearGradient
        colors={[...gradients.reversed] as [string, string, ...string[]]}
        style={{
          height: fontSize / 2,
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
        }}
        pointerEvents='none'
      /> */}
    </Animated.View>
  );
});

AnimatedBitcoinInput.displayName = 'AnimatedBitcoinInput';

export default AnimatedBitcoinInput;

const styles = StyleSheet.create({
  text: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    // fontFamily: 'Menlo'
    // fontVariant: ['tabular-nums']
  },
});
