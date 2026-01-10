import React from 'react';
import { Header } from './components/Header';
import { VideoGenerator } from './components/VideoGenerator';
import { ContinuousGenerator } from './components/ContinuousGenerator';
import { ReferenceGenerator } from './components/ReferenceGenerator';
import { Controls } from './components/Controls';
import { Result } from './components/Result';
import { ContinuousResult } from './components/ContinuousResult';
import { useVideoStore } from './store/videoStore';
import { Layers, Film, Image as ImageIcon } from 'lucide-react';

function App() {
  const { mode, setMode } = useVideoStore();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Mode Switcher */}
        <div className="flex justify-center mb-8">
            <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-100 inline-flex">
                <button
                    onClick={() => setMode('single')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        mode === 'single'
                            ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-200'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                >
                    <Layers className="w-4 h-4" />
                    标准模式
                </button>
                <button
                    onClick={() => setMode('continuous')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        mode === 'continuous'
                            ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-200'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                >
                    <Film className="w-4 h-4" />
                    连续故事
                </button>
                <button
                    onClick={() => setMode('reference')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        mode === 'reference'
                            ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-200'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                >
                    <ImageIcon className="w-4 h-4" />
                    参考图生成
                </button>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Input & Settings */}
          <div className="lg:col-span-4 space-y-6">
            {mode === 'single' && <VideoGenerator />}
            {mode === 'continuous' && <ContinuousGenerator />}
            {mode === 'reference' && <ReferenceGenerator />}
            <Controls />
          </div>
          
          {/* Right Column: Result */}
          <div className="lg:col-span-8">
            {mode === 'continuous' ? <ContinuousResult /> : <Result />}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
