import { MD3LightTheme, MD3DarkTheme, configureFonts } from 'react-native-paper';
import type { MD3Theme } from 'react-native-paper';

// Campus Connect Brand Colors
const campusColors = {
  primary: '#1976D2',      // Campus blue
  secondary: '#FFA726',    // Campus orange
  accent: '#4CAF50',       // Success green
  surface: '#FFFFFF',      // White background
  background: '#F5F5F5',   // Light gray background
  error: '#F44336',        // Error red
  onSurface: '#212121',    // Dark text
  onBackground: '#424242', // Medium text
};

// Custom font configuration (optional)
const fonts = configureFonts({
  config: {
    fontFamily: 'System', // Use system font or specify custom fonts
  },
});

// Light Theme
export const lightTheme: MD3Theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: campusColors.primary,
    onPrimary: '#FFFFFF',
    primaryContainer: '#E3F2FD',
    onPrimaryContainer: '#0D47A1',

    secondary: campusColors.secondary,
    onSecondary: '#FFFFFF',
    secondaryContainer: '#FFF3E0',
    onSecondaryContainer: '#E65100',

    tertiary: campusColors.accent,
    onTertiary: '#FFFFFF',
    tertiaryContainer: '#E8F5E8',
    onTertiaryContainer: '#1B5E20',

    error: campusColors.error,
    onError: '#FFFFFF',
    errorContainer: '#FFEBEE',
    onErrorContainer: '#B71C1C',

    background: campusColors.background,
    onBackground: campusColors.onBackground,

    surface: campusColors.surface,
    onSurface: campusColors.onSurface,
    surfaceVariant: '#F5F5F5',
    onSurfaceVariant: '#757575',
  },
  fonts,
};

// Dark Theme
export const darkTheme: MD3Theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#64B5F6',      // Lighter blue for dark mode
    onPrimary: '#0D47A1',
    primaryContainer: '#1565C0',
    onPrimaryContainer: '#E3F2FD',

    secondary: '#FFB74D',    // Lighter orange for dark mode
    onSecondary: '#E65100',
    secondaryContainer: '#F57C00',
    onSecondaryContainer: '#FFF3E0',

    tertiary: '#81C784',     // Lighter green for dark mode
    onTertiary: '#1B5E20',
    tertiaryContainer: '#388E3C',
    onTertiaryContainer: '#E8F5E8',

    background: '#121212',
    onBackground: '#FFFFFF',

    surface: '#1E1E1E',
    onSurface: '#FFFFFF',
    surfaceVariant: '#2C2C2C',
    onSurfaceVariant: '#CCCCCC',
  },
  fonts,
};

// Theme selector hook
export const getTheme = (isDark: boolean) => isDark ? darkTheme : lightTheme;