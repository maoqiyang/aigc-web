# AI Video Generator (基于 Doubao Seedance)

这是一个功能强大的 AI 视频生成 Web 应用，基于字节跳动火山引擎（Volcengine）的 **Doubao Seedance** 系列模型开发。支持文生视频、图生视频、连续故事创作以及角色一致性视频生成。

![Project Preview](public/preview.png)
*(建议在此处添加一张项目运行截图)*

## ✨ 核心功能

1.  **标准模式 (Standard Mode)**
    *   **文生视频**：输入提示词生成高质量视频。
    *   **图生视频**：支持上传**首帧**和**尾帧**图片，控制视频的起始和结束画面。
    *   **全参数调节**：支持分辨率、长宽比、时长（1-12秒）、水印开关、固定机位开关及生成数量设置。
    *   **多模型支持**：集成 `Doubao Seedance 1.5 Pro`、`1.0 Pro` 及 `1.0 Pro Fast` 模型。

2.  **连续故事模式 (Continuous Story Mode)**
    *   **剧本编排**：支持动态添加多个场景（Prompt），构建连贯的故事情节。
    *   **自动衔接**：自动将上一片段的尾帧作为下一片段的首帧，确保画面流畅过渡。
    *   **智能拼接**：生成完成后，后端自动调用 FFmpeg 将所有片段无缝拼接为一个完整的长视频。

3.  **参考图模式 (Reference Image Mode)**
    *   **角色一致性**：支持上传 1-4 张参考图片。
    *   **精准控制**：在提示词中使用 `[图1]`、`[图2]` 等占位符引用特定图片，实现对视频中角色或物体的精准控制。
    *   *注：此模式强制使用 `Doubao Seedance 1.0 Lite` 模型。*

4.  **高级特性**
    *   **任务追踪**：实时显示生成进度、耗时统计及 Token 消耗。
    *   **透明化调试**：前端直接透出火山引擎 API 的 **Task ID** 及 **原始响应体 (Raw Response)**，方便开发者调试。
    *   **安全设计**：API Key 通过环境变量管理，杜绝硬编码泄露风险。

## 🛠 技术栈

*   **前端**：React 18, Vite, Tailwind CSS, Zustand (状态管理), Lucide React (图标)
*   **后端**：Node.js, Express, TypeScript
*   **工具**：FFmpeg (视频处理), Axios (网络请求)

## 🚀 快速开始

### 1. 环境准备

确保您的开发环境已安装以下工具：
*   [Node.js](https://nodejs.org/) (v16+)
*   [FFmpeg](https://ffmpeg.org/) (用于视频拼接，需添加到系统环境变量 PATH 中)
*   [Volcengine API Key](https://console.volcengine.com/ark/region:ark+cn-beijing/apikey) (开通火山引擎方舟平台服务)

### 2. 安装依赖

```bash
cd video-gen-app
npm install
```

### 3. 配置环境变量

在 `video-gen-app` 目录下创建 `.env` 文件（已提供模板），并填入您的 API Key：

```env
# .env
ARK_API_KEY=your_volcengine_api_key_here
PORT=3000
```

### 4. 启动项目

```bash
npm run dev
```

启动成功后：
*   前端页面：`http://localhost:5173`
*   后端服务：`http://localhost:3000`

## 🐳 Docker 部署

本项目支持 Docker 一键部署。

1.  修改 `docker-compose.yml` 或创建 `.env` 文件填入 API Key。
2.  运行命令：

```bash
docker-compose up --build
```

## 📂 项目结构

```
video-gen-app/
├── api/                # 后端源码
│   ├── routes/         # 路由定义
│   ├── services/       # 业务逻辑 (Volcengine SDK, FFmpeg)
│   └── server.ts       # 后端入口
├── src/                # 前端源码
│   ├── components/     # React 组件
│   ├── store/          # Zustand 状态管理
│   └── App.tsx         # 主应用
├── temp/               # 临时视频存储目录 (自动生成)
├── Dockerfile.frontend # 前端构建文件
├── Dockerfile.backend  # 后端构建文件
└── docker-compose.yml  # Docker 编排文件
```

## ⚠️ 注意事项

*   **FFmpeg**：连续视频生成功能强依赖于 FFmpeg，请务必确保服务器或本地环境已正确安装。
*   **API 额度**：视频生成消耗 Token 较多，请关注火山引擎控制台的配额使用情况。

## 📄 License

MIT License
