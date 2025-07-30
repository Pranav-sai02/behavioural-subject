import { Component, OnInit } from '@angular/core';
import {
  GridApi,
  GridOptions,
  ColDef,
  CellClickedEvent,
} from 'ag-grid-community';

import { ActiveToggleRendererComponent } from '../../../../shared/component/active-toggle-renderer/active-toggle-renderer.component';
import { SoftDeleteButtonRendererComponent } from '../../../../shared/component/soft-delete-button-renderer/soft-delete-button-renderer.component';
import { ViewButtonRendererComponent } from '../../../../shared/component/view-button-renderer/view-button-renderer.component';
import { User } from '../../../users/models/User';
import { UserService } from '../../../users/services/user.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ToastrService } from '../../../../shared/component/toastr/services/toastr.service';
import { UnlinkCellRendererComponent } from '../../../../shared/component/unlink-cell-renderer/unlink-cell-renderer.component';
import { UsersStateService } from '../../../users/services/users-state/users-state.service';

@Component({
  selector: 'app-claim-controller',
  standalone: false,
  templateUrl: './claim-controller.component.html',
  styleUrl: './claim-controller.component.css',
})
export class ClaimControllerComponent implements OnInit {
  ActiveToggleRendererComponent = ActiveToggleRendererComponent;

  UnlinkCellRendererComponent = UnlinkCellRendererComponent;

  // 🟩 Changed: original list of users from backend
  allUsers: User[] = [];

  // 🟩 Changed: keep grid empty initially
  users: User[] = [];

  gridApi!: GridApi;

  selectedUser: User | null = null;
  editedUser: User = {} as User;

  defaultImage = 'assets/images/profile.png';

  toggleOptions = false;
  form: FormGroup;
  saving = false;

  gridOptions: GridOptions = {
    context: { componentParent: this },
    getRowId: (params) => params.data.Id?.toString() ?? params.data.UserEmail,
  };

