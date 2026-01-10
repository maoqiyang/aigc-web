import React from 'react';
import { useVideoStore } from '../store/videoStore';
import { Download, AlertCircle, Sparkles, Film, ArrowRight, FileJson } from 'lucide-react';

export const ContinuousResult = () => {
  const { videoResults, status, error, stitchedVideoUrl } = useVideoStore();

  if (status === 'idle' || (status === 'generating' && videoResults.length === 0)) {
    return (
      <div className="h-full min-h-[400px] bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 space-y-3">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
          <Film className="w-8 h-8 text-gray-300" />
        </div>
        <p className="text-sm">连续视频序列将显示在这里</p>
      </div>
    );
  }

  if (status === 'failed' && videoResults.length === 0) {
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

  return (
    <div className="space-y-8">
        {/* Stitched Video (Final Result) */}
        {stitchedVideoUrl && (
            <div className="bg-white p-6 rounded-xl border border-blue-100 shadow-sm space-y-4 ring-2 ring-blue-500/10">
                <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">最终合成视频</h3>
                </div>
                <div className="relative rounded-xl overflow-hidden bg-black aspect-video shadow-lg">
                    <video 
                        src={stitchedVideoUrl} 
                        controls 
                        className="w-full h-full object-contain"
                        loop
                    />
                </div>
                <div className="flex justify-end">
                    <a 
                        href={stitchedVideoUrl} 
                        download="stitched_video.mp4"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                    >
                        <Download className="w-4 h-4" />
                        下载完整视频
                    </a>
                </div>
            </div>
        )}

        {/* Progress / Segments */}
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">生成序列</h4>
                {status === 'generating' && !stitchedVideoUrl && videoResults.length > 0 && (
                    <span className="text-xs text-blue-600 animate-pulse font-medium">正在处理场景 {videoResults.length + 1}...</span>
                )}
            </div>
            
            <div className="grid gap-6 grid-cols-1">
                {videoResults.map((result, index) => (
                    <div key={index} className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm relative overflow-hidden">
                        {/* Timeline Connector */}
                        {index < videoResults.length - 1 && (
                            <div className="hidden sm:block absolute left-[8.5rem] top-[8rem] bottom-[-2rem] w-0.5 bg-gray-200 z-0"></div>
                        )}
                        
                        {/* Video Thumbnail/Player */}
                        <div className="w-full sm:w-64 flex-shrink-0 z-10">
                            <div className="relative rounded-lg overflow-hidden bg-black aspect-video shadow-md">
                                <video 
                                    src={result.url} 
                                    controls 
                                    className="w-full h-full object-contain"
                                    loop
                                />
                            </div>
                            <div className="mt-2 text-center">
                                <span className="text-xs font-mono text-gray-500">场景 {index + 1}</span>
                            </div>
                        </div>

                        {/* Details */}
                        <div className="flex-grow space-y-2 py-1 min-w-0">
                             <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                    <div className="bg-blue-50 text-blue-700 text-xs font-medium px-2 py-1 rounded inline-block">
                                        {result.generationTime?.toFixed(1)}s
                                    </div>
                                    <div className="text-xs text-gray-500 font-mono">
                                        ID: {result.taskId}
                                    </div>
                                </div>
                                <a 
                                    href={result.url} 
                                    download 
                                    className="text-gray-400 hover:text-gray-600 p-1"
                                >
                                    <Download className="w-4 h-4" />
                                </a>
                             </div>
                             <p className="text-sm text-gray-600 italic border-l-2 border-gray-200 pl-3 py-1">
                                "{result.prompt}"
                             </p>

                             {result.rawResponse && (
                                <details className="group mt-2">
                                    <summary className="cursor-pointer text-gray-400 hover:text-blue-600 flex items-center gap-1.5 py-1 select-none transition-colors text-xs">
                                        <FileJson className="w-3 h-3" />
                                        <span className="font-medium">API 原始响应</span>
                                    </summary>
                                    <div className="mt-1 bg-gray-900 rounded-md p-2 overflow-hidden shadow-inner">
                                         <pre className="text-[10px] leading-relaxed text-green-400 font-mono overflow-x-auto whitespace-pre-wrap max-h-[150px] scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                                            {JSON.stringify(result.rawResponse, null, 2)}
                                         </pre>
                                    </div>
                                </details>
                             )}
                        </div>
                    </div>
                ))}

                {/* Loading State for next segment */}
                {(status === 'generating' || status === 'polling') && !stitchedVideoUrl && (
                    <div className="flex flex-col sm:flex-row gap-4 bg-gray-50 p-4 rounded-xl border border-dashed border-gray-200 opacity-70 animate-pulse">
                         <div className="w-full sm:w-64 aspect-video bg-gray-200 rounded-lg"></div>
                         <div className="flex-grow space-y-2">
                             <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                             <div className="h-12 bg-gray-200 rounded w-full"></div>
                         </div>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};
