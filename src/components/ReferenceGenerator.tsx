import React from 'react';
import { useVideoStore } from '../store/videoStore';
import { Loader2, Sparkles, Upload, X, ImagePlus } from 'lucide-react';

export const ReferenceGenerator = () => {
  const { prompt, setPrompt, generateReferenceVideo, status, error, referenceImages, setReferenceImages } = useVideoStore();
  const isGenerating = status === 'generating' || status === 'polling';

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages: string[] = [];
      const readers: Promise<void>[] = [];

      // Limit to 4 images total
      const remainingSlots = 4 - referenceImages.length;
      const filesToProcess = Array.from(files).slice(0, remainingSlots);

      if (filesToProcess.length === 0) return;

      filesToProcess.forEach(file => {
        const reader = new FileReader();
        readers.push(new Promise((resolve) => {
          reader.onloadend = () => {
            newImages.push(reader.result as string);
            resolve();
          };
          reader.readAsDataURL(file);
        }));
      });

      Promise.all(readers).then(() => {
        setReferenceImages([...referenceImages, ...newImages]);
      });
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...referenceImages];
    newImages.splice(index, 1);
    setReferenceImages(newImages);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">参考图视频生成</h2>
        <span className="text-xs px-2 py-1 bg-purple-50 text-purple-700 rounded-full font-medium">New</span>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-900">提示词</label>
        <div className="text-xs text-gray-500 mb-1">
          提示: 使用 <code className="bg-gray-100 px-1 rounded">[图1]</code>, <code className="bg-gray-100 px-1 rounded">[图2]</code> 等来引用您上传的图片。
        </div>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="例如: [图1] 戴着眼镜和 [图2] 的小狗坐在 [图3] 的草坪上..."
          disabled={isGenerating}
          className="w-full h-32 p-4 bg-gray-50 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all placeholder:text-gray-400 text-sm"
        />
      </div>

      {/* Reference Images */}
      <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-gray-700">参考图片 (1-4张)</label>
            <span className="text-xs text-gray-500">{referenceImages.length}/4</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
              {referenceImages.map((img, index) => (
                  <div key={index} className="relative aspect-square group rounded-lg overflow-hidden border border-gray-200">
                      <img src={img} alt={`Reference ${index + 1}`} className="w-full h-full object-cover" />
                      <div className="absolute top-1 left-1 bg-black/50 text-white text-xs px-1.5 py-0.5 rounded">
                          [图{index + 1}]
                      </div>
                      <button
                          onClick={() => removeImage(index)}
                          disabled={isGenerating}
                          className="absolute top-1 right-1 p-1 bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                          <X className="w-3 h-3" />
                      </button>
                  </div>
              ))}
              
              {referenceImages.length < 4 && (
                  <div className="relative aspect-square">
                      <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageUpload}
                          className="hidden"
                          id="ref-image-upload"
                          disabled={isGenerating}
                      />
                      <label
                          htmlFor="ref-image-upload"
                          className="flex flex-col items-center justify-center w-full h-full border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                          <ImagePlus className="w-6 h-6 text-gray-400 mb-2" />
                          <span className="text-xs text-gray-500">添加图片</span>
                      </label>
                  </div>
              )}
          </div>
      </div>

      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100">
          {error}
        </div>
      )}

      <button
        onClick={generateReferenceVideo}
        disabled={isGenerating || !prompt.trim() || referenceImages.length === 0}
        className={`w-full flex items-center justify-center gap-2 p-3 text-white font-medium rounded-lg transition-all shadow-sm hover:shadow-md ${
            isGenerating || !prompt.trim() || referenceImages.length === 0
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-purple-600 hover:bg-purple-700'
        }`}
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
