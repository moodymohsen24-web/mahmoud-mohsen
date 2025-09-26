import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useI18n } from '../hooks/useI18n';
import { useAuth } from '../hooks/useAuth';
import { projectService } from '../services/projectService';
import type { Project } from '../types';
import { FolderIcon } from '../components/icons/FolderIcon';
import { PencilIcon } from '../components/icons/PencilIcon';
import { TrashIcon } from '../components/icons/TrashIcon';

const ProjectsPage: React.FC = () => {
  const { t, language } = useI18n();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRenaming, setIsRenaming] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const fetchProjects = useCallback(async () => {
    if (user) {
      setIsLoading(true);
      try {
        const userProjects = await projectService.getProjectsForUser(user.id);
        setProjects(userProjects);
      } catch (error) {
        console.error("Failed to fetch projects:", error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [user]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleDelete = async (projectId: string) => {
    if (window.confirm(t('projects.deleteConfirm'))) {
      try {
        await projectService.deleteProject(projectId);
        setProjects(prev => prev.filter(p => p.id !== projectId));
      } catch (error) {
        console.error("Failed to delete project:", error);
        alert(t('projects.deleteError'));
      }
    }
  };

  const handleRename = async (projectId: string) => {
    if (!renameValue.trim()) return;
    try {
      await projectService.updateProject(projectId, { name: renameValue.trim() });
      setProjects(prev => prev.map(p => p.id === projectId ? { ...p, name: renameValue.trim() } : p));
    } catch (error) {
       console.error("Failed to rename project:", error);
       alert(t('projects.renameError'));
    } finally {
        setIsRenaming(null);
        setRenameValue('');
    }
  };

  const formatTimestamp = (dateString: string) => {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat(language === 'ar' ? 'ar-EG' : 'en-US', {
          dateStyle: 'medium',
          timeStyle: 'short',
      }).format(date);
  }

  if (isLoading) {
    return (
        <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-highlight"></div>
        </div>
    );
  }

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-text-primary dark:text-dark-text-primary mb-2">{t('projects.title')}</h1>
          <p className="text-text-secondary dark:text-dark-text-secondary">{t('projects.subtitle')}</p>
        </div>
        <Link to="/text-check" className="bg-highlight text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors">
          {t('projects.new')}
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-20 bg-secondary dark:bg-dark-secondary rounded-lg">
          <FolderIcon className="w-16 h-16 mx-auto text-text-secondary dark:text-dark-text-secondary opacity-50 mb-4" />
          <h2 className="text-xl font-semibold text-text-primary dark:text-dark-text-primary">{t('projects.empty.title')}</h2>
          <p className="text-text-secondary dark:text-dark-text-secondary mt-2">{t('projects.empty.description')}</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-secondary dark:bg-dark-secondary rounded-lg shadow-lg">
          <table className="min-w-full text-sm text-left">
            <thead className="text-xs text-text-primary dark:text-dark-text-primary uppercase bg-accent dark:bg-dark-accent">
              <tr>
                <th className="px-6 py-3">{t('projects.table.name')}</th>
                <th className="px-6 py-3">{t('projects.table.lastModified')}</th>
                <th className="px-6 py-3 text-end">{t('projects.table.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {projects.map(project => (
                <tr key={project.id} className="border-b border-accent dark:border-dark-accent hover:bg-accent dark:hover:bg-dark-accent/50">
                  <td className="px-6 py-4 font-medium">
                    {isRenaming === project.id ? (
                        <input
                            type="text"
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            onBlur={() => handleRename(project.id)}
                            onKeyDown={(e) => e.key === 'Enter' && handleRename(project.id)}
                            className="bg-primary dark:bg-dark-primary p-1 rounded-md"
                            autoFocus
                        />
                    ) : (
                        <Link to={`/text-check/${project.id}`} className="hover:underline text-highlight">
                            {project.name}
                        </Link>
                    )}
                  </td>
                  <td className="px-6 py-4 text-text-secondary dark:text-dark-text-secondary">{formatTimestamp(project.updated_at)}</td>
                  <td className="px-6 py-4 text-end">
                    <div className="flex justify-end items-center gap-2">
                        <button onClick={() => { setIsRenaming(project.id); setRenameValue(project.name); }} title={t('projects.rename')} className="p-2 text-highlight hover:bg-highlight/10 rounded-full transition-colors"><PencilIcon className="w-5 h-5"/></button>
                        <button onClick={() => handleDelete(project.id)} title={t('projects.delete')} className="p-2 text-red-500 hover:bg-red-500/10 rounded-full transition-colors"><TrashIcon className="w-5 h-5"/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;
