import React, { useState, useEffect, ReactNode } from 'react';
import { BackgroundOption, LogoConfig, LogoType, OutputFormat, LogoPreset } from './types';
import ControlPanel from './components/ControlPanel';
import PreviewPanel from './components/PreviewPanel';
import { Layers, AlertTriangle } from 'lucide-react';

// --- Error Boundary Component ---
interface ErrorBoundaryProps {
  children: ReactNode;
}
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
          <div className="bg-white p-8 rounded-xl shadow-lg border border-red-100 max-w-lg w-full text-center">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 mb-2">Something went wrong</h1>
            <p className="text-slate-600 mb-4">The application encountered an unexpected error.</p>
            <div className="bg-slate-100 p-3 rounded text-left overflow-auto text-xs font-mono text-slate-700 max-h-40">
              {this.state.error?.toString()}
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// --- Main App Logic ---

const LOGO_PRESETS: LogoPreset[] = [
  {
    id: 'h_std',
    name: 'Horizontal',
    group: 'Standard',
    url: 'https://fastly.jsdelivr.net/gh/tonyleelyy/9-Air-Logo-svg@main/logo_horizontal.svg',
    type: LogoType.HORIZONTAL
  },
  {
    id: 'h_rev',
    name: 'Horizontal Reverse',
    group: 'Reverse',
    url: 'https://fastly.jsdelivr.net/gh/tonyleelyy/9-Air-Logo-svg@main/logo_horizontal_reverse.svg',
    type: LogoType.HORIZONTAL
  },
  {
    id: 'h_white',
    name: 'Horizontal White',
    group: 'White',
    url: 'https://fastly.jsdelivr.net/gh/tonyleelyy/9-Air-Logo-svg@main/logo_horizontal_reverse.svg',
    type: LogoType.HORIZONTAL,
    forceWhite: true
  },
  {
    id: 'v_std',
    name: 'Vertical',
    group: 'Standard',
    url: 'https://fastly.jsdelivr.net/gh/tonyleelyy/9-Air-Logo-svg@main/logo_vertical.svg',
    type: LogoType.VERTICAL
  },
  {
    id: 'v_rev',
    name: 'Vertical Reverse',
    group: 'Reverse',
    url: 'https://fastly.jsdelivr.net/gh/tonyleelyy/9-Air-Logo-svg@main/logo_vertical_reverse.svg',
    type: LogoType.VERTICAL
  },
  {
    id: 'v_white',
    name: 'Vertical White',
    group: 'White',
    url: 'https://fastly.jsdelivr.net/gh/tonyleelyy/9-Air-Logo-svg@main/logo_vertical_reverse.svg',
    type: LogoType.VERTICAL,
    forceWhite: true
  },
  {
    id: 'i_std',
    name: 'Icon',
    group: 'Standard',
    url: 'https://fastly.jsdelivr.net/gh/tonyleelyy/9-Air-Logo-svg@main/logo_icon.svg',
    type: LogoType.ICON
  },
  {
    id: 'i_rev',
    name: 'Icon Reverse',
    group: 'Reverse',
    url: 'https://fastly.jsdelivr.net/gh/tonyleelyy/9-Air-Logo-svg@main/logo_icon_reverse.svg',
    type: LogoType.ICON
  },
];

const DEFAULT_CONFIG: LogoConfig = {
  width: 1000,
  height: 500,
  type: LogoType.HORIZONTAL,
  format: OutputFormat.PNG,
  background: BackgroundOption.WHITE,
  dpi: 72,
};

const AppContent: React.FC = () => {
  const [selectedPreset, setSelectedPreset] = useState<LogoPreset>(LOGO_PRESETS[0]);
  const [config, setConfig] = useState<LogoConfig>(DEFAULT_CONFIG);

  // Automatically update the safe zone logic (type) when the preset changes
  useEffect(() => {
    const allowedBackgrounds = (() => {
      if (selectedPreset.type === LogoType.ICON) {
        return selectedPreset.group === 'Standard'
          ? [BackgroundOption.WHITE, BackgroundOption.BLUE, BackgroundOption.TRANSPARENT]
          : [BackgroundOption.BLUE, BackgroundOption.MAGENTA, BackgroundOption.TRANSPARENT];
      }

      if (selectedPreset.group === 'Standard') {
        return [BackgroundOption.WHITE, BackgroundOption.TRANSPARENT];
      }

      if (selectedPreset.group === 'Reverse') {
        return [BackgroundOption.BLUE, BackgroundOption.TRANSPARENT];
      }

      return [BackgroundOption.MAGENTA, BackgroundOption.TRANSPARENT];
    })();

    setConfig(prev => {
      const background = allowedBackgrounds.includes(prev.background)
        ? prev.background
        : allowedBackgrounds[0];

      return {
        ...prev,
        type: selectedPreset.type,
        background,
        format: background === BackgroundOption.TRANSPARENT && prev.format === OutputFormat.JPG ? OutputFormat.PNG : prev.format,
      };
    });
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
              9Air <span className="text-indigo-600">Logo Generator</span>
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
              forceWhiteLogo={selectedPreset.forceWhite}
              config={config} 
            />
          </div>
          
        </div>
      </main>
    </div>
  );
};

// Wrap App in ErrorBoundary
const App: React.FC = () => (
  <ErrorBoundary>
    <AppContent />
  </ErrorBoundary>
);

export default App;
