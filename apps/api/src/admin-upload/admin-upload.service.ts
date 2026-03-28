import {
  Injectable,
  InternalServerErrorException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AdminUploadService {
  private s3Client: S3Client;
  private bucketName: string;
  private readonly logger = new Logger(AdminUploadService.name);

  constructor() {
    this.bucketName = process.env.AWS_S3_BUCKET_NAME || 'taksh-store-assets';

    const hasCredentials =
      process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY;

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

  async uploadImage(file: Express.Multer.File): Promise<string> {
    if (!file) throw new BadRequestException('No file provided');

    const fileExtension =
      file.originalname.split('.').pop()?.toLowerCase() || 'jpg';
    const uniqueFileName = `catalog/${uuidv4()}.${fileExtension}`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: uniqueFileName,
      Body: file.buffer,
      ContentType: file.mimetype,
      // ACL: 'public-read',
    });

    try {
      await this.s3Client.send(command);
      const region = process.env.AWS_REGION || 'ap-south-1';
      return `https://${this.bucketName}.s3.${region}.amazonaws.com/${uniqueFileName}`;
    } catch (error) {
      this.logger.error('Error uploading image to S3', error);
      throw new InternalServerErrorException(
        'Failed to upload image to storage',
      );
    }
  }
}
