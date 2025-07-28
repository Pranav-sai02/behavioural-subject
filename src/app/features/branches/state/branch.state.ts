import { Injectable } from '@angular/core';
import { State, Action, Selector, StateContext } from '@ngxs/store';
import { catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';

import {
  LoadBranches,
  AddBranchRowLocally,
  UpdateBranch,
  SoftDeleteBranch,
} from './branch.actions';

import { Branches } from '../models/Branches';
import { BranchesService } from '../services/branches.service';
import { LoggerService } from '../../../core/services/logger/logger.service';
import { ToastrService } from '../../../shared/component/toastr/services/toastr.service';

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
    private branchesService: BranchesService,
    private toaster: ToastrService,
    private logger: LoggerService
  ) {}

  @Selector()
  static getBranches(state: BranchesStateModel): Branches[] {
    return state.branches;
  }

  @Action(LoadBranches)
  loadBranches(ctx: StateContext<BranchesStateModel>) {
    return this.branchesService.getBranches().pipe(
      tap((data) => {
        const filtered = data
          .filter((b) => !b.IsDelete)
          .sort((a, b) => (b.BranchId ?? 0) - (a.BranchId ?? 0));
        ctx.patchState({ branches: filtered });
      }),
      catchError((error) => {
        this.logger.logError(error, 'BranchesState.loadBranches');
        this.toaster.show('Failed to load branches.', 'error');
        return of([]);
      })
    );
  }

  @Action(AddBranchRowLocally)
 addBranchRow(ctx: StateContext<BranchesStateModel>, action: AddBranchRowLocally) {
  return this.branchesService.createBranch(action.payload).pipe(
    tap((created: Branches) => {
      const state = ctx.getState();
      ctx.patchState({ branches: [created, ...state.branches] });
      this.toaster.show('Branch created successfully.', 'success');
    }),
    catchError((error) => {
      this.logger.logError(error, 'BranchesState.addBranch');
      this.toaster.show('Failed to create branch.', 'error');
      return of(null);
    })
  );
  }

@Action(UpdateBranch)
updateBranch(ctx: StateContext<BranchesStateModel>, action: UpdateBranch) {
  const state = ctx.getState();

  const updatedBranches = state.branches.map((b) =>
    b.BranchId === action.payload.BranchId ? action.payload : b
  );
  ctx.patchState({ branches: updatedBranches });

  // Remove frontend-only props
  const { isEdited, ...cleanPayload } = action.payload;

  return this.branchesService.updateBranch(action.payload.BranchId!, cleanPayload).pipe(
    catchError((error) => {
      this.logger.logError(error, 'BranchesState.updateBranch');
      this.toaster.show('Failed to update branch.', 'error');
      return of(null);
    })
  );
}


  @Action(SoftDeleteBranch)
  softDeleteBranch(ctx: StateContext<BranchesStateModel>, action: SoftDeleteBranch) {
    const state = ctx.getState();
    const filteredBranches = state.branches.filter(
      (b) => b.BranchId !== action.payload.BranchId
    );
    ctx.patchState({ branches: filteredBranches });

    return this.branchesService.softDeleteBranch(action.payload.BranchId!).pipe(
      catchError((error) => {
        this.logger.logError(error, 'BranchesState.softDeleteBranch');
        this.toaster.show('Failed to delete branch.', 'error');
        return of(null);
      })
    );
  }
}
