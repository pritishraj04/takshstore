import {
  Injectable,
  InternalServerErrorException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StorageService {
  private s3Client: S3Client;
  private bucketName: string;
  private publicDomain: string;
  private readonly logger = new Logger(StorageService.name);

  constructor(private readonly prisma: PrismaService) {
    this.bucketName = process.env.R2_BUCKET_NAME || 'taksh-store-assets';
    // IMPORTANT: Add this to your .env (e.g., https://cdn.takshstore.com)
    this.publicDomain = process.env.R2_PUBLIC_DOMAIN || '';

    const hasCredentials =
      process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY && process.env.R2_ENDPOINT;

    if (!hasCredentials) {
      this.logger.warn('Cloudflare R2 credentials or endpoint are missing from the environment.');
    }

    // FIX 1: Configure specifically for Cloudflare R2
    this.s3Client = new S3Client({
      region: 'auto', // R2 strictly uses 'auto'
      endpoint: process.env.R2_ENDPOINT, // e.g., https://<ACCOUNT_ID>.r2.cloudflarestorage.com
      ...(hasCredentials && {
        credentials: {
          accessKeyId: process.env.R2_ACCESS_KEY_ID as string,
          secretAccessKey: process.env.R2_SECRET_ACCESS_KEY as string,
        },
      }),
    });
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: string,
    userId?: string,
    isAdmin: boolean = false
  ): Promise<string> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const fileExtension = file.originalname.split('.').pop()?.toLowerCase();
    if (!fileExtension) {
      throw new BadRequestException('File must have an extension');
    }

    const fileName = `${folder}/${uuidv4()}.${fileExtension}`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    try {
      await this.s3Client.send(command);

      // FIX 2: Construct the public URL using your custom Cloudflare domain
      if (!this.publicDomain) {
        this.logger.warn('R2_PUBLIC_DOMAIN is not set. The returned URL will be incomplete.');
      }
      const fileUrl = `${this.publicDomain}/${fileName}`;

      // RECORD IN DATABASE
      const type = file.mimetype.startsWith('audio') ? 'MUSIC' : 'IMAGE';

      await this.prisma.media.create({
        data: {
          url: fileUrl,
          key: fileName,
          type,
          ...(isAdmin ? { adminId: userId } : { userId }),
        }
      });

      return fileUrl;
    } catch (error) {
      this.logger.error('Error uploading file to R2', error);
      throw new InternalServerErrorException(
        'Failed to upload file to storage',
      );
    }
  }

  async deleteFile(fileUrl: string): Promise<void> {
    if (!fileUrl) return;

    try {
      // Extract the Key from the Custom Domain URL
      // Example URL: https://cdn.takshstore.com/folder/uuid.jpg
      const urlParts = new URL(fileUrl);
      const key = decodeURIComponent(urlParts.pathname.substring(1)); // remove leading '/' and decode

      if (!key) {
        this.logger.warn(`Could not extract key from URL: ${fileUrl}`);
        return;
      }

      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);
      this.logger.log(`Successfully deleted file from R2: ${key}`);
    } catch (error) {
      this.logger.error(`Error deleting file from R2: ${fileUrl}`, error);
      throw new InternalServerErrorException(
        'Failed to delete file from storage',
      );
    }
  }

  async listFiles(prefix?: string): Promise<any[]> {
    try {
      const command = new ListObjectsV2Command({
        Bucket: this.bucketName,
        Prefix: prefix,
      });

      const response = await this.s3Client.send(command);

      return (response.Contents || []).map((obj) => {
        // FIX 3: Update list mapping to use the custom domain
        const url = `${this.publicDomain}/${obj.Key}`;
        return {
          key: obj.Key,
          url,
          size: obj.Size,
          lastModified: obj.LastModified,
        };
      });
    } catch (error) {
      this.logger.error('Error listing objects from R2', error);
      throw new InternalServerErrorException(
        'Failed to list items from storage',
      );
    }
  }
}