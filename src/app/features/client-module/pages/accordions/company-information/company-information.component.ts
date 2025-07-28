import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  CountryISO,
  PhoneNumberFormat,
  SearchCountryField,
} from 'ngx-intl-tel-input';
import { Client } from '../../../models/Client';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ClientService } from '../../../services/client-services/client.service';
import { ClientGroup } from '../../../models/ClientGroup';
import { ClientGroupService } from '../../../services/client-group-services/client-group.service';

@Component({
  selector: 'app-company-information',
  standalone: false,
  templateUrl: './company-information.component.html',
  styleUrl: './company-information.component.css',
})
export class CompanyInformationComponent {
  selectedValue: number | null = null;
  separateDialCode = false;
  SearchCountryField = SearchCountryField;
  CountryISO = CountryISO;
  PhoneNumberFormat = PhoneNumberFormat;
  preferredCountries: CountryISO[] = [
    CountryISO.UnitedStates,
    CountryISO.UnitedKingdom,
  ];
  searchFields = [
    SearchCountryField.Name,
    SearchCountryField.DialCode,
    SearchCountryField.Iso2,
  ];

  @Input() clientToEdit!: Client;
  @Output() close = new EventEmitter<void>();
  @Input() isEditMode: boolean = false;

  clientGroup: ClientGroup[] = [];



  clientForm!: FormGroup;
  showSuccess = false;

  ProfileImage: String | ArrayBuffer | null = null;
  defaultImage =
    'https://static.vecteezy.com/system/resources/thumbnails/023/329/367/small/beautiful-image-in-nature-of-monarch-butterfly-on-lantana-flower-generative-ai-photo.jpg';

  toggleOptions: boolean = false;

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private clientService: ClientService,
    private clientGroupService: ClientGroupService
  ) {}

  ngOnInit(): void {
  this.clientForm = this.fb.group({
    CompanyName: [this.clientToEdit?.ClientName || '', Validators.required],
    ClientGroupId: [this.clientToEdit?.ClientGroupId || null, Validators.required],
    Address: [this.clientToEdit?.Address || ''],
    // AreaCode: [this.clientToEdit?.AreaCodes?.AreaCode || '', Validators.required],
    Telephone: [this.clientToEdit?.Tel || '', Validators.required],
    Fax: [this.clientToEdit?.Fax || ''],
    Mobile: [this.clientToEdit?.Mobile || '', Validators.required],
    WebURL: [
      this.clientToEdit?.WebURL || '',
      Validators.pattern(
        /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/i
      ),
    ],
    CompanyLogo: [this.clientToEdit?.CompanyLogo || ''],
    IsActive: [this.clientToEdit?.IsActive ?? true],
    canEditAddress: [false]
  });

  // ✅ Load Client Groups
  this.clientGroupService.getClientGroups().subscribe({
    next: (groups) => {
      this.clientGroup = groups;
      console.log('Client groups loaded:', this.clientGroup);
    },
    error: (err) => {
      console.error('Failed to load client groups:', err);
    }
  });

  if (this.clientToEdit?.CompanyLogo) {
    this.ProfileImage = this.clientToEdit.CompanyLogo;
  }
}


  closeForm() {
    this.close.emit();
  }

  onCancel(): void {
    this.closeForm();
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.ProfileImage = reader.result as string;
        this.clientForm.get('CompanyLogo')?.setValue(this.ProfileImage);
        this.toggleOptions = false;
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage() {
    this.ProfileImage = '';
    this.clientForm.get('CompanyLogo')?.setValue('');
    this.toggleOptions = false;
  }

  openCamera() {
    alert('Camera functionality can be implemented via native device plugins.');
    this.toggleOptions = false;
  }

  clearField(controlName: string): void {
    this.clientForm.get(controlName)?.setValue('');
  }

  onEditClick(): void {
    console.log('Edit button clicked');
  }

  onSave() {
    if (this.clientForm.valid) {
      const formValues = this.clientForm.value;

      const client: Client = {
        ...this.clientToEdit,
        ClientName: formValues.CompanyName,
        ClientGroup: { Name: formValues.ClientGroup } as any,
        Address: formValues.Address,
        // AreaCodes: { AreaCode: formValues.AreaCode } as any,
        Tel: formValues.Telephone,
        Fax: formValues.Fax,
        Mobile: formValues.Mobile,
        WebURL: formValues.WebURL,
        CompanyLogo: formValues.CompanyLogo,
        IsActive: formValues.IsActive,
        PrintName: formValues.CompanyName,

        // Optional or reused properties
        ClientId: this.clientToEdit?.ClientId ?? 0,
        ClientGroupId: this.clientToEdit?.ClientGroupId ?? 0,
        ClaimFormDeclaration: null,
        ClaimFormDeclarationPlain: null,
        Code: '',
        CompanyLogoData: null,
        DoTextExport: false,
        NearestClaimCentre: false,
        OtherValidationNotes: null,
        PolicyFile: '',
        PolicyLabel: '',
        PolicyLookup: false,
        PolicyLookupFileData: null,
        PolicyLookupFileName: null,
        PolicyLookupPath: null,
        ProcessClaims: false,
        UseMembershipNumber: false,
        Validate: false,
        ValidationExternalFile: false,
        ValidationLabel1: null,
        ValidationLabel2: null,
        ValidationLabel3: null,
        ValidationLabel4: null,
        ValidationLabel5: null,
        ValidationLabel6: null,
        ValidationOther: false,
        ValidationWeb: false,
        WebValidationAVS: false,
        WebValidationOTH: false,
        WebValidationURL: '',
        EnableVoucherExportOnDeathClaim: false,
      };

      const request$ =
        client.ClientId && client.ClientId !== 0
          ? this.clientService.updateClient(client.ClientId, client)
          : this.clientService.createClient(client);

      request$.subscribe({
        next: () => {
          this.toastr.success(
            `Client ${client.ClientId ? 'updated' : 'created'} successfully!`,
            'Success'
          );
          this.showSuccess = true;
          setTimeout(() => {
            this.showSuccess = false;
            this.closeForm();
          }, 3000);
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
              err?.error?.message || 'Failed to save client',
              'Error'
            );
          }
        },
      });
    } else {
      this.clientForm.markAllAsTouched();

      const errors: string[] = [];

      const nameControl = this.clientForm.get('CompanyName');
      const mobileControl = this.clientForm.get('Mobile');
      const phoneControl = this.clientForm.get('Telephone');
      const webControl = this.clientForm.get('WebURL');

      if (nameControl?.hasError('required')) {
        errors.push('Company Name is required.');
      }
      if (mobileControl?.hasError('required')) {
        errors.push('Mobile Number is required.');
      }
      if (phoneControl?.hasError('required')) {
        errors.push('Phone Number is required.');
      }
      if (webControl?.hasError('pattern')) {
        errors.push('Invalid Web URL.');
      }

      this.toastr.error(errors.join('<br/>'), 'Validation Error', {
        enableHtml: true,
      });
    }
  }

  dropdownOptions = [
  { label: 'Option 1', value: 1 },
  { label: 'Option 2', value: 2 },
  { label: 'Option 3', value: 3 },
];
}
