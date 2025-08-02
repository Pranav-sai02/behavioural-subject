import { State, Action, Selector, StateContext } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { Branches } from '../models/Branches';

import {
  LoadBranches,
  AddBranchRowLocally,
  UpdateBranch,
  SoftDeleteBranch,
} from './branch.actions';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { LoggerService } from '../../../core/services/logger/logger.service';
import { BranchesService } from '../services/branches.service';

export interface BranchesStateModel {
  branches: Branches[];
}

@State<BranchesStateModel>({
  name: 'branches',
  defaults: {
    branches: [],
  },
})
@Injectable()
export class BranchesState {
  constructor(
    private branchService: BranchesService ,
    private logger: LoggerService
  ) {}

  @Selector()
  static getBranches(state: BranchesStateModel): Branches[] {
    return state.branches;
  }

  @Action(LoadBranches)
  loadBranches(ctx: StateContext<BranchesStateModel>) {
    return this.branchService.getBranches().pipe(
      tap((branches: Branches[]) => {
        ctx.patchState({
          branches: branches.filter((b) => !b.IsDelete), // ✅ Exclude soft-deleted
        });
      }),
      catchError((err) => {
        this.logger.logError(err, 'BranchesState.loadBranches');
        return throwError(() => err);
      })
    );
  }

  @Action(AddBranchRowLocally)
  addBranchRow(ctx: StateContext<BranchesStateModel>, action: AddBranchRowLocally) {
    const state = ctx.getState();
    const newRow: Branches = {
      ...action.payload,
      BranchId: 0,
      IsActive: true,
      IsDelete: false,
    };
    ctx.patchState({ branches: [newRow, ...state.branches] });
  }

  @Action(UpdateBranch)
  updateBranch(ctx: StateContext<BranchesStateModel>, action: UpdateBranch) {
    return this.branchService.updateBranch(action.id, action.payload).pipe(
      tap(() => {
        const state = ctx.getState();
        const updated = state.branches.map((b) =>
          b.BranchId === action.id ? { ...b, ...action.payload } : b
        );
        ctx.patchState({ branches: updated });
      }),
      catchError((err) => {
        this.logger.logError(err, 'BranchesState.updateBranch');
        return throwError(() => err);
      })
    );
  }

  @Action(SoftDeleteBranch)
  softDeleteBranch(ctx: StateContext<BranchesStateModel>, action: SoftDeleteBranch) {
    const branch = action.payload;

    return this.branchService.updateBranch(branch.BranchId!, {
      ...branch,
      IsDelete: true, // ✅ Make sure IsDelete is sent in the PUT request
    }).pipe(
      tap(() => {
        const state = ctx.getState();
        const filtered = state.branches.filter((b) => b.BranchId !== branch.BranchId);
        ctx.patchState({ branches: filtered }); // ✅ Remove from local state
      }),
      catchError((err) => {
        this.logger.logError(err, 'BranchesState.softDeleteBranch');
        return throwError(() => err);
      })
    );
  }
}
