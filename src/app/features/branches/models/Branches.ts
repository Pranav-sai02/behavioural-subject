export interface Branches {
  BranchId?: number;
  Name: string;
  Province: string;
  Country: string;
  IsActive: boolean;
  IsDelete: boolean;
  isEdited?: boolean; // optional, used for edit tracking
}
