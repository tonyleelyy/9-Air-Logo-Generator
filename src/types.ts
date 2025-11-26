export enum LogoType {
  HORIZONTAL = 'horizontal',
  VERTICAL = 'vertical',
  ICON = 'icon',
}

export enum OutputFormat {
  PNG = 'png',
  JPG = 'jpg',
}

export interface LogoConfig {
  width: number;
  height: number;
  type: LogoType;
  format: OutputFormat;
  transparent: boolean;
}

export interface LogoPreset {
  id: string;
  name: string;
  group: 'Standard' | 'Reverse';
  url: string;
  type: LogoType;
}
