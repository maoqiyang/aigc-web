import React from 'react';
import { Video } from 'lucide-react';

export const Header = () => {
  return (
    <header className="py-6 border-b border-gray-100 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-lg">
            <Video className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">AI 视频生成</h1>
            <p className="text-xs text-gray-500">基于 Doubao Seedance 模型</p>
          </div>
        </div>
      </div>
    </header>
  );
};
