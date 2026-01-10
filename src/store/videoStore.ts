import { create } from 'zustand';

interface VideoParams {
  resolution: string;
  ratio: string;
  duration: number;
  wm: boolean;
  cf: boolean;
  count: number;
  startImage?: string;
  endImage?: string;
  model: string;
}

interface VideoResult {
  url: string;
  generationTime: number;
  tokenUsage: number;
  prompt: string;
  taskId: string;
  rawResponse?: any;
}

interface VideoState {
  prompt: string;
  continuousPrompts: string[];
  referenceImages: string[];
  mode: 'single' | 'continuous' | 'reference';
  params: VideoParams;
  status: 'idle' | 'generating' | 'polling' | 'success' | 'failed';
  taskId: string | null;
  videoResults: VideoResult[];
  stitchedVideoUrl: string | null;
  error: string | null;
  
  setPrompt: (prompt: string) => void;
  setContinuousPrompts: (prompts: string[]) => void;
  setReferenceImages: (images: string[]) => void;
  setMode: (mode: 'single' | 'continuous' | 'reference') => void;
  setParams: (params: Partial<VideoParams>) => void;
  generateVideo: () => Promise<void>;
  generateContinuousVideo: () => Promise<void>;
  generateReferenceVideo: () => Promise<void>;
  reset: () => void;
}

