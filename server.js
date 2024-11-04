import express from 'express';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { compressAudio } from './audioCompressor.js';

// Cambiar la ruta de destino a un directorio accesible
const uploadDirectory = path.join(__dirname, 'uploads'); // Crear un directorio 'uploads' en la raíz del proyecto
fs.mkdirSync(uploadDirectory, { recursive: true }); // Asegurarse de que el directorio existe

const upload = multer({ dest: uploadDirectory });

const app = express();
const PORT = process.env.PORT || 3000;//server

app.use(express.static('public'));

app.post('/api', upload.single('audio'), (req, res) => {
    console.log('audio arrived', req.file);
    try {
        const inputFilePath = req.file.path;
        const outputFilePathss = path.join(uploadDirectory, `compressed_${req.file.filename}.mp3`); // Cambiar ruta de salida

        compressAudio(inputFilePath, outputFilePath)
            .then(compressedFilePath => {
                res.json({ "downloadUrl": `uploads/compressed_${req.file.filename}.mp3` });

                // Esperar 15 segundos antes de eliminar los archivos
                setTimeout(() => {
                    // Eliminar el archivo de entrada
                    fs.unlink(inputFilePath, (err) => {
                        if (err) {
                            console.error("Error deleting input file:", err);
                        } else {
                            console.log("Input file deleted successfully.");
                        }
                    });

                    // Eliminar el archivo de salida
                    fs.unlink(outputFilePath, (err) => {
                        if (err) {
                            console.error("Error deleting output file:", err);
                        } else {
                            console.log("Output file deleted successfully.");
                        }
                    });
                }, 15000); // 15 segundos
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