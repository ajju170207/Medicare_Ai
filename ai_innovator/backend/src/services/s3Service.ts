import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import dotenv from 'dotenv';

dotenv.config();

const s3Client = new S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
});

export const uploadFile = async (
    fileBuffer: Buffer,
    fileName: string,
    contentType: string
): Promise<string> => {
    const bucketName = process.env.AWS_S3_BUCKET || 'medicare-ai-uploads';

    const params = {
        Bucket: bucketName,
        Key: `uploads/${Date.now()}-${fileName}`,
        Body: fileBuffer,
        ContentType: contentType,
        ACL: 'public-read' as any, // Most common for web assets
    };

    try {
        await s3Client.send(new PutObjectCommand(params));
        return `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${params.Key}`;
    } catch (error: any) {
        console.error('S3 Upload Error:', error.message);
        throw new Error('Failed to upload file to S3');
    }
};

export const getUploadPresignedUrl = async (fileName: string, contentType: string): Promise<string> => {
    const bucketName = process.env.AWS_S3_BUCKET || 'medicare-ai-uploads';
    const key = `uploads/${Date.now()}-${fileName}`;

    const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        ContentType: contentType,
    });

    try {
        return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    } catch (error: any) {
        console.error('S3 Signed URL Error:', error.message);
        throw new Error('Failed to generate presigned URL');
    }
};