export const useVideoStore = create<VideoState>((set, get) => ({
  prompt: '',
  continuousPrompts: [''],
  referenceImages: [],
  mode: 'single',
  params: {
    resolution: '720p',
    ratio: '16:9',
    duration: 5,
    wm: true,
    cf: false,
    count: 1,
    model: 'doubao-seedance-1-5-pro-251215'
  },
  status: 'idle',
  taskId: null,
  videoResults: [],
  stitchedVideoUrl: null,
  error: null,

  setPrompt: (prompt) => set({ prompt }),
  setContinuousPrompts: (prompts) => set({ continuousPrompts: prompts }),
  setReferenceImages: (images) => set({ referenceImages: images }),
  setMode: (mode) => set({ mode }),
  setParams: (newParams) => set((state) => ({ params: { ...state.params, ...newParams } })),
  
  generateContinuousVideo: async () => {
      // ... (existing implementation)
      const { continuousPrompts, params } = get();
      if (continuousPrompts.some(p => !p.trim())) return;

      set({ status: 'generating', error: null, videoResults: [], stitchedVideoUrl: null });
      
      let currentStartImage = params.startImage;
      const results: VideoResult[] = [];

      try {
          for (let i = 0; i < continuousPrompts.length; i++) {
              const prompt = continuousPrompts[i];
              const startTime = Date.now();

              // Call generate API
              const res = await fetch('/api/video/generate', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ 
                      ...params, 
                      prompt, 
                      count: 1, 
                      startImage: currentStartImage,
                      endImage: i === continuousPrompts.length - 1 ? params.endImage : undefined, 
                      return_last_frame: true 
                  })
              });
              
              const data = await res.json();
              if (!res.ok) throw new Error(data.error || 'Failed to start generation');
              
              const taskId = data.id;
              set({ taskId, status: 'polling' }); 

              let segmentResult: any = null;
              while (!segmentResult) {
                  await new Promise(r => setTimeout(r, 2000));
                  const statusRes = await fetch(`/api/video/status/${taskId}`);
                  const statusData = await statusRes.json();
                  
                  if (statusData.status === 'succeeded') {
                      segmentResult = statusData;
                  } else if (statusData.status === 'failed') {
                      throw new Error(statusData.error?.message || 'Segment generation failed');
                  }
              }

              const content = segmentResult.content;
              let url = '';
              let lastFrameUrl = '';
              
              if (Array.isArray(content)) {
                  const videoItem = content.find((c: any) => c.type === 'video' || c.video_url);
                  if (videoItem) url = videoItem.video_url || videoItem.url;
                  
                  const imageItem = content.find((c: any) => c.role === 'last_frame' || (c.type === 'image_url' && !c.role));
                  if (imageItem) {
                      lastFrameUrl = imageItem.image_url?.url || imageItem.url;
                  }
              } else if (content && typeof content === 'object') {
                   const c = content as any;
                   if (c.video_url) url = c.video_url;
                   if (c.last_frame_url) lastFrameUrl = c.last_frame_url;
              }

              if (!url) throw new Error('Video URL not found');

              const endTime = Date.now();
              results.push({
                  url,
                  generationTime: (endTime - startTime) / 1000,
                  tokenUsage: segmentResult.usage?.total_tokens || 0,
                  prompt,
                  taskId,
                  rawResponse: segmentResult
              });

              set({ videoResults: [...results] });

              if (lastFrameUrl) {
                  currentStartImage = lastFrameUrl;
              }
          }

          set({ status: 'generating' }); 
          const stitchRes = await fetch('/api/video/stitch', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ videoUrls: results.map(r => r.url) })
          });
          
          if (!stitchRes.ok) throw new Error('Stitching failed');
          const stitchData = await stitchRes.json();
          
          set({ status: 'success', stitchedVideoUrl: stitchData.url });

      } catch (error: any) {
          set({ status: 'failed', error: error.message });
      }
  },

  generateReferenceVideo: async () => {
    const { prompt, params, referenceImages } = get();
    if (!prompt.trim()) return;
    if (referenceImages.length === 0) {
        set({ error: 'At least one reference image is required' });
        return;
    }

    set({ status: 'generating', error: null, videoResults: [] });

    try {
        const startTime = Date.now();
        const res = await fetch('/api/video/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                prompt, 
                ...params, 
                count: 1, 
                referenceImages,
                // Force model for reference mode as per requirement/SDK?
                // User said "function 3 cannot select model", which implies it is fixed or not selectable in UI.
                // But user also listed models for Function 1 and 2.
                // The SDK for reference image uses "doubao-seedance-1-0-lite-i2v-250428".
                // Let's stick to that for now, ignoring params.model if it's different.
                model: 'doubao-seedance-1-0-lite-i2v-250428'
            })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to start generation');

        const taskId = data.id;
        set({ taskId, status: 'polling' });

        const pollInterval = setInterval(async () => {
            try {
                const statusRes = await fetch(`/api/video/status/${taskId}`);
                const statusData = await statusRes.json();

                if (statusData.status === 'succeeded') {
                    clearInterval(pollInterval);
                    const content = statusData.content;
                    let url = '';
                    if (Array.isArray(content)) {
                        url = content[0]?.video_url || content[0]?.url || '';
                    } else if (content && typeof content === 'object') {
                        url = content.video_url || content.url || '';
                    }

                    if (url) {
                         const endTime = Date.now();
                         set({ 
                             status: 'success', 
                             videoResults: [{
                                 url,
                                 generationTime: (endTime - startTime) / 1000,
                                 tokenUsage: statusData.usage?.total_tokens || 0,
                                 prompt,
                                 taskId,
                                 rawResponse: statusData
                             }] 
                         });
                    } else {
                        set({ status: 'failed', error: "Video URL not found in response" });
                    }
                } else if (statusData.status === 'failed') {
                    clearInterval(pollInterval);
                    set({ status: 'failed', error: statusData.error?.message || 'Task failed' });
                }
            } catch (err) {
                console.error("Polling error", err);
            }
        }, 2000);

    } catch (error: any) {
        set({ status: 'failed', error: error.message });
    }
  },


  generateVideo: async () => {
    const { prompt, params } = get();
    if (!prompt.trim()) return;

    set({ status: 'generating', error: null, videoResults: [] });
    const count = params.count || 1;
    const requests = [];

    try {
        // Send multiple requests based on count
        for (let i = 0; i < count; i++) {
            // Add delay between requests to avoid rate limiting
            if (i > 0) await new Promise(resolve => setTimeout(resolve, 500));
            
            const startTime = Date.now();
            requests.push(fetch('/api/video/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // Override count to 1 for individual requests to backend
                body: JSON.stringify({ prompt, ...params, count: 1 })
            }).then(async res => {
                // Handle non-JSON responses (e.g. 429/500 plain text)
                const contentType = res.headers.get("content-type");
                let data;
                if (contentType && contentType.indexOf("application/json") !== -1) {
                    data = await res.json();
                } else {
                    const text = await res.text();
                    data = { error: text || res.statusText };
                }

                if (!res.ok) {
                    // Check if it's a rate limit error (429)
                    if (res.status === 429) {
                         // Although rate limit is disabled in backend, keeping this for robustness
                         return { error: 'Too many requests. Please try reducing the video count or waiting a moment.' };
                    }
                    return { error: data.error || 'Failed to start generation' };
                }
                return { ...data, startTime };
            }));
        }

        const responses = await Promise.all(requests);
        
        // Check for errors in any response
        const errorResponse = responses.find(r => r.error);
        if (errorResponse) {
             throw new Error(errorResponse.error || 'Failed to start generation');
        }

        const tasks = responses.map(r => ({ id: r.id, startTime: r.startTime, formattedPrompt: r.formattedPrompt }));
        const taskIds = tasks.map(t => t.id);
        
        set({ taskId: taskIds.join(','), status: 'polling' });

        // Polling logic for multiple tasks
        const pollInterval = setInterval(async () => {
            try {
                const statusPromises = taskIds.map((id: string) => fetch(`/api/video/status/${id}`).then(res => res.json()));
                const statuses = await Promise.all(statusPromises);
                
                const allSucceeded = statuses.every((s: any) => s.status === 'succeeded');
                const anyFailed = statuses.find((s: any) => s.status === 'failed');

                if (anyFailed) {
                    clearInterval(pollInterval);
                    set({ status: 'failed', error: anyFailed.error?.message || 'One or more tasks failed' });
                } else if (allSucceeded) {
                    clearInterval(pollInterval);
                    
                    // Collect all video URLs and stats per video
                    const results: VideoResult[] = [];
                    
                    statuses.forEach((statusData: any, index: number) => {
                         const content = statusData.content;
                         let url = '';
                         if (Array.isArray(content)) {
                             url = content[0]?.video_url || content[0]?.url || '';
                         } else if (content && typeof content === 'object') {
                             url = content.video_url || content.url || '';
                         }
                         
                         if (url) {
                             const endTime = Date.now();
                             // Use individual start time if available, otherwise fallback
                             const startTime = tasks[index].startTime;
                             const duration = (endTime - startTime) / 1000;
                             
                             results.push({
                                 url,
                                 generationTime: duration,
                                 tokenUsage: statusData.usage?.total_tokens || 0,
                                 prompt: tasks[index].formattedPrompt,
                                 taskId: tasks[index].id,
                                 rawResponse: statusData
                             });
                         }
                    });

                    if (results.length > 0) {
                        set({ status: 'success', videoResults: results });
                    } else {
                        set({ status: 'failed', error: "Video URLs not found in responses" });
                    }
                }
                // If any is still running, continue polling
            } catch (err) {
                console.error("Polling error", err);
            }
        }, 4000);

    } catch (error: any) {
        const errorMessage = error.message || "An error occurred";
        set({ status: 'failed', error: errorMessage });
    }
  },

  reset: () => set({ status: 'idle', taskId: null, videoResults: [], error: null })
}));
