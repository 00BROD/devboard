import ProjectManager from '../components/ProjectManager';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-900">
      <header className="bg-gray-800 border-b border-gray-700 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-5">
          <h1 className="text-2xl font-bold text-white">DevBoard</h1>
          <p className="text-gray-400 text-sm">Project management for vibe coders</p>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-8">
        <ProjectManager />
      </main>
    </div>
  );
}
