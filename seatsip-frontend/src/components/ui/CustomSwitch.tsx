import React, { useEffect, useRef } from 'react';
import {
  TouchableOpacity,
  Animated,
  StyleSheet,
  Platform,
} from 'react-native';

interface CustomSwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
}

export const CustomSwitch: React.FC<CustomSwitchProps> = ({ value, onValueChange }) => {
  const animatedValue = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: value ? 1 : 0,
      duration: 300,
      useNativeDriver: false, // Color and transform interpolation don't always support native driver well in all RN versions
    }).start();
  }, [value]);

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 28], // Moving the knob
  });

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['#ffffff', '#5fdd54'],
  });

  const borderColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['#cccccc', 'transparent'],
  });

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onValueChange(!value)}
      style={styles.switchWrapper}
    >
      <Animated.View style={[styles.slider, { backgroundColor, borderColor }]}>
        <Animated.View
          style={[
            styles.knob,
            {
              transform: [{ translateX }],
            },
          ]}
        />
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  switchWrapper: {
    width: 62,
    height: 35,
    justifyContent: 'center',
  },
  slider: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 30,
    borderWidth: 1,
    justifyContent: 'center',
  },
  knob: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'white',
    ...Platform.select({
      web: {
        boxShadow: '0 2px 5px #999999',
      },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2.5,
      },
      android: {
        elevation: 3,
      },
    }),
  },
});
