import { HardwareAssignTypeEnum } from 'src/enum/hardwareAssignTypeEnum';

export type ImageDetails = {
  imageUrl: string;
  imageName: string;
  imageContentType: string;
};

export type AssignHardwareDetails = {
  brandName: string;
  modelName: string;
  serialNumber: string;
  frontImage: ImageDetails;
  backImage: ImageDetails;
  hardwareRequestId: string;
  assignType: HardwareAssignTypeEnum;
};

export type AssignHardware = {
  hardwares: Array<AssignHardwareDetails>;
  userId: string;
  requestId: string;
  hardwareId: string;
  totalQuantity: number;
  currentItemIndex: number;
};
