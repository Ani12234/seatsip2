import { useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const useResponsive = () => {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const isSmallPhone = width < 375;
  const isRegularPhone = width >= 375 && width < 414;
  const isLargePhone = width >= 414 && width < 600;
  const isTablet = width >= 600;

  // Font scale multiplier based on device width
  let fontScale = 1;
  if (isSmallPhone) fontScale = 0.9;
  else if (isLargePhone) fontScale = 1.05;
  else if (isTablet) fontScale = 1.2;

  // Calculate bottom sheet height based on screen height and device type
  let bottomSheetHeight = '50%';
  if (isSmallPhone) bottomSheetHeight = '65%';
  else if (isTablet) bottomSheetHeight = '40%';
  else if (isLargePhone) bottomSheetHeight = '50%';

  // Responsive values for layout
  const responsive = (small: number, regular: number, large?: number, tablet?: number) => {
    if (isTablet) return tablet ?? large ?? regular;
    if (isLargePhone) return large ?? regular;
    if (isSmallPhone) return small;
    return regular;
  };

  return {
    width,
    height,
    insets,
    isSmallPhone,
    isRegularPhone,
    isLargePhone,
    isTablet,
    fontScale,
    bottomSheetHeight,
    responsive,
  };
};
