import { Eye, Download, Trash2, CheckCircle, Clock, XCircle, MoreVertical } from 'lucide-react';
import { Project } from '../App';
import { useState } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface FileCardProps {
  project: Project;
  onView: () => void;
  onDelete: () => void;
}

export function FileCard({ project, onView, onDelete }: FileCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  const getStatusIcon = () => {
    switch (project.status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-teal-600" />;
      case 'processing':
        return <Clock className="w-4 h-4 text-blue-600 animate-pulse" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-600" />;
    }
  };

  const getStatusColor = () => {
    switch (project.status) {
      case 'completed':
        return 'bg-teal-50 text-teal-700 border-teal-100';
      case 'processing':
        return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'failed':
        return 'bg-red-50 text-red-700 border-red-100';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-lg transition-all group">
      {/* Thumbnail */}
      <div className="relative aspect-video bg-slate-100 overflow-hidden">
        <ImageWithFallback
          src={project.thumbnail}
          alt={project.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className={`absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border backdrop-blur-sm ${getStatusColor()}`}>
          {getStatusIcon()}
          <span className="text-xs font-medium capitalize">{project.status}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="mb-4">
          <h3 className="text-slate-900 mb-1 truncate">{project.name}</h3>
          <p className="text-slate-500 text-sm">{formatDate(project.date)}</p>
        </div>

        {/* Stats */}
        {project.status === 'completed' && (
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="bg-slate-50 rounded-lg p-2.5 text-center">
              <p className="text-slate-900 text-sm mb-0.5">{project.rooms.length}</p>
              <p className="text-slate-500 text-xs">Rooms</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-2.5 text-center">
              <p className="text-slate-900 text-sm mb-0.5">{project.totalArea.toFixed(0)}</p>
              <p className="text-slate-500 text-xs">m²</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-2.5 text-center">
              <p className="text-slate-900 text-sm mb-0.5">{project.doors + project.windows}</p>
              <p className="text-slate-500 text-xs">D+W</p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onView}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-slate-600 to-teal-600 text-white rounded-xl hover:shadow-md transition-all"
          >
            <Eye className="w-4 h-4" />
            <span className="text-sm">View</span>
          </button>
          <button className="flex items-center justify-center w-10 h-10 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl transition-all">
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="flex items-center justify-center w-10 h-10 bg-slate-50 hover:bg-red-50 text-slate-600 hover:text-red-600 rounded-xl transition-all"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
