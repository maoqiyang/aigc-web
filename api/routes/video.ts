import express from 'express';
import { createVideoTask, getVideoTaskStatus } from '../services/volcengine.js';
import { downloadVideo, concatVideos } from '../services/ffmpeg.js';
import path from 'path';

const router = express.Router();

router.post('/generate', async (req, res) => {
  try {
    const result = await createVideoTask(req.body);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to generate video' });
  }
});

router.get('/status/:taskId', async (req, res) => {
  try {
    const result = await getVideoTaskStatus(req.params.taskId);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to get status' });
  }
});

router.post('/stitch', async (req, res) => {
    try {
        const { videoUrls } = req.body;
        if (!videoUrls || !Array.isArray(videoUrls) || videoUrls.length < 2) {
            return res.status(400).json({ error: 'At least 2 video URLs are required' });
        }

        const outputFilename = `stitched_${Date.now()}.mp4`;
        const absolutePaths = [];
        for (let i = 0; i < videoUrls.length; i++) {
             const url = videoUrls[i];
             const filename = `segment_${Date.now()}_${i}.mp4`;
             const filePath = await downloadVideo(url, filename);
             absolutePaths.push(filePath);
        }

        const relativeOutputPath = await concatVideos(absolutePaths, outputFilename);
        
        // Return the URL to access the stitched video
        // Assuming static serve at /temp
        const fullUrl = `/temp/${relativeOutputPath}`;
        res.json({ url: fullUrl });

    } catch (error: any) {
        console.error("Stitch error:", error);
        res.status(500).json({ error: error.message || 'Failed to stitch videos' });
    }
});

export default router;
