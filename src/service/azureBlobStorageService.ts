import { AxiosRequestConfig } from 'axios';
import { AxiosUtils } from 'src/helper/axios';
import { uploadFileToBlob } from 'src/helper/azureBlobStorageHelper';

export default class AzureBlobStorageService {
  public async getBlobUrlFromFileUrl(
    fileUrl: string,
    fileContentType: string,
    filePathForBlob: string,
  ): Promise<string> {
    const response = await AxiosUtils.getRequest<ArrayBuffer>(fileUrl, {
      responseType: 'arraybuffer',
    } as AxiosRequestConfig);
    const fileBuffer = response.data;
    return await uploadFileToBlob(
      process.env.RESOURCE_MANAGEMENT_BLOB_CONNECTION!,
      process.env.RESOURCE_MANAGEMENT_BLOB_CONTAINER!,
      filePathForBlob,
      fileBuffer,
      fileContentType,
    );
  }
}
