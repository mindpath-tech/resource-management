import S3, { BucketName } from 'aws-sdk/clients/s3';
import BotLogging from '../helper/botLogging';
import { S3_CONSTANT } from '../constants';
const s3 = new S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});
const botLogging = new BotLogging();
/**
 * Upload file to s3 and return url with signed token.
 * @param name name of the file
 * @param body content
 * @returns url with singed token
 */
export async function uploadFileToS3(name: string, body: Buffer | Uint8Array | Blob | string): Promise<string> {
  try {
    const params: S3.PutObjectRequest = {
      Bucket: S3_CONSTANT.S3_BUCKET_NAME as BucketName,
      Key: name,
      Body: body,
    };
    const data = await s3.upload(params).promise();
    const signedUrl = await getToken(data.Key);
    return signedUrl;
  } catch (error) {
    botLogging.logError({
      error: error as Error,
      action: 'error',
      source: 'S3#uploadFileToS3',
    });
    return '';
  }
}

/**
 * Generate signed token to view private url
 * @param key name of the file
 * @returns
 */
export async function getToken(key: string): Promise<string> {
  try {
    const params = {
      Bucket: S3_CONSTANT.S3_BUCKET_NAME,
      Key: key,
      Expires: S3_CONSTANT.SIGNED_TOKEN_EXPIRY_TIME, // In seconds
    };

    const signedUrl = await s3.getSignedUrlPromise('getObject', params);
    return signedUrl;
  } catch (error) {
    botLogging.logError({
      error: error as Error,
      action: 'error',
      source: 'S3#getToken',
      data: {
        key,
      },
    });
    return '';
  }
}
