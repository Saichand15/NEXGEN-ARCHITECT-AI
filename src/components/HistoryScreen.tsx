import { Calendar, Eye, Download, Trash2, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Project } from '../App';
import { FileCard } from './FileCard';

interface HistoryScreenProps {
  projects: Project[];
  onViewProject: (project: Project) => void;
  onDeleteProject: (id: string) => void;
}

export function HistoryScreen({ projects, onViewProject, onDeleteProject }: HistoryScreenProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-teal-600" />;
      case 'processing':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'processing':
        return 'Processing';
      case 'failed':
        return 'Failed';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="p-4 md:p-8 lg:p-12">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h2 className="text-slate-900 mb-2">Project History</h2>
          <p className="text-slate-600">View and manage your previous floor plan conversions</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm mb-1">Total Projects</p>
                <p className="text-slate-900">{projects.length}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm mb-1">Total Area</p>
                <p className="text-slate-900">
                  {projects.reduce((sum, p) => sum + p.totalArea, 0).toFixed(0)} m²
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-teal-100 to-teal-50 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-teal-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm mb-1">This Month</p>
                <p className="text-slate-900">
                  {projects.filter(p => {
                    const date = new Date(p.date);
                    const now = new Date();
                    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
                  }).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-slate-100 to-slate-50 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-slate-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        {projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <FileCard
                key={project.id}
                project={project}
                onView={() => onViewProject(project)}
                onDelete={() => onDeleteProject(project.id)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-slate-900 mb-2">No projects yet</h3>
            <p className="text-slate-500 mb-6">Upload your first floor plan to get started</p>
            <button className="px-6 py-3 bg-gradient-to-r from-slate-600 to-teal-600 text-white rounded-xl hover:shadow-lg transition-all">
              Upload Floor Plan
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
