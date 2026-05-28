export enum LogoType {
  HORIZONTAL = 'horizontal',
  VERTICAL = 'vertical',
  ICON = 'icon',
}

export enum OutputFormat {
  PNG = 'png',
  JPG = 'jpg',
  GIF = 'gif',
}

export enum BackgroundOption {
  WHITE = 'white',
  BLUE = 'blue',
  MAGENTA = 'magenta',
  TRANSPARENT = 'transparent',
}

export interface LogoConfig {
  width: number;
  height: number;
  type: LogoType;
  format: OutputFormat;
  background: BackgroundOption;
  dpi: number;
}

export interface LogoPreset {
  id: string;
  name: string;
  group: 'Standard' | 'Reverse' | 'White';
  url: string;
  type: LogoType;
  forceWhite?: boolean;
}
