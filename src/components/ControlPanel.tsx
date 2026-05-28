import React from 'react';
import { BackgroundOption, LogoConfig, LogoType, OutputFormat, LogoPreset } from '../types';
import { Settings2, Image as ImageIcon, Maximize, FileType, CheckCircle2, Palette } from 'lucide-react';

interface ControlPanelProps {
  config: LogoConfig;
  setConfig: React.Dispatch<React.SetStateAction<LogoConfig>>;
  presets: LogoPreset[];
  selectedPreset: LogoPreset;
  onSelectPreset: (preset: LogoPreset) => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ 
  config, 
  setConfig, 
  presets,
  selectedPreset,
  onSelectPreset
}) => {
  
  const handleDimensionChange = (field: 'width' | 'height', value: string) => {
    const num = parseInt(value, 10);
    if (!isNaN(num)) {
      setConfig((prev) => ({ ...prev, [field]: num }));
    }
  };

  const handleDpiChange = (value: string) => {
    const num = parseInt(value, 10);
    if (!isNaN(num)) {
      setConfig((prev) => ({ ...prev, dpi: num }));
    }
  };

  const isWhiteLogo = selectedPreset.group === 'White' || selectedPreset.id === 'i_rev' || selectedPreset.id === 'h_rev' || selectedPreset.id === 'v_rev';
  const isHorizontalOrVerticalWhiteLogo = selectedPreset.id === 'h_rev' || selectedPreset.id === 'v_rev';
  const isTransparentBackground = config.background === BackgroundOption.TRANSPARENT;
  const backgroundOptions = [
    { value: BackgroundOption.WHITE, label: 'White', color: '#FFFFFF' },
    { value: BackgroundOption.BLUE, label: 'Blue', color: '#002FA7' },
    { value: BackgroundOption.MAGENTA, label: 'Magenta', color: '#F9007B' },
    { value: BackgroundOption.TRANSPARENT, label: 'Transparent', color: 'transparent' },
  ];

  const isBackgroundDisabled = (background: BackgroundOption) => {
    if (!isWhiteLogo && (background === BackgroundOption.BLUE || background === BackgroundOption.MAGENTA)) return true;
    if (isWhiteLogo && background === BackgroundOption.WHITE) return true;
    if (isWhiteLogo && background === BackgroundOption.BLUE) return true;
    if (isHorizontalOrVerticalWhiteLogo && background === BackgroundOption.MAGENTA) return true;
    return false;
  };

  const getBackgroundDisabledTitle = (background: BackgroundOption, label: string) => {
    if (!isWhiteLogo && (background === BackgroundOption.BLUE || background === BackgroundOption.MAGENTA)) return 'Standard logos can only use white or transparent backgrounds';
    if (isWhiteLogo && background === BackgroundOption.WHITE) return 'White logos cannot use a white background';
    if (isWhiteLogo && background === BackgroundOption.BLUE) return 'White logos cannot use a blue background';
    if (isHorizontalOrVerticalWhiteLogo && background === BackgroundOption.MAGENTA) return 'Horizontal and vertical white logos cannot use a magenta background';
    return label;
  };

  const handleBackgroundChange = (background: BackgroundOption) => {
    if (isBackgroundDisabled(background)) return;

    setConfig((prev) => ({
      ...prev,
      background,
      format: background === BackgroundOption.TRANSPARENT && prev.format === OutputFormat.JPG
        ? OutputFormat.PNG
        : prev.format,
    }));
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-full lg:overflow-y-auto">
      <div className="flex items-center space-x-2 mb-6 text-indigo-600">
        <Settings2 className="w-6 h-6" />
        <h2 className="text-xl font-bold text-slate-900">Configuration</h2>
      </div>

      <div className="space-y-8">
        
        {/* Logo Selection */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-slate-700">Select Logo</label>
          <div className="grid grid-cols-3 gap-3">
            {presets.map((preset) => {
              const isSelected = selectedPreset.id === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => onSelectPreset(preset)}
                  className={`
                    relative p-3 rounded-xl border text-left transition-all
                    ${isSelected 
                      ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500' 
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }
                  `}
                >
                  <div className="text-sm font-medium text-slate-900 flex items-center justify-between">
                     <span>{preset.group}</span>
                     {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                  </div>
                  
                  {/* Visual Indicator of Type */}
                  <div className="mt-2 flex items-center gap-1">
                     <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider
                        ${preset.type === LogoType.HORIZONTAL ? 'bg-blue-100 text-blue-700' : 
                          preset.type === LogoType.VERTICAL ? 'bg-purple-100 text-purple-700' : 
                          'bg-amber-100 text-amber-700'}
                     `}>
                       {preset.type}
                     </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dimensions */}
        <div className="space-y-3">
          <label className="flex items-center space-x-2 text-sm font-semibold text-slate-700">
            <Maximize className="w-4 h-4" />
            <span>Dimensions (px)</span>
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Width</label>
              <input
                type="number"
                value={config.width}
                onChange={(e) => handleDimensionChange('width', e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Height</label>
              <input
                type="number"
                value={config.height}
                onChange={(e) => handleDimensionChange('height', e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-mono text-sm"
              />
            </div>
          </div>
          <div className="mt-4">
              <label className="block text-xs text-slate-500 mb-1">DPI (Resolution)</label>
              <input
                type="number"
                value={config.dpi}
                onChange={(e) => handleDpiChange(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-mono text-sm"
              />
          </div>
        </div>

        {/* Background */}
        <div className="space-y-3">
          <label className="flex items-center space-x-2 text-sm font-semibold text-slate-700">
            <Palette className="w-4 h-4" />
            <span>Background Color</span>
          </label>
          <div className="grid grid-cols-4 gap-3">
            {backgroundOptions.map((option) => {
              const isSelected = config.background === option.value;
              const isDisabled = isBackgroundDisabled(option.value);
              const isTransparent = option.value === BackgroundOption.TRANSPARENT;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleBackgroundChange(option.value)}
                  disabled={isDisabled}
                  title={getBackgroundDisabledTitle(option.value, option.label)}
                  aria-label={option.label}
                  className={`
                    h-11 rounded-lg border p-1 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
                    ${isSelected ? 'border-indigo-500 ring-1 ring-indigo-500' : 'border-slate-200 hover:border-slate-300'}
                    ${isDisabled ? 'opacity-40 cursor-not-allowed hover:border-slate-200' : ''}
                  `}
                >
                  <span
                    className={`
                      block h-full w-full rounded-md border border-slate-200
                      ${isTransparent ? 'bg-[linear-gradient(45deg,#e2e8f0_25%,transparent_25%),linear-gradient(-45deg,#e2e8f0_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#e2e8f0_75%),linear-gradient(-45deg,transparent_75%,#e2e8f0_75%)] bg-[length:12px_12px] bg-[position:0_0,0_6px,6px_-6px,-6px_0px] bg-white' : ''}
                    `}
                    style={isTransparent ? undefined : { backgroundColor: option.color }}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Logo Type Display (Read Only) */}
        <div className="space-y-3 opacity-80">
           <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 text-sm font-semibold text-slate-700">
                <ImageIcon className="w-4 h-4" />
                <span>Active Safe Zone Logic</span>
              </label>
              <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">Auto-detected</span>
           </div>
           
          <div className="grid grid-cols-3 gap-2 pointer-events-none">
            {[LogoType.HORIZONTAL, LogoType.VERTICAL, LogoType.ICON].map((type) => (
              <div
                key={type}
                className={`
                  py-2 px-3 text-sm rounded-lg border text-center capitalize
                  ${config.type === type 
                    ? 'bg-slate-800 text-white border-slate-800 shadow-sm' 
                    : 'bg-slate-50 text-slate-400 border-slate-200'}
                `}
              >
                {type}
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-500">
            {config.type === LogoType.HORIZONTAL && "Optimized for wide logos (Padding = Height / 2)"}
            {config.type === LogoType.VERTICAL && "Optimized for tall logos (Padding = Width / 4.6)"}
            {config.type === LogoType.ICON && "Optimized for square icons (Padding = Height / 4.65)"}
          </p>
        </div>

        {/* Format */}
        <div className="space-y-3">
           <label className="flex items-center space-x-2 text-sm font-semibold text-slate-700">
            <FileType className="w-4 h-4" />
            <span>Output Settings</span>
          </label>
          
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
             {/* Format Selection */}
             <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Format</span>
                <div className="flex bg-white rounded-md border border-slate-200 p-1">
                  <button
                    onClick={() => setConfig((prev) => ({ ...prev, format: OutputFormat.PNG }))}
                    className={`px-3 py-1 rounded text-xs font-medium transition-all ${config.format === OutputFormat.PNG ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    PNG
                  </button>
                  <button
                    onClick={() => setConfig((prev) => ({ ...prev, format: OutputFormat.JPG }))}
                    disabled={isTransparentBackground}
                    className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                      isTransparentBackground 
                        ? 'opacity-50 cursor-not-allowed text-slate-300' 
                        : config.format === OutputFormat.JPG 
                          ? 'bg-indigo-100 text-indigo-700' 
                          : 'text-slate-500 hover:text-slate-700'
                    }`}
                    title={isTransparentBackground ? "JPG does not support transparency" : ""}
                  >
                    JPG
                  </button>
                  <button
                    onClick={() => setConfig((prev) => ({ ...prev, format: OutputFormat.GIF }))}
                    className={`px-3 py-1 rounded text-xs font-medium transition-all ${config.format === OutputFormat.GIF ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    GIF
                  </button>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;
