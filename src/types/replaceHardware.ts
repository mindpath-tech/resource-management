export type ReplaceHardwareDetails = {
  hardware: string;
  brandName: string;
  modelName: string;
  serialNumber: string;
  frontImageUrl: string;
  frontImageName: string;
  frontImageContentType: string;
  backImageUrl: string;
  backImageName: string;
  backImageContentType: string;
  hardwareRequestId: string;
  deliveryAddress: string;
};

export type ReplaceHardware = {
  hardwares: ReplaceHardwareDetails;
  userId: string;
};
