import React from 'react';
import { LogoConfig, LogoType, OutputFormat, LogoPreset } from '../types';
import { Settings2, Image as ImageIcon, Maximize, FileType, CheckCircle2 } from 'lucide-react';

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
          <div className="grid grid-cols-2 gap-3">
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
                  <div className="text-sm font-medium text-slate-900 mb-0.5">{preset.name}</div>
                  <div className="text-xs text-slate-500 flex items-center justify-between">
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

        {/* Format & Transparency */}
        <div className="space-y-3">
           <label className="flex items-center space-x-2 text-sm font-semibold text-slate-700">
            <FileType className="w-4 h-4" />
            <span>Output Settings</span>
          </label>
          
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-4">
             {/* Background Toggle */}
             <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Transparent Background</span>
                <button
                  onClick={() => {
                    const newTransparent = !config.transparent;
                    // If switching to transparent, force PNG
                    const newFormat = newTransparent ? OutputFormat.PNG : config.format;
                    setConfig((prev) => ({ ...prev, transparent: newTransparent, format: newFormat }));
                  }}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${config.transparent ? 'bg-indigo-600' : 'bg-slate-300'}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${config.transparent ? 'translate-x-6' : 'translate-x-1'}`}
                  />
                </button>
             </div>

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
                    disabled={config.transparent}
                    className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                      config.transparent 
                        ? 'opacity-50 cursor-not-allowed text-slate-300' 
                        : config.format === OutputFormat.JPG 
                          ? 'bg-indigo-100 text-indigo-700' 
                          : 'text-slate-500 hover:text-slate-700'
                    }`}
                    title={config.transparent ? "JPG does not support transparency" : ""}
                  >
                    JPG
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