export interface User {
  Id?: number;
  Firstname: string;
  Lastname: string;
  UserEmail: string;
  PhoneNumber: string;
  MobileNumber: string;
  EmployeeId?: string;
  IsActive: boolean;
  IsAdmin: boolean;
  ProfileImage?: string;
  UserName: string;
  PasswordHash: string;
  EmailConfirmed: boolean;
  SecurityStamp?: string;
  createdByUserId?: number;
  createdDate?: Date;
  modifiedDate?: Date;
  IsDeleted?: boolean;
}
