import type { AppConfig } from '../../types/app-config';

function hexToRgbChannels(hex: string): [number, number, number] {
  const normalized = hex.replace('#', '');
  const full =
    normalized.length === 3
      ? normalized
          .split('')
          .map((char) => `${char}${char}`)
          .join('')
      : normalized;

  const value = Number.parseInt(full, 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

function hexToRgb(hex: string): string {
  return hexToRgbChannels(hex).join(', ');
}

function channelToHex(channel: number): string {
  return Math.round(channel).toString(16).padStart(2, '0');
}

function mixHex(hex: string, target: number, amount: number): string {
  const [r, g, b] = hexToRgbChannels(hex);
  const mix = (channel: number) => channel + (target - channel) * amount;
  return `#${channelToHex(mix(r))}${channelToHex(mix(g))}${channelToHex(mix(b))}`;
}

function relativeLuminance(hex: string): number {
  const channels = hexToRgbChannels(hex).map((channel) => {
    const value = channel / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrastColor(hex: string): string {
  return relativeLuminance(hex) > 0.45 ? '#1a1508' : '#ffffff';
}

function applyColorScale(prefix: 'primary' | 'secondary', hex: string): void {
  const root = document.documentElement;
  root.style.setProperty(`--color-${prefix}`, hex);
  root.style.setProperty(`--color-${prefix}-rgb`, hexToRgb(hex));
  root.style.setProperty(`--color-${prefix}-contrast`, contrastColor(hex));
  root.style.setProperty(`--color-${prefix}-shade`, mixHex(hex, 0, 0.2));
  root.style.setProperty(`--color-${prefix}-tint`, mixHex(hex, 255, 0.14));
}

export function applyBrandTheme(config: AppConfig): void {
  const root = document.documentElement;

  applyColorScale('primary', config.brand.primaryColor);
  applyColorScale('secondary', config.brand.secondaryColor);

  const [r, g, b] = hexToRgbChannels(config.brand.primaryColor);
  root.style.setProperty('--color-focus-ring', `rgba(${r}, ${g}, ${b}, 0.35)`);

  root.style.setProperty('--font-family-base', config.brand.fontFamily);
  root.style.setProperty('--font-family-display', config.brand.fontFamily);
  root.style.setProperty('--ion-font-family', config.brand.fontFamily);
}
