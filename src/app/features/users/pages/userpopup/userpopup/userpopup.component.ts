import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '../../../services/user.service';
import { User } from '../../../models/User';

@Component({
  selector: 'app-userpopup',
  standalone: false,
  templateUrl: './userpopup.component.html',
  styleUrl: './userpopup.component.css',
})
export class UserpopupComponent implements OnInit {
  showSuccess = false;
  providerForm!: FormGroup;

  ProfileImage: String | ArrayBuffer | null = null;
  defaultImage = 'assets/images/profile.png';

  @Output() close = new EventEmitter<void>();
  userForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.userForm = this.fb.group({
      Firstname: ['', Validators.required],
      Lastname: ['', Validators.required],
      UserEmail: ['', [Validators.required, Validators.email]],
      PhoneNumber: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      MobileNumber: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      EmployeeId: [''],
      IsActive: [false],
      IsAdmin: [false],
    });
  }

  closeForm() {
    this.close.emit();
  }
  onCancel(): void {
    this.close.emit();
  }

  // Handle image file selection
  toggleOptions: boolean = false;

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.ProfileImage = reader.result as string;
        this.toggleOptions = false;
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage() {
    this.ProfileImage = '';
    this.toggleOptions = false;
  }

  // Stub for camera functionality (can be implemented via plugins if needed)
  openCamera() {
    alert('Camera functionality can be implemented via native device plugins.');
    this.toggleOptions = false;
  }

  clearField(controlName: string): void {
    this.userForm.get(controlName)?.setValue('');
  }

  onSave() {
    if (this.userForm.valid) {
      const formValues = this.userForm.value;

      const user: User = {
        Firstname: formValues.Firstname,
        Lastname: formValues.Lastname,
        UserEmail: formValues.UserEmail,
        PhoneNumber: formValues.PhoneNumber,
        MobileNumber: formValues.MobileNumber,
        EmployeeId: formValues.EmployeeId,
        IsActive: formValues.IsActive,
        IsAdmin: formValues.IsAdmin,
        UserName: formValues.UserEmail,
        PasswordHash: 'Default@123',
        EmailConfirmed: true,
        ProfileImage: this.ProfileImage as string,
      };

      this.userService.createUser(user).subscribe({
        next: () => {
          this.toastr.success('User saved successfully!', 'Success');
          this.showSuccess = true;
          this.closeForm();
        },
        error: (err) => {
          const errors = err?.error?.errors;
          if (errors) {
            const messages = Object.values(errors).flat().join('<br/>');
            this.toastr.error(messages, 'Validation Error', {
              enableHtml: true,
            });
          } else {
            this.toastr.error(
              err?.error?.message || 'Failed to save user',
              'Error'
            );
          }
        },
      });
    } else {
      this.userForm.markAllAsTouched();

      // Collect client-side validation errors
      const errors: string[] = [];
      const firstNameControl = this.userForm.get('Firstname');
      const lastNameControl = this.userForm.get('Lastname');
      const phoneNumberControl = this.userForm.get('PhoneNumber');
      const mobileNumberControl = this.userForm.get('MobileNumber');
      const emailControl = this.userForm.get('UserEmail');

      if (firstNameControl?.hasError('required')) {
        errors.push('First Name is required.');
      }
      if (lastNameControl?.hasError('required')) {
        errors.push('Last Name is required.');
      }
      if (phoneNumberControl?.hasError('required')) {
        errors.push('Phone Number is required.');
      } else if (phoneNumberControl?.hasError('pattern')) {
        errors.push('Please enter a valid 10-digit phone number.');
      }
      if (mobileNumberControl?.hasError('required')) {
        errors.push('Mobile Number is required.');
      } else if (mobileNumberControl?.hasError('pattern')) {
        errors.push('Please enter a valid 10-digit mobile number.');
      }
      if (emailControl?.hasError('required')) {
        errors.push('Email is required.');
      } else if (emailControl?.hasError('email')) {
        errors.push('Please enter a valid email address.');
      }

      // Show errors nicely with line breaks
      const errorMessage = errors.join('<br/>');
      this.toastr.error(errorMessage, 'Validation Error', { enableHtml: true });
    }
  }
}
