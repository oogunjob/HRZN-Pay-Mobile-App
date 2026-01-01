// Inspiration: https://dribbble.com/shots/11638410-dinero
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { MotiView } from "moti";
import * as React from "react";
import { Dimensions, Text, TouchableOpacity, View } from "react-native";
import { Easing, ZoomOut } from "react-native-reanimated";

const { width } = Dimensions.get("window");

// Constants
const keys = [1, 2, 3, 4, 5, 6, 7, 8, 9, "space", 0, "delete"] as const;
const passcodeLength = 4;
const _keySize = 70; // Fixed size instead of screen-based
const _keySpacing = 30; // Space between keys
const _sideMargin = (width - (_keySize * 3 + _keySpacing * 2)) / 2; // Center the keyboard
const _passCodeSize = width / (passcodeLength + 2);

// Types
type Keys = (typeof keys)[number];
type PassCodeProps = {
  passcode: Keys[];
  isValid: boolean;
};
type PassCodeKeyboardProps = {
  onPress: (key: Keys) => void;
};

const PassCodeKeyboard = ({ onPress }: PassCodeKeyboardProps) => {
  return (
    <View
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        width: _keySize * 3 + _keySpacing * 2,
        alignSelf: "center",
      }}>
      {keys.map((key, index) => {
        if (key === "space") {
          return <View style={{ width: _keySize, height: _keySize }} key='space' />;
        }
        
        const isLastInRow = (index + 1) % 3 === 0;
        
        return (
          <TouchableOpacity
            onPress={() => onPress(key)}
            key={key}
            style={{
              width: _keySize,
              height: _keySize,
              alignItems: "center",
              justifyContent: "center",
              marginRight: isLastInRow ? 0 : _keySpacing,
              marginBottom: 10,
            }}>
            {key === "delete" ? (
              <MaterialCommunityIcons
                name='keyboard-backspace'
                size={36}
                color='rgba(0,0,0,0.3)'
              />
            ) : (
              <Text
                style={{ color: "#000", fontSize: 36, fontWeight: "700" }}>
                {key}
              </Text>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const PassCode = ({ passcode, isValid }: PassCodeProps) => {
  return (
    <MotiView
      animate={{
        translateX: isValid ? 0 : [0, 0, 0, 5, -5, 5, -5, 5, -5, 5, 0],
      }}
      transition={{
        type: "timing",
        duration: 100,
      }}
      style={{
        flexDirection: "row",
        marginVertical: 40,
        gap: _passCodeSize / 4,
      }}>
      {[...Array(passcodeLength).keys()].map((i) => {
        return (
          <View
            key={`passcode-${i}-${passcode[i]}`}
            style={{
              width: _passCodeSize,
              height: _passCodeSize,
              borderRadius: _passCodeSize,
              backgroundColor: "rgba(0,0,0,0.1)",
            }}>
            {passcode[i] !== undefined && (
              <MotiView
                key={`passcode-${i}-${i}`}
                from={{ scale: 0, backgroundColor: "#7a49a5" }}
                animate={{
                  scale:
                    isValid && passcode.length === passcodeLength
                      ? [1.1, 1]
                      : 1,
                  backgroundColor:
                    isValid && passcode.length === passcodeLength
                      ? "#72C17F"
                      : "#7a49a5",
                }}
                exiting={ZoomOut.duration(200)}
                transition={{
                  type: "timing",
                  duration: 500,
                  easing: Easing.elastic(1.1),
                  backgroundColor: {
                    delay:
                      isValid && passcode.length === passcodeLength ? 500 : 0,
                  },
                }}
                style={{
                  backgroundColor: "#8971FF",
                  alignItems: "center",
                  justifyContent: "center",
                  flex: 1,
                  borderRadius: _passCodeSize,
                }}>
                <Text
                  style={{
                    fontSize: _passCodeSize / 2,
                    color: "#fff",
                    fontWeight: "700",
                  }}>
                  {passcode[i]}
                </Text>
              </MotiView>
            )}
          </View>
        );
      })}
    </MotiView>
  );
};

export default function BitcoinKeyboard() {
  const [passcode, setPasscode] = React.useState<Keys[]>([]);

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text
        style={{
          fontSize: 16,
          paddingHorizontal: 40,
          textAlign: "center",
          color: "rgba(0,0,0,0.3)",
        }}>
        Enter the access code to get started.
      </Text>
      <PassCode passcode={passcode} isValid={true} />
      <PassCodeKeyboard
        onPress={(char) => {
          if (char === "delete") {
            setPasscode((passcode) =>
              passcode.length === 0
                ? []
                : passcode.slice(0, passcode.length - 1)
            );
            return;
          }
          if (passcode.length === passcodeLength) {
            return;
          }

          setPasscode((passcode) => [...passcode, char]);
        }}
      />
    </View>
  );
}