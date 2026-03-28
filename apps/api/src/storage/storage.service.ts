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
  private readonly logger = new Logger(StorageService.name);

  constructor(private readonly prisma: PrismaService) {
    this.bucketName = process.env.AWS_S3_BUCKET_NAME || 'taksh-store-assets';

    const hasCredentials =
      process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY;
    if (!hasCredentials) {
      this.logger.warn(
        'AWS credentials are not explicitly configured in the environment. Relying on fallback AWS SDK profiles or IAM roles.',
      );
    }

    this.s3Client = new S3Client({
      region: process.env.AWS_REGION || 'ap-south-1',
      ...(hasCredentials && {
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
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
      // ACL: 'public-read', // Uncomment if bucket ACLs are enabled and public access is needed directly
    });

    try {
      await this.s3Client.send(command);
      // Construct the public URL
      const region = process.env.AWS_REGION || 'ap-south-1';
      const fileUrl = `https://${this.bucketName}.s3.${region}.amazonaws.com/${fileName}`;

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
      this.logger.error('Error uploading file to S3', error);
      throw new InternalServerErrorException(
        'Failed to upload file to storage',
      );
    }
  }

  async deleteFile(fileUrl: string): Promise<void> {
    if (!fileUrl) return;

    try {
      // Extract the Key from the S3 URL
      // Example URL: https://my-bucket.s3.ap-south-1.amazonaws.com/folder/uuid.jpg
      const urlParts = new URL(fileUrl);
      const key = urlParts.pathname.substring(1); // remove the leading '/'

      if (!key) {
        this.logger.warn(`Could not extract key from URL: ${fileUrl}`);
        return;
      }

      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);
      this.logger.log(`Successfully deleted file from S3: ${key}`);
    } catch (error) {
      this.logger.error(`Error deleting file from S3: ${fileUrl}`, error);
      // We usually don't want to throw an error hard on deletion failure during replacements
      // so we'll just log it. But for strict API we should:
      throw new InternalServerErrorException(
        'Failed to delete file from storage',
      );
    }
  }

  async listFiles(prefix?: string): Promise<any[]> {
    const region = process.env.AWS_REGION || 'ap-south-1';
    try {
      const command = new ListObjectsV2Command({
        Bucket: this.bucketName,
        Prefix: prefix,
      });

      const response = await this.s3Client.send(command);

      return (response.Contents || []).map((obj) => {
        const url = `https://${this.bucketName}.s3.${region}.amazonaws.com/${obj.Key}`;
        return {
          key: obj.Key,
          url,
          size: obj.Size,
          lastModified: obj.LastModified,
        };
      });
    } catch (error) {
      this.logger.error('Error listing objects from S3', error);
      throw new InternalServerErrorException(
        'Failed to list items from storage',
      );
    }
  }
}
