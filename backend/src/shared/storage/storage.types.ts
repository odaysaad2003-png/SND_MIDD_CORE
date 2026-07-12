export type StorageProvider = "cloudinary";

export interface UploadedAsset {
    provider: StorageProvider;
    url: string;
    publicId: string;
    bytes?: number;
    format?: string;
}
