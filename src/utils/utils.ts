import { MicrosoftAppCredentials } from 'botframework-connector';
import { AdaptiveCardAction } from '../types/bot';
import { AxiosUtils } from '../helper/axios';
import { uploadFileToS3 } from './s3';
import { OPEN_URL_ACTION, OPEN_URL_TEXT, POPUP_ICON_URL } from '../constants';
const URL_REGEX = /(?<!(href|src)=("|'))((https?:\/\/|ftp:\/\/|www\.)[^\s]+)/g;
/**
 * Download file received as a bot attachment.
 * Upload to s3.
 * @param url url received as bot attachment.
 * @param fileType filetype
 * @returns S3 bucket signed url
 */
export async function downloadFileAndUploadToS3(url: string, fileType?: string): Promise<string> {
  const token = await new MicrosoftAppCredentials(
    process.env.MicrosoftAppId!,
    process.env.MicrosoftAppPassword!,
  ).getToken();
  const response = await AxiosUtils.getRequest<Blob>(url, {
    headers: { Authorization: `Bearer ${token}` },
    responseType: 'arraybuffer',
  });
  let name = new Date().getTime().toString();
  if (fileType) {
    name = `${name}.${fileType}`;
  } else {
    const ext = getUrlExtension(url);
    if (ext) {
      name = `${name}.${ext}`;
    }
  }
  return await uploadFileToS3(name, response.data);
}

/**
 * Download public url and upload to s3.
 * @param url public url
 * @param fileType filetype
 * @returns S3 bucket signed url
 */
export async function downloadPublicUrlAndUploadToS3(url: string, fileType?: string): Promise<string> {
  const response = await AxiosUtils.getRequest<Blob>(url, {
    responseType: 'arraybuffer',
  });
  let name = new Date().getTime().toString();
  if (fileType) {
    name = `${name}.${fileType}`;
  } else {
    const ext = getUrlExtension(url);
    if (ext) {
      name = `${name}.${ext}`;
    }
  }
  return await uploadFileToS3(name, response.data);
}

/**
 * Verify verify provided data is valid json or not.
 * @param item  any data can string and any json.
 * @returns true/false
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isJson(item: any): boolean {
  item = typeof item !== 'string' ? JSON.stringify(item) : item;

  try {
    item = JSON.parse(item);
  } catch (e) {
    return false;
  }

  if (typeof item === 'object' && item !== null) {
    return true;
  }

  return false;
}

/**
 * Extract extension from url.
 * @param url any valid url
 * @returns extension of url
 */
function getUrlExtension(url: string): string {
  return url.split(/[#?]/)[0].split('.').pop()?.trim() || '';
}

/**
 * Identify url from text and create actions for them
 * @param text any text.
 * @returns
 */
export function identifyUrlsAndCreateActions(text: string): {
  actions: Array<AdaptiveCardAction>;
  text: string;
} {
  try {
    const actions: Array<AdaptiveCardAction> = [];
    const message = text.replace(URL_REGEX, function (url) {
      if (url.includes('http') || url.includes('https')) {
        //const parsedUrl = new URL(url);
        actions.push({
          type: OPEN_URL_ACTION,
          title: OPEN_URL_TEXT,
          iconUrl: POPUP_ICON_URL,
          url,
        });
      } else {
        //const parsedUrl = new URL(url);
        actions.push({
          type: OPEN_URL_ACTION,
          title: OPEN_URL_TEXT,
          iconUrl: POPUP_ICON_URL,
          url: `https://${url}`,
        });
      }
      return url;
    });
    return {
      actions,
      text: message,
    };
  } catch (error) {
    return {
      text,
      actions: [],
    };
  }
}
