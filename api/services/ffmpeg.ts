import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEMP_DIR = path.join(__dirname, '../../temp');

if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
}

export const downloadVideo = async (url: string, filename: string) => {
    const filePath = path.join(TEMP_DIR, filename);
    const writer = fs.createWriteStream(filePath);

    const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream'
    });

    response.data.pipe(writer);

    return new Promise<string>((resolve, reject) => {
        writer.on('finish', () => resolve(filePath));
        writer.on('error', reject);
    });
};

export const concatVideos = async (videoPaths: string[], outputFilename: string) => {
    const listPath = path.join(TEMP_DIR, `list_${Date.now()}.txt`);
    const fileContent = videoPaths.map(p => `file '${p}'`).join('\n');
    fs.writeFileSync(listPath, fileContent);

    const outputPath = path.join(TEMP_DIR, outputFilename);
    
    // ffmpeg -f concat -safe 0 -i list.txt -c copy output.mp4
    // Using -c copy is fast but requires same codecs. Volcengine videos should be consistent.
    try {
        await execAsync(`ffmpeg -f concat -safe 0 -i "${listPath}" -c copy -y "${outputPath}"`);
        fs.unlinkSync(listPath);
        return outputFilename; 
    } catch (error) {
        console.error('FFmpeg error:', error);
        throw error;
    }
};
