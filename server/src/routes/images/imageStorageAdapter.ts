//File: ImageStorage.ts
//Author: Josh Rice
/*Description:
    Exports ImageStorageAdapter & getImageStorageAdapter.

    Abstracts away cloud vs local storage for:
        saveImage()
        deleteImage()
        loadImage()

    //NOTE: If no .env variables are set, it just defaults to local disk.
        //I.e. most group members don't need to know/worry about setting their .env

    EXAMPLE USAGE:
        import { ImageStorageAdapter, getImageStorageAdapter } from "./ImageStorage";
    
        const imageStorage: ImageStorageAdapter = getImageStorageAdapter();

        imageStorage.saveImage(imageBuffer, storageKey);
*/



import fs from "fs";
import path from "path";
import sharp from "sharp";
import { BlobServiceClient, ContainerClient } from "@azure/storage-blob";


const LOCAL_DEV_STORAGE_PATH = path.join(process.cwd(), "dev_img_uploads");


//NOTE: These constants are only used in the endpoints.
//I'm just keeping them here so that all "magic stuff" is in one place.
export const MAX_IMAGE_SIZE: number = 10 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES: Set<string> = new Set(["image/jpeg", "image/png", "image/webp"]);
export const SAVE_IMAGE_AS_TYPE: keyof sharp.FormatEnum = "webp";

const SAVE_IMAGE_MIME_TYPE: string = "image/webp";


//These are the functions available for image storage.
export interface ImageStorageAdapter{
        saveImage(image: Buffer, storageKey: string): Promise<{success: boolean, error?: string}>;
        deleteImage(storageKey: string): Promise<{success: boolean, error?: string}>;
        loadImage(storageKey: string): Promise<{success: boolean, image?: Buffer, error?: string}>;
}




//Just default to local. Most other group members don't need to know/worry about this.
//This way, we just store to their dev machines if in doubt.
export function getImageStorageAdapter(): ImageStorageAdapter{
    if(process.env.IMAGE_ADAPTER === "cloud"){
        return new AzureBlobImageStorageAdapter();
    } else{
        return new LocalDiskImageStorageAdapter();
    }
}

////////////////////////////////////////////
//Local Disk Implementation

class LocalDiskImageStorageAdapter implements ImageStorageAdapter{
    async saveImage(image: Buffer, storageKey: string): Promise<{success: boolean, error?: string}>{
        try{
            const storagePath = path.join(LOCAL_DEV_STORAGE_PATH, storageKey);
            await fs.promises.writeFile(storagePath, image);
            return { success: true };
        } catch (error) {
            return { success: false, error: "Failed to save image locally." };
        }
    }

    async deleteImage (storageKey: string): Promise<{success: boolean, error?: string}>{
        try{
            const storagePath = path.join(LOCAL_DEV_STORAGE_PATH, storageKey);
            await fs.promises.unlink(storagePath);
            return { success: true };
        }
        catch (error){
            return { success: false, error: "Failed to delete image locally." };
        }
    }

    async loadImage(storageKey: string): Promise<{success: boolean, image?: Buffer, error?: string}>{
        try{
            const storagePath = path.join(LOCAL_DEV_STORAGE_PATH, storageKey);
            const image = await fs.promises.readFile(storagePath);
            return { success: true, image, };
        }
        catch (error){
            return { success: false, error: "Failed to load image locally." };
        }
    }
}

///////////////////////////////////////////
//Azure Blob Storage Implementation

function getAzureContainerClient(): ContainerClient{
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING!;
    const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME!;
    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    return blobServiceClient.getContainerClient(containerName);
}

class AzureBlobImageStorageAdapter implements ImageStorageAdapter{
    async saveImage(image: Buffer, storageKey: string): Promise<{success: boolean, error?: string}>{
        try{
            const container = getAzureContainerClient();
            const blockBlobClient = container.getBlockBlobClient(storageKey);
            await blockBlobClient.uploadData(image, {
                blobHTTPHeaders: { blobContentType: SAVE_IMAGE_MIME_TYPE },
            });
            return { success: true };
        }
        catch (error){
            console.error("Failed to save image to Azure Blob Storage: ", error);
            return { success: false, error: "Failed to save image to Azure Blob Storage." };
        }
    }

    async deleteImage(storageKey: string): Promise<{success: boolean, error?: string}>{
        try{
            const container = getAzureContainerClient();
            const blockBlobClient = container.getBlockBlobClient(storageKey);
            await blockBlobClient.deleteIfExists();
            return { success: true };
        }
        catch (error){
            console.error("Failed to delete image from Azure Blob Storage: ", error);
            return { success: false, error: "Failed to delete image from Azure Blob Storage." };
        }
    }

    async loadImage(storageKey: string): Promise<{success: boolean, image?: Buffer, error?: string}>{
        try{
            const container = getAzureContainerClient();
            const blockBlobClient = container.getBlockBlobClient(storageKey);
            const downloadResponse = await blockBlobClient.downloadToBuffer();
            return { success: true, image: downloadResponse };
        }
        catch (error){
            console.error("Failed to load image from Azure Blob Storage: ", error);
            return { success: false, error: "Failed to load image from Azure Blob Storage." };
        }
    }
}


