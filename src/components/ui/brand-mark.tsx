import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

/**
 * Lernwort-Markenzeichen: gestapelte „Karteikarten" (helle Karte hinten, grüne
 * Karte vorne) mit Häkchen — die RN-Umsetzung von design-system/assets/mark.svg
 * (ohne react-native-svg-Abhängigkeit).
 */
export function BrandMark({ size = 56 }: { size?: number }) {
  const card = size - 10;
  const radius = size * 0.22;
  return (
    <View style={{ width: size, height: size }} accessibilityRole="image" accessibilityLabel="Lernwort">
      <View
        style={{
          position: 'absolute',
          left: 0,
          top: 6,
          width: card,
          height: card,
          borderRadius: radius,
          backgroundColor: '#CFE9DD', // primary-100
          transform: [{ rotate: '-9deg' }],
        }}
      />
      <View
        className="items-center justify-center"
        style={{
          position: 'absolute',
          left: 8,
          top: 2,
          width: card,
          height: card,
          borderRadius: radius,
          backgroundColor: '#1F8160', // primary-500
        }}
      >
        <Ionicons name="checkmark" size={card * 0.52} color="#ffffff" />
      </View>
    </View>
  );
}
