import { Branches } from '../models/Branches';

export class LoadBranches {
  static readonly type = '[Branches] Load';
}

export class AddBranchRowLocally {
  static readonly type = '[Branches] Add Row Locally';
  constructor(public payload: Branches) {}
}

export class UpdateBranch {
  static readonly type = '[Branches] Update';
  constructor(public branchId: number, public payload: Branches) {}
}

export class SoftDeleteBranch {
  static readonly type = '[Branches] Soft Delete';
  constructor(public payload: Branches) {}
}