  columnDefs: ColDef<User>[] = [
    {
      field: 'Firstname',
      headerName: 'First Name',
      minWidth: 200,
      flex: 1,
      cellStyle: { borderRight: '1px solid #ccc' },
      headerClass: 'bold-header',
    },
    {
      field: 'Lastname',
      headerName: 'Last Name',
      minWidth: 200,
      flex: 2,
      cellStyle: { borderRight: '1px solid #ccc' },
      headerClass: 'bold-header',
    },
    {
      field: 'UserEmail',
      headerName: 'Email',
      minWidth: 200,
      flex: 1,
      cellStyle: { borderRight: '1px solid #ccc' },
      headerClass: 'bold-header',
    },
    {
      field: 'PhoneNumber',
      headerName: 'Phone Number',
      minWidth: 200,
      flex: 1,
      cellStyle: {
        borderRight: '1px solid #ccc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      },
      headerClass: 'bold-header',
    },

    {
      // headerName: 'Delete',
      // flex: 1,

      suppressHeaderMenuButton: true,
      pinned: 'right',
      maxWidth: 100,
      cellRenderer: 'unlinkCellRenderer',
      cellStyle: {
        borderRight: '1px solid #ccc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      },
      headerClass: 'bold-header',
      cellRendererParams: {
        onUnlink: (data: User) => this.softDelete(data),
      },
    },
  ];

  defaultColDef: ColDef = {
    sortable: true,
    filter: true,
    resizable: true,
    flex: 1,
    minWidth: 100,
  };

  claimcontroller: { id: string; name: string }[] = [];

  constructor(
    private userService: UserService,
    private toastr: ToastrService,
    private fb: FormBuilder,
    private usersStateService: UsersStateService
  ) {
    this.form = this.fb.group({
      selectedClamController: [null],
    });
  }

  ngOnInit(): void {
    this.loadUsers();

    // ✅ Load from state when component is initialized
    // this.usersStateService.users$.subscribe((data) => {
    //   this.users = data;
    // });

     // 👇 Restore saved users from BehaviorSubject
  this.users = this.usersStateService.getUsers();
  }

  loadUsers(): void {
    this.userService.getAllUsers().subscribe({
      next: (data) => {
        this.allUsers = data.filter((u) => u.IsActive && !u.IsDeleted); // ✅ Filter only active users

        this.claimcontroller = this.allUsers.map((u) => ({
          id: u.AspNetUserId?.toString() ?? '',
          name: `${u.Firstname} ${u.Lastname}`,
        }));

        this.resizeGrid();
      },
      error: (err) => {
        console.warn('[ClaimControllerComponent] Failed to load users.', err);
        this.toastr.show('Failed to fetch user data.', 'error');
      },
    });
  }

  onGridReady(params: any): void {
    this.gridApi = params.api;
    this.resizeGrid();
  }

  resizeGrid(): void {
    if (this.gridApi) {
      setTimeout(() => this.gridApi.sizeColumnsToFit(), 100);
    }
  }

  softDeleteProvider(user: User): void {
    const confirmed = confirm(
      `Are you sure you want to delete ${user.UserEmail}?`
    );
    if (!confirmed) return;

    const rowNode = this.gridApi.getRowNode(user.AspNetUserId?.toString() ?? '');
    if (rowNode) {
      this.gridApi.applyTransaction({ remove: [rowNode.data] });
      this.toastr.show(`Deleted ${user.UserEmail} from UI.`, 'success');
    }
  }

  clearField(
    field:
      | 'Firstname'
      | 'Lastname'
      | 'UserEmail'
      | 'MobileNumber'
      | 'EmployeeId'
      | 'PhoneNumber'
  ): void {
    (this.editedUser as any)[field] = '';
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () =>
      (this.editedUser.ProfileImage = reader.result as string);
    reader.readAsDataURL(file);
  }

  removeImage() {
    this.editedUser.ProfileImage = '';
  }

  openCamera() {
    console.log('Camera action triggered');
  }

  saveUserToggleStatus(updatedUser: User): void {
    this.userService.updateUser(updatedUser).subscribe({
      next: (res) => {
        this.toastr.show(`Status updated for ${res.UserEmail}`, 'success');
      },
      error: (err) => {
        console.error('Failed to update IsActive status', err);
        this.toastr.show('Failed to update active status.', 'error');
      },
    });
  }

  addControllerToGrid(): void {
    const selectedId = this.form.get('selectedClamController')?.value;
    if (!selectedId) {
      this.toastr.show('Please select a controller.', 'error');
      return;
    }

    const alreadyAdded = this.users.some(
      (u) => u.AspNetUserId?.toString() === selectedId
    );
    if (alreadyAdded) {
      this.toastr.show('Controller already added.', 'info');
      return;
    }

    const userToAdd = this.allUsers.find(
      (u) => u.AspNetUserId?.toString() === selectedId
    );
    if (!userToAdd) {
      this.toastr.show('User not found.', 'error');
      return;
    }

    const clonedUser = structuredClone(userToAdd);
    this.users = [...this.users, clonedUser];

    this.gridApi.applyTransaction({ add: [clonedUser] });

    this.usersStateService.addUser(clonedUser); // 👈 Persist in service

    this.form.get('selectedClamController')?.reset();
    this.toastr.show(`${clonedUser.Firstname} added to grid`, 'success');
  }

  unlinkController(user: User): void {
    const rowNode = this.gridApi.getRowNode(user.AspNetUserId?.toString() ?? '');
    if (rowNode) {
      // ❗ Remove from AG Grid
      this.gridApi.applyTransaction({ remove: [rowNode.data] });

      // ❗ Also remove from local array
      this.users = this.users.filter((u) => u.AspNetUserId !== user.AspNetUserId);

      this.toastr.show(`${user.Firstname} unlinked successfully.`, 'success');
    }
  }

  softDelete(user: User): void {
    user.IsDeleted = true;

    // ✅ Step 1: Update the linkedServiceProviders array
    this.allUsers = this.allUsers.filter((sp) => sp.AspNetUserId !== user.AspNetUserId);

    // ✅ Step 2: Remove from AG Grid UI
    this.gridApi.applyTransaction({ remove: [user] });

    // ✅ Optional: Toast
    this.toastr.show('Item unlinked successfully', 'success');

    // ✅ Step 3: Call backend to soft delete
    this.userService.softDelete(user.AspNetUserId!).subscribe({
      next: () => {},
      error: () => {
        this.toastr.show('Failed to unlink item', 'error');
      },
    });
  }
}
