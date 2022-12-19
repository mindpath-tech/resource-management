import { BlobServiceClient, BlockBlobParallelUploadOptions } from '@azure/storage-blob';

export const uploadFileToBlob = async (
  connectionString: string,
  containerName: string,
  filePath: string,
  dataToUpload: Buffer | Blob | ArrayBuffer | ArrayBufferView,
  contentType?: string,
): Promise<string> => {
  const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
  const containerClient = blobServiceClient.getContainerClient(containerName);
  const blockBlobClient = containerClient.getBlockBlobClient(filePath);

  if (contentType) {
    await blockBlobClient.uploadData(dataToUpload, {
      blobHTTPHeaders: {
        blobContentType: contentType,
      },
    } as BlockBlobParallelUploadOptions);
  } else {
    await blockBlobClient.uploadData(dataToUpload);
  }

  return blockBlobClient.url;
};
