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
import { TabStateService } from '../../../services/tabs-behavioural-service/tabState.service';

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
    private clientGroupService: ClientGroupService,
    private tabState: TabStateService
  ) {}

  ngOnInit(): void {
    this.clientForm = this.fb.group({
      CompanyName: [this.clientToEdit?.ClientName || '', Validators.required],
      ClientGroupId: [
        this.clientToEdit?.ClientGroupId || null,
        Validators.required,
      ],
      Address: [this.clientToEdit?.Address || ''],
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
      canEditAddress: [false],
    });

    // Load Client Groups
    this.clientGroupService.getClientGroups().subscribe({
      next: (groups) => {
        this.clientGroup = groups;
      },
      error: (err) => {
        console.error('Failed to load client groups:', err);
      },
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

  /**
   * Save updates into TabStateService with safe defaults
   */
  onSave(): void {
    if (this.clientForm.valid) {
      const formValues = this.clientForm.value;

      this.tabState.updateDetails({
        ClientName: formValues.CompanyName,
        PrintName: formValues.CompanyName,
        ClientGroupId: formValues.ClientGroupId || 1,
        Address: formValues.Address || '123 Dummy Street',
        Tel: formValues.Telephone || '123-456-7890',
        Fax: formValues.Fax || '',
        Mobile: formValues.Mobile || '9876543210',
        WebURL: formValues.WebURL || 'https://example.com',
        CompanyLogo: formValues.CompanyLogo || '',
        IsActive: formValues.IsActive ?? true,

        // Additional required fields with defaults
        ClaimsManager: '',
        ClaimFormDeclaration: '',
        ClaimFormDeclarationPlain: '',
        Code: '',
        CompanyLogoData: '',
        DoTextExport: true,
        NearestClaimCentre: true,
        OtherValidationNotes: '',
        PolicyFile: '',
        PolicyLabel: '',
        PolicyLookup: true,
        PolicyLookupFileData: '',
        PolicyLookupFileName: '',
        PolicyLookupPath: '',
        ProcessClaims: true,
        UseMembershipNumber: true,
        Validate: true,
        ValidationExternalFile: true,
        ValidationLabel1: '',
        ValidationLabel2: '',
        ValidationLabel3: '',
        ValidationLabel4: '',
        ValidationLabel5: '',
        ValidationLabel6: '',
        ValidationOther: true,
        ValidationWeb: true,
        WebValidationAVS: true,
        WebValidationOTH: true,
        WebValidationURL: '',
        EnableVoucherExportOnDeathClaim: true,
      });

      this.toastr.success('Company details updated in Tab State', 'Success');
    } else {
      this.clientForm.markAllAsTouched();
      this.toastr.error('Please fix validation errors before saving.', 'Error');
    }
  }

  dropdownOptions = [
    { label: 'Option 1', value: 1 },
    { label: 'Option 2', value: 2 },
    { label: 'Option 3', value: 3 },
  ];
}
