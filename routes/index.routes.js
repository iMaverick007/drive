import express from 'express';
import cloudinary from '../config/cloudinaryConfig.js';
import upload from '../config/multerConfig.js';
import { Readable } from 'stream';
import fileModel from '../models/files.models.js';
import auth from '../middlewares/auth.js';

const router = express.Router();

router.get('/home', auth, async (req, res) => {
    const userFiles = await fileModel.find({ user: req.user.userId });
    console.log(userFiles);
    res.render('home', {
        files: userFiles
    });
});

router.post('/upload', auth, upload.single('file'), async (req, res) => {
    console.log('Upload route called'); 

    try {
        const file = req.file;
        if (!file) {
            return res.status(400).send('No file uploaded.');
        }

        console.log('File received:', file.originalname);

        const cloudinaryUpload = new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    resource_type: 'auto',
                    folder: 'uploads',
                    public_id: `${Date.now()}-${file.originalname}`
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            const stream = Readable.from(file.buffer);
            stream.pipe(uploadStream);
        });

        const cloudinaryResult = await cloudinaryUpload;

        console.log('File uploaded to Cloudinary:', cloudinaryResult.secure_url);

        const newFile = await fileModel.create({
            path: cloudinaryResult.secure_url,
            originalName: file.originalname,
            cloudinaryUrl: cloudinaryResult.secure_url,
            user: req.user.userId
        });

        res.status(200).json({
            fileUrl: cloudinaryResult.secure_url,
            message: 'File uploaded successfully',
            file: newFile
        });
    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).json({
            error: 'An error occurred while uploading the file',
            details: error.message
        });
    }
});

router.get('/download/:id', auth, async (req, res) => {
    try {
        const loggedInUserId = req.user.userId;
        const fileId = req.params.id;

        const file = await fileModel.findOne({ _id: fileId, user: loggedInUserId });

        if (!file) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const secureUrl = cloudinary.url(file.cloudinaryUrl, {
            sign_url: true,
            secure: true,
            transformation: [{ quality: 'auto', fetch_format: 'auto' }],
            type: 'fetch',
        });

        res.redirect(secureUrl);
    } catch (error) {
        console.error('Error downloading file:', error);
        res.status(500).json({ message: 'Error downloading file' });
    }
});

export default router;