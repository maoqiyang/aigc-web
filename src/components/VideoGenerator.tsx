import React from 'react';
import { useVideoStore } from '../store/videoStore';
import { Loader2, Sparkles, Upload, X } from 'lucide-react';

export const VideoGenerator = () => {
  const { prompt, setPrompt, generateVideo, status, error, params, setParams } = useVideoStore();
  const isGenerating = status === 'generating' || status === 'polling';

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'start' | 'end') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'start') setParams({ startImage: reader.result as string });
        else setParams({ endImage: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-900">提示词</label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="描述您想要生成的视频内容..."
          disabled={isGenerating}
          className="w-full h-32 p-4 bg-gray-50 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-gray-400 text-sm"
        />
      </div>

      {/* Image Uploads */}
      <div className="space-y-2">
          <label className="text-xs font-medium text-gray-500">参考图片</label>
          <div className="grid grid-cols-2 gap-4">
              {/* Start Image */}
              <div className="relative">
                  <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'start')}
                      className="hidden"
                      id="start-image-upload"
                      disabled={isGenerating}
                  />
                  <label
                      htmlFor="start-image-upload"
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
                              <p className="text-xs text-gray-500">首帧图片</p>
                          </div>
                      )}
                  </label>
              </div>

              {/* End Image */}
              <div className="relative">
                  <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'end')}
                      className="hidden"
                      id="end-image-upload"
                      disabled={isGenerating}
                  />
                  <label
                      htmlFor="end-image-upload"
                      className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                          params.endImage ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:bg-gray-50'
                      }`}
                  >
                      {params.endImage ? (
                          <div className="relative w-full h-full group">
                              <img src={params.endImage} alt="End frame" className="w-full h-full object-contain p-2" />
                              <button
                                  onClick={(e) => {
                                      e.preventDefault();
                                      setParams({ endImage: undefined });
                                  }}
                                  className="absolute top-1 right-1 p-1 bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                  <X className="w-3 h-3" />
                              </button>
                          </div>
                      ) : (
                          <div className="flex flex-col items-center pt-5 pb-6">
                              <Upload className="w-6 h-6 text-gray-400 mb-2" />
                              <p className="text-xs text-gray-500">尾帧图片</p>
                          </div>
                      )}
                  </label>
              </div>
          </div>
      </div>

      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100">
          {error}
        </div>
      )}

      <button
        onClick={generateVideo}
        disabled={isGenerating || !prompt.trim()}
        className="w-full flex items-center justify-center gap-2 p-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>生成中...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            <span>生成视频</span>
          </>
        )}
      </button>
    </div>
  );
};
