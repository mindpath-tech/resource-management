import { Attachment } from 'botbuilder';

export type LogDefectContext = {
  chooseDevice: string;
  describeDefect: string;
  defectImage: Attachment[];
  defectPriority: string;
};
