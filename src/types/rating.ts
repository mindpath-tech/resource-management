export type RatingRequest = {
  startDate: string;
  endDate: string;
  timezone?: string;
};

export type ExcelReportPayload = {
  'Agent Name': string;
  'Client - User Email': string;
  Date: string;
  Time: string;
  Score: number;
};
