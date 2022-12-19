import { Attachment } from 'botbuilder';

export class SubmitHardware {
  public deviceType: string;
  public brand: string;
  public model: string;
  public serialNumber: string;
  public frontImage: Attachment[];
  public backImage: Attachment[];
}
