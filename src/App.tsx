import React, { useState, useEffect } from 'react';
import { LogoConfig, LogoType, OutputFormat, LogoPreset } from './types';
import ControlPanel from './components/ControlPanel';
import PreviewPanel from './components/PreviewPanel';
import { Layers } from 'lucide-react';

const LOGO_PRESETS: LogoPreset[] = [
  {
    id: 'h_std',
    name: 'Horizontal',
    group: 'Standard',
    url: 'https://fastly.jsdelivr.net/gh/tonyleelyy/9-Air-Logo-Generator@main/svg/logo_horizontal.svg',
    type: LogoType.HORIZONTAL
  },
  {
    id: 'h_rev',
    name: 'Horizontal (White)',
    group: 'Reverse',
    url: 'https://fastly.jsdelivr.net/gh/tonyleelyy/9-Air-Logo-Generator@main/svg/logo_horizontal_reverse.svg',
    type: LogoType.HORIZONTAL
  },
  {
    id: 'v_std',
    name: 'Vertical',
    group: 'Standard',
    url: 'https://fastly.jsdelivr.net/gh/tonyleelyy/9-Air-Logo-Generator@main/svg/logo_vertical.svg',
    type: LogoType.VERTICAL
  },
  {
    id: 'v_rev',
    name: 'Vertical (White)',
    group: 'Reverse',
    url: 'https://fastly.jsdelivr.net/gh/tonyleelyy/9-Air-Logo-Generator@main/svg/logo_vertical_reverse.svg',
    type: LogoType.VERTICAL
  },
  {
    id: 'i_std',
    name: 'Icon',
    group: 'Standard',
    url: 'https://fastly.jsdelivr.net/gh/tonyleelyy/9-Air-Logo-Generator@main/svg/logo_icon.svg',
    type: LogoType.ICON
  },
  {
    id: 'i_rev',
    name: 'Icon (White)',
    group: 'Reverse',
    url: 'https://fastly.jsdelivr.net/gh/tonyleelyy/9-Air-Logo-Generator@main/svg/logo_icon_reverse.svg',
    type: LogoType.ICON
  },
];

const DEFAULT_CONFIG: LogoConfig = {
  width: 1000,
  height: 500,
  type: LogoType.HORIZONTAL,
  format: OutputFormat.PNG,
  transparent: false,
};

const App: React.FC = () => {
  const [selectedPreset, setSelectedPreset] = useState<LogoPreset>(LOGO_PRESETS[0]);
  const [config, setConfig] = useState<LogoConfig>(DEFAULT_CONFIG);

  // Automatically update the safe zone logic (type) when the preset changes
  useEffect(() => {
    setConfig(prev => ({ ...prev, type: selectedPreset.type }));
  }, [selectedPreset]);

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-900 bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 flex-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg text-white">
              <Layers className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">
              Pro <span className="text-indigo-600">Logo Scaler</span>
            </h1>
          </div>
          <div className="text-sm text-slate-500 font-medium hidden sm:block">
             Safe-Zone Automation Tool
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:h-[calc(100vh-8rem)] lg:min-h-[600px] h-auto">
          
          {/* Left Column: Controls */}
          <div className="lg:col-span-4 h-full">
            <ControlPanel 
              config={config} 
              setConfig={setConfig}
              presets={LOGO_PRESETS}
              selectedPreset={selectedPreset}
              onSelectPreset={setSelectedPreset}
            />
          </div>

          {/* Right Column: Preview */}
          <div className="lg:col-span-8 h-full">
            <PreviewPanel 
              svgUrl={selectedPreset.url}
              config={config} 
            />
          </div>
          
        </div>
      </main>
    </div>
  );
};

export default App;
