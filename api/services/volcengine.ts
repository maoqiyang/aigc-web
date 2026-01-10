import axios from 'axios';

const API_KEY = process.env.ARK_API_KEY;
if (!API_KEY) {
    throw new Error("ARK_API_KEY is missing. Please set it in .env file.");
}
const BASE_URL = "https://ark.cn-beijing.volces.com/api/v3";

interface VideoTaskParams {
  prompt: string;
  resolution?: string;
  ratio?: string;
  duration?: number;
  wm?: boolean;
  cf?: boolean;
  count?: number;
  startImage?: string;
  endImage?: string;
  return_last_frame?: boolean;
  referenceImages?: string[];
  model?: string;
}

export const createVideoTask = async (params: VideoTaskParams) => {
  const { prompt, resolution, ratio, duration, wm, cf, startImage, endImage, return_last_frame, referenceImages, model } = params;
  
  // Format prompt with parameters as requested
  // Format example: "--rs 720p --rt 16:9 --dur 5 --cf false --wm true"
  let formattedPrompt = prompt;
  if (resolution) formattedPrompt += ` --rs ${resolution}`;
  if (ratio) formattedPrompt += ` --rt ${ratio}`;
  if (duration) formattedPrompt += ` --dur ${duration}`;
  if (wm !== undefined) formattedPrompt += ` --wm ${wm}`;
  if (cf !== undefined) formattedPrompt += ` --cf ${cf}`;

  // Construct content list
  const contentList: any[] = [
      {
        type: "text",
        text: formattedPrompt
      }
  ];

  // Add images if provided
  if (startImage) {
      contentList.push({
          type: "image_url",
          image_url: {
              url: startImage
          },
          role: "first_frame"
      });
  }

  if (endImage) {
      contentList.push({
          type: "image_url",
          image_url: {
              url: endImage
          },
          role: "last_frame"
      });
  }

  // Add reference images if provided
  if (referenceImages && referenceImages.length > 0) {
      referenceImages.forEach(imgUrl => {
          contentList.push({
              type: "image_url",
              image_url: {
                  url: imgUrl
              },
              role: "reference_image"
          });
      });
  }

  try {
    const requestBody: any = {
        model: model || "doubao-seedance-1-5-pro-251215",
        content: contentList
    };

    if (return_last_frame) {
        requestBody.return_last_frame = true;
    }

    const response = await axios.post(
      `${BASE_URL}/contents/generations/tasks`,
      requestBody,
      {
        headers: {
          "Authorization": `Bearer ${API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );
    return { ...response.data, formattedPrompt };
  } catch (error: any) {
    // Enhanced error handling to propagate detailed API error messages
    const errorMsg = error.response?.data?.error?.message || error.message || "Unknown error";
    console.error("Error creating video task:", error.response?.data || error.message);
    throw new Error(errorMsg);
  }
};

export const getVideoTaskStatus = async (taskId: string) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/contents/generations/tasks/${taskId}`,
      {
        headers: {
          "Authorization": `Bearer ${API_KEY}`
        }
      }
    );
    return response.data;
  } catch (error: any) {
    // Log the full error response for debugging
    if (error.response) {
        console.error(`Error getting task status for ${taskId}:`, JSON.stringify(error.response.data, null, 2));
        console.error(`Status code: ${error.response.status}`);
    } else {
        console.error(`Error getting task status for ${taskId}:`, error.message);
    }
    throw error;
  }
};
