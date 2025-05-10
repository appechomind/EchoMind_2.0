'use client';

import React from 'react';
import { ImageGrid } from '../components/ImageGrid/ImageGrid';
import { MediaUploader } from '../components/MediaUploader/MediaUploader';
import { ProjectManager } from '../components/ProjectManager/ProjectManager';
import { VoiceRecognition } from '../components/VoiceRecognition/VoiceRecognition';
import { MagicTrick } from '../components/MagicTrick/MagicTrick';
import { usePersistentStorage } from '../hooks/usePersistentStorage';
import { STORAGE_KEYS } from '../constants';

export default function Home() {
  const [projects, setProjects] = usePersistentStorage('PROJECTS', []);
  const [mediaItems, setMediaItems] = usePersistentStorage('MEDIA_ITEMS', []);
  const [selectedProject, setSelectedProject] = React.useState(null);

  const handleUpload = (files) => {
    const newItems = files.map(file => ({
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      title: file.name,
      url: URL.createObjectURL(file),
      projectId: selectedProject,
      createdAt: Date.now(),
      keywords: [],
    }));
    setMediaItems(prev => [...prev, ...newItems]);
  };

  const handleProjectCreate = (name) => {
    const newProject = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      name,
      createdAt: Date.now(),
      mediaCount: 0,
    };
    setProjects(prev => [...prev, newProject]);
  };

  const handleProjectDelete = (projectId) => {
    setProjects(prev => prev.filter(p => p.id !== projectId));
    setMediaItems(prev => prev.filter(item => item.projectId !== projectId));
    if (selectedProject === projectId) {
      setSelectedProject(null);
    }
  };

  const handleMediaDelete = (mediaId) => {
    setMediaItems(prev => prev.filter(item => item.id !== mediaId));
  };

  const handleVoiceCommand = (command) => {
    // Implement voice command logic here
    console.log('Voice command:', command);
  };

  const filteredMedia = selectedProject
    ? mediaItems.filter(item => item.projectId === selectedProject)
    : mediaItems;

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            EchoMind 2.0
          </h1>
          <p className="text-xl text-gray-300">
            Magic Photo Gallery with Voice Control
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1 space-y-4">
            <ProjectManager
              projects={projects}
              selectedProject={selectedProject}
              onProjectSelect={setSelectedProject}
              onProjectCreate={handleProjectCreate}
              onProjectDelete={handleProjectDelete}
            />
          </div>

          <div className="md:col-span-3 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <MediaUploader onUpload={handleUpload} />
              <div className="space-y-4">
                <VoiceRecognition onCommand={handleVoiceCommand} />
                <MagicTrick items={filteredMedia} />
              </div>
            </div>

            <ImageGrid
              items={filteredMedia}
              onDelete={handleMediaDelete}
            />
          </div>
        </div>
      </div>
    </main>
  );
} 