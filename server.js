import express from 'express';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { compressAudio } from './audioCompressor.js';

const app = express();
const PORT = process.env.PORT || 3000;


const uploadDirectory = path.join('public', 'uploads');
fs.mkdirSync(uploadDirectory, { recursive: true });
const upload = multer({ dest: uploadDirectory });

// Configura el middleware para servir archivos estáticos
app.use(express.static(path.join('public')));

// Ruta para la página principal
app.get('/', (req, res) => {
    res.sendFile(path.join('/public', 'index.html'));
});


app.post('/api', upload.single('audio'), (req, res) => {
    console.log('audio arrived', req.file);
    try {
        const inputFilePath = req.file.path;
        const outputFilePath = path.join(uploadDirectory, `compressed_${req.file.filename}.mp3`);

        compressAudio(inputFilePath, outputFilePath)
            .then(compressedFilePath => {
                res.json({ "downloadUrl": `uploads/compressed_${req.file.filename}.mp3` });

                setTimeout(() => {
                    fs.unlink(inputFilePath, (err) => {
                        if (err) {
                            console.error("Error deleting input file:", err);
                        } else {
                            console.log("Input file deleted successfully.");
                        }
                    });

                    fs.unlink(outputFilePath, (err) => {
                        if (err) {
                            console.error("Error deleting output file:", err);
                        } else {
                            console.log("Output file deleted successfully.");
                        }
                    });
                }, 15000);
            })
            .catch(err => {
                console.error("Error compressing audio:", err);
                res.status(500).send("Error processing file.");
            });
    } catch (error) {
        res.status(500).send('Error processing');
    }
});

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});