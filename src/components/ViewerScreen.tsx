import { useState, useRef, useEffect } from 'react';
import { Download, Sparkles, Palette, FileText, RotateCcw, Move, Eye, Box } from 'lucide-react';
import { Project } from '../App';
import { ExteriorDesigner } from './ExteriorDesigner';

interface ViewerScreenProps {
  project: Project;
}

type ViewMode = 'top' | 'walk' | 'front';

export function ViewerScreen({ project }: ViewerScreenProps) {
  const [activeTab, setActiveTab] = useState<'preview' | 'exterior'>('exterior');
  const [viewMode, setViewMode] = useState<ViewMode>('walk');
  const [rotation, setRotation] = useState({ x: -20, y: 45 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [isLoadingModel, setIsLoadingModel] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Clear canvas
    ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

    // Draw 3D representation
    drawScene(ctx, canvas.offsetWidth, canvas.offsetHeight, viewMode, rotation);
  }, [viewMode, rotation]);

  const drawScene = (ctx: CanvasRenderingContext2D, width: number, height: number, mode: ViewMode, rot: { x: number, y: number }) => {
    const centerX = width / 2;
    const centerY = height / 2;

    // Background
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#f8fafc');
    gradient.addColorStop(1, '#e2e8f0');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Grid
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    
    if (mode === 'top') {
      // Top view - 2D grid
      for (let i = 0; i < 20; i++) {
        const x = (width / 20) * i;
        const y = (height / 20) * i;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw floor plan from top
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 3;
      ctx.fillRect(centerX - 200, centerY - 150, 400, 300);
      ctx.strokeRect(centerX - 200, centerY - 150, 400, 300);

      // Interior walls
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(centerX - 200, centerY);
      ctx.lineTo(centerX + 200, centerY);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(centerX, centerY - 150);
      ctx.lineTo(centerX, centerY + 150);
      ctx.stroke();

      // Room labels
      ctx.fillStyle = '#64748b';
      ctx.font = '14px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Living', centerX - 100, centerY - 50);
      ctx.fillText('Kitchen', centerX + 100, centerY - 50);
      ctx.fillText('Bedroom 1', centerX - 100, centerY + 100);
      ctx.fillText('Bedroom 2', centerX + 100, centerY + 100);

    } else {
      // 3D perspective view
      const scale = mode === 'walk' ? 1.5 : 1;
      const offsetY = mode === 'walk' ? 50 : 0;

      // Apply rotation
      const angleY = (rot.y * Math.PI) / 180;
      
      // Floor
      ctx.fillStyle = '#e2e8f0';
      const floorPoints = [
        { x: centerX - 250 * scale * Math.cos(angleY), y: centerY + 100 + offsetY },
        { x: centerX + 250 * scale * Math.cos(angleY), y: centerY + 100 + offsetY },
        { x: centerX + 180 * scale * Math.cos(angleY), y: centerY + 200 + offsetY },
        { x: centerX - 180 * scale * Math.cos(angleY), y: centerY + 200 + offsetY },
      ];
      ctx.beginPath();
      ctx.moveTo(floorPoints[0].x, floorPoints[0].y);
      floorPoints.forEach(p => ctx.lineTo(p.x, p.y));
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#94a3b8';
      ctx.stroke();

      // Back wall
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.rect(centerX - 200 * scale * Math.cos(angleY), centerY - 100 + offsetY, 400 * Math.cos(angleY), 200);
      ctx.fill();
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Side walls
      ctx.fillStyle = '#f1f5f9';
      
      // Left wall
      ctx.beginPath();
      ctx.moveTo(centerX - 200 * scale * Math.cos(angleY), centerY - 100 + offsetY);
      ctx.lineTo(centerX - 250 * scale * Math.cos(angleY), centerY - 50 + offsetY);
      ctx.lineTo(centerX - 250 * scale * Math.cos(angleY), centerY + 100 + offsetY);
      ctx.lineTo(centerX - 200 * scale * Math.cos(angleY), centerY + 100 + offsetY);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#475569';
      ctx.stroke();

      // Right wall
      ctx.beginPath();
      ctx.moveTo(centerX + 200 * scale * Math.cos(angleY), centerY - 100 + offsetY);
      ctx.lineTo(centerX + 250 * scale * Math.cos(angleY), centerY - 50 + offsetY);
      ctx.lineTo(centerX + 250 * scale * Math.cos(angleY), centerY + 100 + offsetY);
      ctx.lineTo(centerX + 200 * scale * Math.cos(angleY), centerY + 100 + offsetY);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Windows
      ctx.fillStyle = '#93c5fd';
      ctx.fillRect(centerX - 100 * Math.cos(angleY), centerY - 60 + offsetY, 80 * Math.cos(angleY), 60);
      ctx.fillRect(centerX + 20 * Math.cos(angleY), centerY - 60 + offsetY, 80 * Math.cos(angleY), 60);
      
      // Simple furniture indicators
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(centerX - 150 * Math.cos(angleY), centerY + 40 + offsetY, 60 * Math.cos(angleY), 40);
      ctx.fillRect(centerX + 90 * Math.cos(angleY), centerY + 40 + offsetY, 60 * Math.cos(angleY), 40);
    }

    // View mode indicator
    ctx.fillStyle = '#0f172a';
    ctx.font = '12px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`${mode.charAt(0).toUpperCase() + mode.slice(1)} View`, 20, 30);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;

    const deltaX = e.clientX - lastMousePos.x;
    const deltaY = e.clientY - lastMousePos.y;

    setRotation(prev => ({
      x: Math.max(-90, Math.min(0, prev.x + deltaY * 0.5)),
      y: prev.y + deltaX * 0.5,
    }));

    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleDownloadModel = async () => {
    if (project.modelUrl) {
      setIsLoadingModel(true);
      try {
        const response = await fetch(project.modelUrl);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${project.name.replace(/[^a-z0-9]/gi, '_')}_3d_model.glb`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Download failed:', error);
        alert('Failed to download 3D model. Please try again.');
      } finally {
        setIsLoadingModel(false);
      }
    }
  };

  const handleDownloadFloorplan = async () => {
    if (project.floorplanUrl) {
      try {
        const response = await fetch(project.floorplanUrl);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${project.name.replace(/[^a-z0-9]/gi, '_')}_floorplan.svg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Download failed:', error);
        alert('Failed to download floor plan. Please try again.');
      }
    }
  };

  return (
    <div className="p-4 md:p-8 lg:p-12">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h2 className="text-slate-900 mb-2">3D Model Viewer</h2>
          <p className="text-slate-600">{project.name} - AI Generated Model</p>
        </div>

        <div className="inline-flex items-center gap-1 bg-slate-100 p-1 rounded-xl mb-6">
          <button
            onClick={() => setActiveTab('exterior')}
            className={`px-4 py-2 rounded-lg text-sm transition-all ${
              activeTab === 'exterior' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Exterior Material Designer (3D)
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-4 py-2 rounded-lg text-sm transition-all ${
              activeTab === 'preview' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            AI Analysis Preview
          </button>
        </div>

        {activeTab === 'exterior' && <ExteriorDesigner />}

        {activeTab === 'preview' && (
        <div className="grid lg:grid-cols-4 gap-6">
          {/* 3D Canvas */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              {/* Toolbar */}
              <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewMode('top')}
                    className={`px-4 py-2 rounded-xl transition-all text-sm ${
                      viewMode === 'top'
                        ? 'bg-gradient-to-r from-slate-600 to-teal-600 text-white shadow-md'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Top
                  </button>
                  <button
                    onClick={() => setViewMode('walk')}
                    className={`px-4 py-2 rounded-xl transition-all text-sm ${
                      viewMode === 'walk'
                        ? 'bg-gradient-to-r from-slate-600 to-teal-600 text-white shadow-md'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Walk
                  </button>
                  <button
                    onClick={() => setViewMode('front')}
                    className={`px-4 py-2 rounded-xl transition-all text-sm ${
                      viewMode === 'front'
                        ? 'bg-gradient-to-r from-slate-600 to-teal-600 text-white shadow-md'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Front
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  {project.modelUrl && (
                    <button
                      onClick={handleDownloadModel}
                      disabled={isLoadingModel}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Box className="w-4 h-4 text-slate-600" />
                      <span className="text-slate-700 text-sm">
                        {isLoadingModel ? 'Downloading...' : 'Real 3D Model'}
                      </span>
                    </button>
                  )}
                  <button
                    onClick={() => setRotation({ x: -20, y: 45 })}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all"
                  >
                    <RotateCcw className="w-4 h-4 text-slate-600" />
                    <span className="text-slate-700 text-sm">Reset View</span>
                  </button>
                </div>
              </div>

              {/* Canvas */}
              <div className="relative bg-slate-50" style={{ height: '500px' }}>
                <canvas
                  ref={canvasRef}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  className="w-full h-full cursor-grab active:cursor-grabbing"
                  style={{ width: '100%', height: '100%' }}
                />
                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-md">
                  <p className="text-slate-600 text-sm flex items-center gap-2">
                    <Move className="w-4 h-4" />
                    Drag to orbit • AI Generated Model
                  </p>
                </div>

                {/* Real Model Indicator */}
                {project.modelUrl && (
                  <div className="absolute top-4 right-4 bg-green-50 border border-green-200 px-3 py-1 rounded-lg">
                    <p className="text-green-700 text-sm flex items-center gap-1">
                      <Box className="w-3 h-3" />
                      Real GLB Model Available
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="p-4 border-t border-slate-100 flex flex-wrap gap-3">
                {project.modelUrl && (
                  <button
                    onClick={handleDownloadModel}
                    disabled={isLoadingModel}
                    className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-slate-600 to-teal-600 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Download className="w-4 h-4" />
                    <span className="text-sm">
                      {isLoadingModel ? 'Downloading...' : 'Download 3D Model (GLB)'}
                    </span>
                  </button>
                )}
                {project.floorplanUrl && (
                  <button
                    onClick={handleDownloadFloorplan}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-all"
                  >
                    <FileText className="w-4 h-4" />
                    <span className="text-sm">Download Floor Plan (SVG)</span>
                  </button>
                )}
                <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-all">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-sm">AI Furnishing Suggestions</span>
                </button>
                <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-all">
                  <Palette className="w-4 h-4" />
                  <span className="text-sm">Alternate Style</span>
                </button>
              </div>
            </div>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Room List */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h3 className="text-slate-900 mb-4">AI-Detected Rooms</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {project.rooms.map((room, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                  >
                    <div>
                      <p className="text-slate-900 text-sm font-medium">{room.name}</p>
                      <p className="text-slate-500 text-xs">{room.area.toFixed(1)} m²</p>
                    </div>
                    <Eye className="w-4 h-4 text-slate-400" />
                  </div>
                ))}
              </div>
            </div>

            {/* AI Analysis Summary */}
            <div className="bg-gradient-to-br from-blue-50 to-teal-50 rounded-2xl shadow-sm border border-blue-100 p-6">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <p className="text-slate-700 text-sm font-medium">AI Analysis Summary</p>
              </div>
              <p className="text-slate-600 text-sm mb-4">Computer vision analysis of your floor plan</p>
              <div className="pt-4 border-t border-blue-200/50 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Rooms Detected</span>
                  <span className="text-slate-900 font-medium">{project.rooms.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Doors Found</span>
                  <span className="text-slate-900 font-medium">{project.doors}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Windows Found</span>
                  <span className="text-slate-900 font-medium">{project.windows}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Total Area</span>
                  <span className="text-slate-900 font-medium">{project.totalArea.toFixed(1)} m²</span>
                </div>
              </div>
            </div>

            {/* Export Options */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h3 className="text-slate-900 mb-4">AI Exports</h3>
              <div className="space-y-2">
                <button
                  onClick={handleDownloadModel}
                  disabled={isLoadingModel || !project.modelUrl}
                  className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="text-slate-700 text-sm">3D Model (GLB)</span>
                  <Download className="w-4 h-4 text-slate-500" />
                </button>
                <button
                  onClick={handleDownloadFloorplan}
                  disabled={!project.floorplanUrl}
                  className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="text-slate-700 text-sm">Floor Plan (SVG)</span>
                  <Download className="w-4 h-4 text-slate-500" />
                </button>
                <button className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all">
                  <span className="text-slate-700 text-sm">PDF Report</span>
                  <Download className="w-4 h-4 text-slate-500" />
                </button>
              </div>
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}