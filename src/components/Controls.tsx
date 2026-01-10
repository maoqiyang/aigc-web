import React from 'react';
import { useVideoStore } from '../store/videoStore';
import { Upload, X } from 'lucide-react';

export const Controls = () => {
  const { params, setParams, status, mode } = useVideoStore();
  const disabled = status === 'generating' || status === 'polling';

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
      <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">设置</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Model Selection - Only for single and continuous mode */}
        {(mode === 'single' || mode === 'continuous') && (
        <div className="space-y-2 col-span-full">
          <label className="text-xs font-medium text-gray-500">模型选择</label>
          <select 
            value={params.model}
            onChange={(e) => setParams({ model: e.target.value })}
            disabled={disabled}
            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          >
            <option value="doubao-seedance-1-5-pro-251215">Doubao Seedance 1.5 Pro</option>
            <option value="doubao-seedance-1-0-pro-250528">Doubao Seedance 1.0 Pro</option>
            <option value="doubao-seedance-1-0-pro-fast-251015">Doubao Seedance 1.0 Pro Fast</option>
          </select>
        </div>
        )}

        {/* Resolution */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-500">分辨率</label>
          <select 
            value={params.resolution}
            onChange={(e) => setParams({ resolution: e.target.value })}
            disabled={disabled}
            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          >
            <option value="480p">480p</option>
            <option value="720p">720p</option>
            <option value="1080p">1080p</option>
          </select>
        </div>

        {/* Ratio */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-500">比例</label>
          <select 
            value={params.ratio}
            onChange={(e) => setParams({ ratio: e.target.value })}
            disabled={disabled}
            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          >
            <option value="21:9">21:9</option>
            <option value="16:9">16:9</option>
            <option value="4:3">4:3</option>
            <option value="1:1">1:1</option>
            <option value="3:4">3:4</option>
            <option value="9:16">9:16</option>
          </select>
        </div>

        {/* Duration */}
        <div className="space-y-2 col-span-full">
          <div className="flex justify-between">
            <label className="text-xs font-medium text-gray-500">时长 (秒)</label>
            <span className="text-xs font-bold text-gray-900">{params.duration}s</span>
          </div>
          <input 
            type="range" 
            min="1" 
            max="12" 
            step="1"
            value={params.duration}
            onChange={(e) => setParams({ duration: parseInt(e.target.value) })}
            disabled={disabled}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>

        {/* Toggles */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
          <span className="text-sm font-medium text-gray-700">水印</span>
          <button
            onClick={() => setParams({ wm: !params.wm })}
            disabled={disabled}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${params.wm ? 'bg-blue-600' : 'bg-gray-200'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out ${params.wm ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
          <span className="text-sm font-medium text-gray-700">固定机位</span>
          <button
            onClick={() => setParams({ cf: !params.cf })}
            disabled={disabled}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${params.cf ? 'bg-blue-600' : 'bg-gray-200'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out ${params.cf ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>

        {/* Video Count */}
        <div className={`space-y-2 col-span-full ${mode !== 'single' ? 'opacity-50 grayscale pointer-events-none' : ''}`}>
            <div className="flex justify-between">
                <label className="text-xs font-medium text-gray-500">生成数量</label>
                <span className="text-xs font-bold text-gray-900">{mode !== 'single' ? 1 : params.count}</span>
            </div>
            <div className="flex gap-2">
                {[1, 2, 3, 4].map((num) => (
                    <button
                        key={num}
                        onClick={() => setParams({ count: num })}
                        disabled={disabled || mode !== 'single'}
                        className={`flex-1 py-2 text-sm font-medium rounded-lg border transition-all ${
                            params.count === num && mode === 'single'
                                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                        } ${mode !== 'single' && num === 1 ? 'bg-gray-100 border-gray-300' : ''}`}
                    >
                        {num}
                    </button>
                ))}
            </div>
            {mode !== 'single' && (
                <p className="text-xs text-gray-400 italic">在连续/参考图模式下，生成数量固定为 1</p>
            )}
        </div>
      </div>
    </div>
  );
};
