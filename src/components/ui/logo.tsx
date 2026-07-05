import LogoSvg from '@/assets/images/logo.svg';

/** Seitenverhältnis des Vektor-Logos (viewBox 856.283 × 1135.431 → hochkant). */
const ASPECT = 856.283 / 1135.431;

/**
 * Kelima-Logo aus `assets/images/logo.svg` (Vektor, via react-native-svg).
 * `height` steuert die Größe; die Breite folgt dem Seitenverhältnis.
 */
export function Logo({ height = 96 }: { height?: number }) {
  return <LogoSvg height={height} width={Math.round(height * ASPECT)} />;
}
