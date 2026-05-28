import React, { useEffect, useRef, useState } from 'react';
import { LogoConfig } from '../types';
import { renderLogoToCanvas } from '../utils/logoLogic';
import { Download, AlertCircle, Loader2, Image as ImageIcon } from 'lucide-react';
import { changeDpiOnDataUrl } from '../utils/dpiLogic';
import { GIFEncoder, quantize, applyPalette } from 'gifenc';

interface PreviewPanelProps {
  svgUrl: string;
  config: LogoConfig;
}

const PreviewPanel: React.FC<PreviewPanelProps> = ({ svgUrl, config }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [renderedDims, setRenderedDims] = useState<{w: number, h: number} | null>(null);

  // Debounced Render Effect
  useEffect(() => {
    if (!svgUrl) {
      setPreviewUrl(null);
      setError(null);
      return;
    }

    const render = async () => {
      setLoading(true);
      setError(null);
      try {
        const canvas = await renderLogoToCanvas(svgUrl, config);
        let finalDataUrl = '';

        if (config.format === 'gif') {
          // Generate GIF using gifenc
          const ctx = canvas.getContext('2d');
          if (!ctx) throw new Error("Could not get 2D context");
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const { data, width, height } = imageData;

          // For transparency, we config 'format' to rgba4444 or use clearAlpha
          const quantizeFormat = config.transparent ? "rgba4444" : "rgb565";
          const palette = quantize(data, 256, { format: quantizeFormat });
          const index = applyPalette(data, palette, quantizeFormat);
          
          const gif = GIFEncoder();
          gif.writeFrame(index, width, height, { palette, transparent: config.transparent, transparentIndex: config.transparent ? 0 : undefined });
          gif.finish();
          const buffer = gif.bytes();
          
          let binary = '';
          const chunkSize = 8192;
          for (let i = 0; i < buffer.length; i += chunkSize) {
            binary += String.fromCharCode.apply(null, buffer.subarray(i, i + chunkSize) as unknown as number[]);
          }
          finalDataUrl = `data:image/gif;base64,${btoa(binary)}`;
        } else {
          // Generate PNG/JPG
          const mime = config.format === 'jpg' ? 'image/jpeg' : 'image/png';
          finalDataUrl = canvas.toDataURL(mime, 1.0);
          
          // Apply DPI adjustments
          if (config.dpi && config.dpi !== 72) {
             finalDataUrl = changeDpiOnDataUrl(finalDataUrl, config.dpi);
          }
        }

        setPreviewUrl(finalDataUrl);
        setRenderedDims({ w: canvas.width, h: canvas.height });
      } catch (err: any) {
        console.error(err);
        setError("Failed to render SVG. It might be a cross-origin issue or invalid SVG file.");
      } finally {
        setLoading(false);
      }
    };

    // Small timeout to prevent UI freeze on rapid input changes
    const timer = setTimeout(render, 300);
    return () => clearTimeout(timer);

  }, [svgUrl, config.width, config.height, config.type, config.format, config.transparent, config.dpi]);


  const handleDownload = () => {
    if (!previewUrl || !svgUrl) return;
    
    const link = document.createElement('a');
    link.href = previewUrl;
    
    // Construct filename: generated_{type}_{w}x{h}_{bg}.{ext}
    const bgLabel = config.transparent ? 'transparent' : 'white';
    const filename = `generated_${config.type}_${config.width}x${config.height}_${bgLabel}.${config.format}`;
    
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden min-h-[500px] lg:min-h-0">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white z-10">
        <h2 className="font-bold text-slate-800 flex items-center gap-2">
          Preview
          {loading && <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />}
        </h2>
        
        {renderedDims && (
           <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-1 rounded">
             {renderedDims.w} x {renderedDims.h}
           </span>
        )}
      </div>

      {/* Canvas Area */}
      <div ref={containerRef} className="flex-1 relative bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-slate-50 overflow-auto flex items-center justify-center p-8">
        
        {error ? (
           <div className="flex flex-col items-center text-red-500 p-6 bg-red-50 rounded-lg max-w-sm text-center">
             <AlertCircle className="w-8 h-8 mb-2" />
             <p className="text-sm font-medium">{error}</p>
           </div>
        ) : previewUrl ? (
          <div 
             className="relative shadow-xl"
             style={{ 
               width: config.width, 
               height: config.height,
               maxWidth: '100%', // Responsive scaling for display
               maxHeight: '100%',
               aspectRatio: `${config.width}/${config.height}`
             }}
          >
             <img 
               src={previewUrl} 
               alt="Preview" 
               className="w-full h-full object-contain"
               style={{
                 // Visual border to see bounds
                 boxShadow: '0 0 0 1px rgba(0,0,0,0.05)'
               }}
             />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-400">
             <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <ImageIcon className="w-8 h-8 text-slate-300" />
             </div>
             <p>Select a logo to begin</p>
          </div>
        )}
      </div>

      {/* Footer / Actions */}
      <div className="p-6 border-t border-slate-100 bg-white">
        <button
          onClick={handleDownload}
          disabled={!previewUrl || loading}
          className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-200"
        >
          {loading ? (
             <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
             <Download className="w-5 h-5" />
          )}
          Download Image
        </button>
      </div>
    </div>
  );
};

export default PreviewPanel;