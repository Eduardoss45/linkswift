export interface EmailData {
  to: string;
  subject: string;
  content: string;
  options?: { isHtml?: boolean };
}