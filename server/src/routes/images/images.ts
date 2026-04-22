import { Router } from 'express';
import type { Request, Response } from 'express';
import { auth, prisma } from '../../lib/auth.js';

import { randomUUID } from 'crypto';//Gobbledygook generator.

import multer from 'multer';//Middleware to grab file from request.
import sharp from 'sharp';//File modifier (compression, rotate, etc.)

//Uses .env to swap between local and cloud storage
import type { ImageStorageAdapter } from './imageStorageAdapter.js';
import { getImageStorageAdapter } from './imageStorageAdapter.js';
import { SAVE_IMAGE_AS_TYPE, ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE } from './imageStorageAdapter.js';

export const router = Router();
const storageAdapter: ImageStorageAdapter = getImageStorageAdapter();

//File upload middleware config
const imageMiddleware = multer({ storage: multer.memoryStorage() });


interface POSTResponse{
    success: boolean;
    imageId: string | null;
    error: string | null;
}




router.post('/', imageMiddleware.single('image'), async (req: Request, res: Response<POSTResponse>) => {
    
    //Validate session
    //IF NOT LOGGED IN, BLOCK THE UPLOAD.
    const session = await auth.api.getSession({ headers: req.headers as any });
    if (!session?.user?.id) {
        return res.status(401).json({ success: false, imageId: null, error: "Must be logged in to upload images." });
    }


    //Get ownerId
    const ownerId = session.user.id;

    //Get the image file from the form data
    const file = req.file;
    if(!file){
        return res.status(400).json({ success: false, imageId: null, error: "Missing image file." });
    }

    if(file.size <= 0){
        return res.status(400).json({ success: false, imageId: null, error: "Image file is empty." });
    }

    //If file size is greater than 10MB, show error.
    if (file.size > MAX_IMAGE_SIZE) {
        return res.status(400).json({ success: false, imageId: null, error: `Please upload an image smaller than 10MB` });
    }

    //Use NPM package "file-type" to detect the ACTUAL file type, not just extension.
    const buffer = Buffer.from(file.buffer);
    const mimeType = file.mimetype;

    //If file extension is not .jpg, .jpeg, or .png, show error.
    if (!ALLOWED_IMAGE_TYPES.has(mimeType)) {
        return res.status(400).json({ success: false, imageId: null, error: `Unsupported file type: ${mimeType} || unknown` });
    }

    ////////////////////////////////////
   //Convert image and save to storage
    try{
        //Limit pixels to avoid "Pixel Bomb" attacks, auto-rotate per EXIF orientation
        const base = sharp(buffer, {limitInputPixels: 40_000_000}).rotate();

        //Convert and compress image to WebP format
        const compressedImage = await base.toFormat(SAVE_IMAGE_AS_TYPE, { quality: 82 }).toBuffer();
        const metadata = await sharp(compressedImage).metadata();

        //Generate UUID to act as storage key
        const storageKey = `${randomUUID()}.${SAVE_IMAGE_AS_TYPE}`;

        //Save to storage - either local or cloud, based on .ENV configuration
        const result = await storageAdapter.saveImage(compressedImage, storageKey);
        if(!result.success){
            console.error("Failed to save image:", result.error);
            return res.status(500).json({ success: false, imageId: null, error: "Failed to save image." });
        }

        //Create PlantImage row via Prisma
        const plantImage = await prisma.plantImage.create({
            data: {
                storageKey: storageKey,
                byteSize: compressedImage.length,
                width: metadata.width ?? 0,
                height: metadata.height ?? 0,
                ownerId: ownerId,
            }
        });

        return res.status(200).json({ success: true, imageId: plantImage.id, error: null });
    }
    catch(error){
        console.error("Error saving image:", error);
        return res.status(500).json({ success: false, imageId: null, error: "Failed to save image." });
    }
});

//Get an image by ID — returns the raw image binary, not JSON
router.get('/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    if(!id){
        return res.status(400).json({ error: "Image ID is required." });
    }

    try{
        const plantImage = await prisma.plantImage.findUnique({
            where: { id: id as string },
        });
        if(!plantImage){
            return res.status(404).json({ error: "Image not found." });
        }
        const result = await storageAdapter.loadImage(plantImage.storageKey);
        if(!result.success || !result.image){
            return res.status(500).json({ error: "Failed to load image." });
        }

        res.setHeader('Content-Type', 'image/webp');
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        return res.send(result.image);
    }
    catch(error){
        console.error("Error getting image:", error);
        return res.status(500).json({ error: "Failed to get image." });
    }
});