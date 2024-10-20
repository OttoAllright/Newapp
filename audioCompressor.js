// audioCompressor.js
import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs';

// Función para comprimir audio
export function compressAudio(inputFilePath, outputFilePath) {
    return new Promise((resolve, reject) => {
        ffmpeg(inputFilePath)
            .output(outputFilePath)
            .audioBitrate('128k') // Ajusta la tasa de bits según sea necesario
            .on('end', () => {
                console.log('Compresión completada');
                resolve(outputFilePath);
            })
            .on('error', (err) => {
                console.error('Error durante la compresión:', err);
                reject(err);
            })
            .run();
    });
}