import React from 'react';
import { useVideoStore } from '../store/videoStore';
import { Plus, Trash2, Upload, X, Play } from 'lucide-react';

export const ContinuousGenerator = () => {
  const { continuousPrompts, setContinuousPrompts, generateContinuousVideo, status, params, setParams } = useVideoStore();
  const isGenerating = status === 'generating' || status === 'polling';

  const handleAddPrompt = () => {
    setContinuousPrompts([...continuousPrompts, '']);
  };

  const handleRemovePrompt = (index: number) => {
    const newPrompts = [...continuousPrompts];
    newPrompts.splice(index, 1);
    setContinuousPrompts(newPrompts);
  };

  const handlePromptChange = (index: number, value: string) => {
    const newPrompts = [...continuousPrompts];
    newPrompts[index] = value;
    setContinuousPrompts(newPrompts);
  };

  const handleStartImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setParams({ startImage: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">连续视频生成</h2>
        <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-full font-medium">Beta</span>
      </div>

      {/* Initial Image */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">首帧图片 (可选)</label>
        <div className="relative">
            <input
                type="file"
                accept="image/*"
                onChange={handleStartImageUpload}
                className="hidden"
                id="continuous-start-image"
                disabled={isGenerating}
            />
            <label
                htmlFor="continuous-start-image"
                className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                    params.startImage ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:bg-gray-50'
                }`}
            >
                {params.startImage ? (
                    <div className="relative w-full h-full group">
                        <img src={params.startImage} alt="Start frame" className="w-full h-full object-contain p-2" />
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                setParams({ startImage: undefined });
                            }}
                            className="absolute top-1 right-1 p-1 bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center pt-5 pb-6">
                        <Upload className="w-6 h-6 text-gray-400 mb-2" />
                        <p className="text-xs text-gray-500">上传首帧</p>
                    </div>
                )}
            </label>
        </div>
      </div>

      {/* Prompts List */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-gray-700">剧情描述</label>
            <button 
                onClick={handleAddPrompt}
                disabled={isGenerating}
                className="text-xs flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium"
            >
                <Plus className="w-3 h-3" /> 添加场景
            </button>
        </div>
        
        <div className="space-y-3">
            {continuousPrompts.map((prompt, index) => (
                <div key={index} className="relative group">
                    <span className="absolute left-3 top-3 text-xs font-mono text-gray-400">场景 {index + 1}</span>
                    <textarea
                        value={prompt}
                        onChange={(e) => handlePromptChange(index, e.target.value)}
                        placeholder={`描述第 ${index + 1} 个场景...`}
                        disabled={isGenerating}
                        className="w-full pl-16 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none h-24"
                    />
                    {continuousPrompts.length > 1 && (
                        <button
                            onClick={() => handleRemovePrompt(index)}
                            disabled={isGenerating}
                            className="absolute right-2 top-2 p-1.5 text-gray-400 hover:text-red-500 rounded-md hover:bg-red-50 transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                </div>
            ))}
        </div>
      </div>

      <button
        onClick={generateContinuousVideo}
        disabled={isGenerating || continuousPrompts.some(p => !p.trim())}
        className={`w-full py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-white font-medium transition-all ${
          isGenerating || continuousPrompts.some(p => !p.trim())
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg'
        }`}
      >
        {isGenerating ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            生成连续视频中...
          </>
        ) : (
          <>
            <Play className="w-5 h-5" />
            生成连续视频
          </>
        )}
      </button>
    </div>
  );
};
