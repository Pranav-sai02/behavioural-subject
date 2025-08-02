export class LoadBranches {
  static readonly type = '[Branch] Load All';
}

export class AddBranchRowLocally {
  static readonly type = '[Branch] Add Row Locally';
  constructor(public payload: any) {}
}

export class UpdateBranch {
  static readonly type = '[Branch] Update';
  constructor(public id: number, public payload: Partial<any>) {}
}

export class SoftDeleteBranch {
  static readonly type = '[Branch] Soft Delete';
  constructor(public payload: any) {}
}
