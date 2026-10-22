import { useState, useRef } from 'react';
import { Upload, Image, Settings } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface UploadScreenProps {
  onStartProcessing: (file: File, options: any) => void;
}

export function UploadScreen({ onStartProcessing }: UploadScreenProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [scale, setScale] = useState('0.05');
  const [wallHeight, setWallHeight] = useState('3.0');
  const [style, setStyle] = useState('modern');

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith('image/')) {
      handleFile(droppedFile);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFile(selectedFile);
    }
  };

  const handleFile = (selectedFile: File) => {
    setFile(selectedFile);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleGenerate = () => {
    if (file) {
      onStartProcessing(file, { scale, wallHeight, style });
    }
  };

  return (
    <div className="p-4 md:p-8 lg:p-12 max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-slate-900 mb-2">Upload Floor Plan</h2>
        <p className="text-slate-600">
          Convert your building plans into editable 2D floorplans and stunning 3D models
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Upload Area */}
        <div className="lg:col-span-2">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative bg-white rounded-2xl border-2 border-dashed transition-all cursor-pointer overflow-hidden ${
              isDragging
                ? 'border-teal-500 bg-teal-50/50 shadow-lg'
                : 'border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md'
            }`}
            style={{ minHeight: '400px' }}
          >
            {preview ? (
              <div className="relative w-full h-full min-h-[400px]">
                <ImageWithFallback
                  src={preview}
                  alt="Preview"
                  className="w-full h-full object-contain"
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-md">
                  <p className="text-slate-700 text-sm">{file?.name}</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full min-h-[400px] p-8">
                <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-teal-100 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                  <Upload className="w-10 h-10 text-slate-600" />
                </div>
                <h3 className="text-slate-900 mb-2">Drag and drop your floor plan</h3>
                <p className="text-slate-500 text-center mb-6 max-w-sm">
                  Support for JPG, PNG, or PDF files. We'll detect walls, rooms, doors, and windows automatically.
                </p>
                <div className="flex items-center gap-4">
                  <button className="px-6 py-2.5 bg-gradient-to-r from-slate-600 to-teal-600 text-white rounded-xl hover:shadow-lg transition-all">
                    Browse Files
                  </button>
                  <p className="text-slate-400 text-sm">or drop here</p>
                </div>

                {/* Sample Thumbnail */}
                <div className="mt-8 p-4 bg-slate-50 rounded-xl">
                  <p className="text-slate-500 text-sm mb-3">Example:</p>
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=300"
                    alt="Sample floor plan"
                    className="w-48 h-32 object-cover rounded-lg shadow-sm"
                  />
                </div>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInput}
              className="hidden"
            />
          </div>
        </div>

        {/* Options Panel */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-6">
              <Settings className="w-5 h-5 text-slate-600" />
              <h3 className="text-slate-900">Settings</h3>
            </div>

            <div className="space-y-5">
              {/* Scale */}
              <div>
                <label className="block text-slate-700 mb-2 text-sm">
                  Scale (meters per pixel)
                </label>
                <input
                  type="number"
                  value={scale}
                  onChange={(e) => setScale(e.target.value)}
                  step="0.01"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Wall Height */}
              <div>
                <label className="block text-slate-700 mb-2 text-sm">
                  Wall Height (m)
                </label>
                <input
                  type="number"
                  value={wallHeight}
                  onChange={(e) => setWallHeight(e.target.value)}
                  step="0.1"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Style */}
              <div>
                <label className="block text-slate-700 mb-2 text-sm">
                  Style Preset
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setStyle('modern')}
                    className={`px-4 py-2.5 rounded-xl transition-all ${
                      style === 'modern'
                        ? 'bg-gradient-to-r from-slate-600 to-teal-600 text-white shadow-md'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Modern
                  </button>
                  <button
                    onClick={() => setStyle('budget')}
                    className={`px-4 py-2.5 rounded-xl transition-all ${
                      style === 'budget'
                        ? 'bg-gradient-to-r from-slate-600 to-teal-600 text-white shadow-md'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Budget
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={!file}
            className={`w-full py-4 rounded-xl font-medium transition-all ${
              file
                ? 'bg-gradient-to-r from-slate-600 to-teal-600 text-white hover:shadow-lg hover:scale-[1.02]'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            Generate 3D Model
          </button>

          {/* Info Card */}
          <div className="bg-gradient-to-br from-blue-50 to-teal-50 rounded-2xl p-6 border border-blue-100">
            <h4 className="text-slate-900 mb-2 text-sm">💡 Tips for best results:</h4>
            <ul className="space-y-2 text-slate-600 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-teal-600">•</span>
                <span>Use high-resolution images</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-600">•</span>
                <span>Ensure clear wall boundaries</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-600">•</span>
                <span>Include door/window markers</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
