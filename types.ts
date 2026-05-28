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

export interface LogoConfig {
  width: number;
  height: number;
  type: LogoType;
  format: OutputFormat;
  transparent: boolean;
  dpi: number;
}

export interface LogoPreset {
  id: string;
  name: string;
  group: 'Standard' | 'Reverse';
  url: string;
  type: LogoType;
}
