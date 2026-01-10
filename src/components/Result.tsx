import React from 'react';
import { useVideoStore } from '../store/videoStore';
import { Download, AlertCircle, Sparkles, FileJson } from 'lucide-react';

export const Result = () => {
  const { videoResults, status, error } = useVideoStore();

  if (status === 'idle' || (status === 'generating' && videoResults.length === 0)) {
    return (
      <div className="h-full min-h-[400px] bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 space-y-3">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
          <Sparkles className="w-8 h-8 text-gray-300" />
        </div>
        <p className="text-sm">生成的视频将显示在这里</p>
      </div>
    );
  }

  if (status === 'polling') {
    return (
      <div className="h-full min-h-[400px] bg-gray-50 rounded-xl border border-gray-200 flex flex-col items-center justify-center space-y-4">
        <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <div className="text-center space-y-1">
          <h3 className="text-gray-900 font-medium">视频生成中</h3>
          <p className="text-sm text-gray-500">这通常需要 30-60 秒...</p>
        </div>
      </div>
    );
  }

  if (status === 'failed' || error) {
    return (
      <div className="h-full min-h-[200px] bg-red-50 rounded-xl border border-red-200 flex flex-col items-center justify-center space-y-3 p-6">
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
          <AlertCircle className="w-6 h-6 text-red-600" />
        </div>
        <h3 className="text-red-900 font-medium">生成失败</h3>
        <p className="text-sm text-red-700 text-center max-w-[80%] break-words">
          {error || "发生未知错误"}
        </p>
      </div>
    );
  }

  if (status === 'success' && videoResults.length > 0) {
    return (
      <div className="space-y-6">
        <div className={`grid gap-6 ${videoResults.length > 1 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
            {videoResults.map((result, index) => (
                <div key={index} className="space-y-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col">
                    {/* Video Player - Fixed height container to ensure consistency */}
                    <div className="space-y-2 flex-shrink-0">
                        <div className="relative rounded-lg overflow-hidden bg-black aspect-video shadow-md group w-full">
                            <video 
                                src={result.url} 
                                controls 
                                className="w-full h-full object-contain"
                                loop
                            />
                        </div>
                        <div className="flex justify-between items-center px-1">
                            <span className="text-sm font-medium text-gray-500">视频 {index + 1}</span>
                            <a 
                                href={result.url} 
                                download 
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                            >
                                <Download className="w-3.5 h-3.5" />
                                下载
                            </a>
                        </div>
                    </div>

                    {/* Stats for this video - Takes remaining space */}
                    <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-xs border border-gray-100 flex-grow">
                        <div className="grid grid-cols-2 gap-2">
                            <div className="col-span-2">
                                <span className="text-gray-500 block">Task ID</span>
                                <span className="font-mono text-gray-700 break-all select-all">{result.taskId}</span>
                            </div>
                            <div>
                                <span className="text-gray-500 block">耗时</span>
                                <span className="font-mono text-gray-700">{result.generationTime?.toFixed(2)}s</span>
                            </div>
                            <div>
                                <span className="text-gray-500 block">消耗 Token</span>
                                <span className="font-mono text-gray-700">{result.tokenUsage}</span>
                            </div>
                        </div>
                        <div>
                            <span className="text-gray-500 block mb-1">提示词</span>
                            <div className="bg-white p-1.5 rounded border border-gray-200 font-mono text-gray-600 break-all max-h-[100px] overflow-y-auto" title={result.prompt}>
                                {result.prompt}
                            </div>
                        </div>

                        {result.rawResponse && (
                            <details className="group border-t border-gray-100 pt-2 mt-2">
                                <summary className="cursor-pointer text-gray-500 hover:text-blue-600 flex items-center gap-1.5 py-1 select-none transition-colors">
                                    <FileJson className="w-3.5 h-3.5" />
                                    <span className="font-medium">API 原始响应</span>
                                </summary>
                                <div className="mt-2 bg-gray-900 rounded-md p-3 overflow-hidden shadow-inner">
                                     <pre className="text-[10px] leading-relaxed text-green-400 font-mono overflow-x-auto whitespace-pre-wrap max-h-[200px] scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                                        {JSON.stringify(result.rawResponse, null, 2)}
                                     </pre>
                                </div>
                            </details>
                        )}
                    </div>
                </div>
            ))}
        </div>
      </div>
    );
  }
  
  return null;
};
