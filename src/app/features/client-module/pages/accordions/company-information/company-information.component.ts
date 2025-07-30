import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  CountryISO,
  PhoneNumberFormat,
  SearchCountryField,
} from 'ngx-intl-tel-input';
import { Client } from '../../../models/Client';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
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
  @Input() clientToEdit!: Client;
  @Output() close = new EventEmitter<void>();
  @Input() isEditMode: boolean = false;

  clientGroup: ClientGroup[] = [];
  clientForm!: FormGroup;
  ProfileImage: string | ArrayBuffer | null = null;
  toggleOptions = false;
  selectedValue: number | null = null;
  showSuccess = false;

  SearchCountryField = SearchCountryField;
  CountryISO = CountryISO;
  PhoneNumberFormat = PhoneNumberFormat;
  preferredCountries: CountryISO[] = [
    CountryISO.UnitedStates,
    CountryISO.UnitedKingdom,
  ];

  // **FIX** Add searchFields for template binding
  searchFields = [
    SearchCountryField.Name,
    SearchCountryField.DialCode,
    SearchCountryField.Iso2,
  ];

  dropdownOptions = [
    { label: 'Option 1', value: 1 },
    { label: 'Option 2', value: 2 },
    { label: 'Option 3', value: 3 },
  ];

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private clientGroupService: ClientGroupService,
    private tabState: TabStateService
  ) { }

  ngOnInit(): void {
    // Initialize form
    this.clientForm = this.fb.group({
      CompanyName: ['', Validators.required],
      ClientGroupId: [null, Validators.required],
      Address: [''],
      Telephone: ['', Validators.required],
      Fax: [''],
      Mobile: ['', Validators.required],
      WebURL: [
        '',
        Validators.pattern(
          /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/i
        ),
      ],
      CompanyLogo: [''],
      IsActive: [true],
      canEditAddress: [false],
    });

    // If editing, patch existing values
    if (this.isEditMode && this.clientToEdit) {
      this.clientForm.patchValue({
        CompanyName: this.clientToEdit.ClientName || '',
        ClientGroupId: this.clientToEdit.ClientGroupId || null,
        Address: this.clientToEdit.Address || '',
        Telephone: this.clientToEdit.Tel || '',
        Fax: this.clientToEdit.Fax || '',
        Mobile: this.clientToEdit.Mobile || '',
        WebURL: this.clientToEdit.WebURL || '',
        CompanyLogo: this.clientToEdit.CompanyLogo || '',
        IsActive: this.clientToEdit.IsActive ?? true,
      });
      this.ProfileImage = this.clientToEdit.CompanyLogo || null;

      // Push initial data to TabState
      this.tabState.updateCompanyInfo(this.clientToEdit);
    }

    // Auto-sync form changes with TabStateService
    this.clientForm.valueChanges.subscribe((values) => {
      this.tabState.updateCompanyInfo({
        ClientName: values.CompanyName,
        PrintName: values.CompanyName,
        ClientGroupId: values.ClientGroupId || 1,
        Address: values.Address || '',
        Tel: values.Telephone?.e164Number || '',  // Extract e164Number
        Fax: values.Fax?.e164Number || '',        // Extract e164Number
        Mobile: values.Mobile?.e164Number || '',  // Extract e164Number
        WebURL: values.WebURL || '',
        CompanyLogo: values.CompanyLogo || '',
        IsActive: values.IsActive ?? true,
      });
    });

    // Load client groups
    this.clientGroupService.getClientGroups().subscribe({
      next: (groups) => (this.clientGroup = groups),
      error: (err) => console.error('Failed to load client groups:', err),
    });
  }

  closeForm(): void {
    this.close.emit();
  }

  onFileSelected(event: any): void {
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

  removeImage(): void {
    this.ProfileImage = '';
    this.clientForm.get('CompanyLogo')?.setValue('');
    this.toggleOptions = false;
  }

  clearField(controlName: string): void {
    this.clientForm.get(controlName)?.setValue('');
  }
}
