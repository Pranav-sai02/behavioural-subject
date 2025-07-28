export interface ServicesPage {
  ServiceId: number;
  Description: string;
  ServiceType: string;
  Note: string;
  NotePlain: string;
  EnforceMobileNumber: boolean;
  SendRefSMSEnabled: boolean;
  IsActive: boolean;
  IsDeleted?: boolean;
}
export interface ServiceRow {
  ServiceId: number;
  Description: string;
  IsDeleted: boolean;
}