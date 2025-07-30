import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ServiceProvidersService } from '../../services/service-providers/service-providers.service';
import { ServiceProvider, ContactDetail } from '../../models/ServiceProviders';

import {
  CountryISO,
  PhoneNumberFormat,
  SearchCountryField,
} from 'ngx-intl-tel-input';

import { ServiceProviderTypesService } from '../../../service-provider-types/services/serviceProvider-types/service-provider-types.service';
import { ToastrService } from '../../../../../shared/component/toastr/services/toastr.service';
import { UserService } from '../../../../users/services/user.service';
import { User } from '../../../../users/models/User';
import { ServiceProviderTypes } from '../../../service-provider-types/models/ServiceProviderTypes';
import { PROVINCES } from '../../../../../constants/provinces.constant';

@Component({
  selector: 'app-service-providers-popup',
  standalone: false,
  templateUrl: './service-providers-popup.component.html',
  styleUrls: ['./service-providers-popup.component.css'],
})
export class ServiceProvidersPopupComponent implements OnInit {
  @Input() providerData!: ServiceProvider | null;
  @Input() isEdit = false;
  @Output() close = new EventEmitter<void>();
  @Output() formSubmit = new EventEmitter<any>();
  @Input() isEditMode: boolean = false;
  isVerified = false;
  isAccredited = false;
  toggleOptions = false;

  providerForm!: FormGroup;
  provinces = PROVINCES;

  verifiedByList: { id: number; name: string }[] = [];
  openedByList: { id: number; name: string }[] = [];
  authorisedByList: { id: number; name: string }[] = [];
  accreditedByList: { id: number; name: string }[] = [];
  serviceTypesList: { id: number; name: string }[] = [];

  serviceTypes: any[] = [];

  constructor(
    private fb: FormBuilder,
    private service: ServiceProvidersService,
    private toastr: ToastrService,
    private serviceProviderTypesservice: ServiceProviderTypesService,
    private userService: UserService
  ) {}

  private formatDate(dateStr: string | undefined | null): string | null {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  }

  getIdByname(list: any[], name: string): number | null {
    const match = list.find((x) => x.name === name);
    return match ? match.id : null;
  }

  ngOnInit(): void {
    this.providerForm = this.fb.group({
      name: [this.providerData?.Name || '', Validators.required],
      vatNumber: [this.providerData?.VATNumber || '', Validators.required],
      companyRegNo: [
        this.providerData?.CompanyRegNo || '',
        Validators.required,
      ],
      branch: [this.providerData?.Branch || '', Validators.required],
      officeAddress: [
        this.providerData?.OfficeAddress || '',
        Validators.required,
      ],
      storageAddress: [
        this.providerData?.StorageAddress || '',
        Validators.required,
      ],
      townCity: [this.providerData?.TownCity || '', Validators.required],
      province: [this.providerData?.Province || '', Validators.required],

      contactNumbers: this.fb.array(
        this.initContacts(this.providerData?.ContactDetails || [], 'Mobile')
      ),
      faxNumbers: this.fb.array(
        this.initContacts(this.providerData?.ContactDetails || [], 'Fax'),
        Validators.required
      ),
      emailAddresses: this.fb.array(
        this.initEmails(this.providerData?.ContactDetails || [])
      ),

      serviceType: [
        this.providerData?.ServiceProviderTypes || null,
        Validators.required,
      ],
      designationNo: [
        this.providerData?.DesignationNumber || '',
        Validators.required,
      ],

      ratePerKm: [this.providerData?.RatePerKm || '', Validators.required],
      dateAuthorised: [
        this.formatDate(this.providerData?.RateAuthorisedOn) || '',
        Validators.required,
      ],
      // authorisedBy: [
      //   this.getIdByname(
      //     this.authorisedByList,
      //     this.providerData?.RateAuthorisedby || ''
      //   ) || '',
      //   Validators.required,
      // ],
      authorisedBy: ['', Validators.required],
      canEditAddress: [false],
      isActive: [this.providerData?.IsActive || false],
      dateOpened: [
        this.formatDate(this.providerData?.ActiveOn) || '',
        Validators.required,
      ],
      // openedBy: [this.providerData?.IsActiveby || '', Validators.required],
      openedBy: ['', Validators.required],
      isVerified: [false],
      // dateVerified: [
      //   this.formatDate(this.providerData?.IsVerifiedOn) || '',
      //   Validators.required,
      // ],
      dateVerified: [{ value: '', disabled: true }],
      // verifiedBy: [
      //   this.getIdByname(
      //     this.verifiedByList,
      //     this.providerData?.IsVerifiedby || ''
      //   ) || '',
      //   Validators.required,
      // ],
      // verifiedBy: ['', Validators.required],
      verifiedBy: [{ value: '', disabled: true }],

      isAccredited: [false],
      // dateAccredited: [
      //   this.formatDate(this.providerData?.IsAccreditedOn) || '',
      //   Validators.required,
      // ],
      dateAccredited: [{ value: '', disabled: true }],

      // accreditedBy: [
      //   this.getIdByname(
      //     this.accreditedByList,
      //     this.providerData?.IsAccreditedby || ''
      //   ) || '',
      //   Validators.required,
      // ],
      // accreditedBy: ['', Validators.required],
      accreditedBy: [{ value: '', disabled: true }],
    });

    this.loadUsers();
    this.loadServiceTypes();
    // this.serviceProviderTypesservice.getAll().subscribe({
    //   next: (data) => {
    //     this.serviceTypes = data;
    //   },
    //   error: (err) => {
    //     console.error('Failed to load service provider types', err);
    //     this.toastr.show('Could not load service types.', 'error');
    //   },
    // });
  }

  loadUsers(): void {
    this.userService.getAllUsers().subscribe({
      next: (users: User[]) => {
        const formattedUsers = users
          .filter((user) => user.IsActive && user.AspNetUserId !== undefined) //    This line is selecting only active users who have an Id
          .map((user) => ({
            id: user.AspNetUserId!,
            name: `${user.Firstname} ${user.Lastname}`,
          }));

        this.verifiedByList = formattedUsers;
        this.openedByList = formattedUsers;
        this.authorisedByList = formattedUsers;
        this.accreditedByList = formattedUsers;

        // Now patch the select dropdown fields using display-to-id conversion
        this.providerForm.patchValue({
          authorisedBy: this.getIdByname(
            this.authorisedByList,
            this.providerData?.AuthorisedBy !== undefined
              ? this.providerData.AuthorisedBy.toString()
              : ''
          ),
          openedBy: this.getIdByname(
            this.openedByList,
            this.providerData?.ActiveBy !== undefined
              ? this.providerData.ActiveBy.toString()
              : ''
          ),
          verifiedBy: this.getIdByname(
            this.verifiedByList,
            this.providerData?.VerifiedBy !== undefined
              ? this.providerData.VerifiedBy.toString()
              : ''
          ),
          accreditedBy: this.getIdByname(
            this.accreditedByList,
            this.providerData?.AccreditedBy !== undefined
              ? this.providerData.AccreditedBy.toString()
              : ''
          ),
        });
      },
      error: (err) => {
        console.error('Failed to load users:', err);
      },
    });
  }

  // loadServiceTypes() {
  //   this.serviceProviderTypesservice.getAll().subscribe({
  //     next: (types: ServiceProviderTypes[]) => {
  //       this.serviceTypesList = types
  //           .filter(type => type.IsActive && !type.IsDelete)
  //         .map((type) => ({
  //           id: type.ServiceProviderTypeId!,
  //           name: type.Description!,
  //         }));
  //     },
  //     error: (err) => {
  //       console.error('Failed to load service types', err);
  //     },
  //   });
  // }

  //      loadServiceTypes() {
  //   this.serviceProviderTypesservice.getAll().subscribe({
  //     next: (types: ServiceProviderTypes[]) => {
  //       const existingId = this.providerData?.ServiceProviderServiceTypeId;

  //       const allTypes = types.map((type) => ({
  //         id: type.ServiceProviderTypeId!,
  //         name: type.Description!,
  //         isDeleted: !!type.IsDelete,
  //       }));

  //       const matchingType = allTypes.find(t => t.id === existingId);

  //       if (matchingType && matchingType.isDeleted) {
  //         matchingType.name += ' (Deleted)';
  //       }

  //       this.serviceTypesList = allTypes.map((type) => ({
  //         id: type.id,
  //         name: type.name,
  //         isDeleted: type.isDeleted,
  //       }));
  //     },
  //     error: (err) => {
  //       console.error('Failed to load service types', err);
  //     },
  //   });
  // }

  loadServiceTypes() {
    this.serviceProviderTypesservice.getAll().subscribe({
      next: (types: ServiceProviderTypes[]) => {
        const selectedId =
          this.providerData?.ServiceProviderTypes?.ServiceProviderTypeId;

        // Step 1: Filter active + not deleted types
        let serviceTypes = types
          .filter((type) => type.IsActive && !type.IsDelete)
          .map((type) => ({
            id: type.ServiceProviderTypeId!,
            name: type.Description!,
            isDeleted: false,
          }));

        // Step 2: Check if selected ID is missing in the list due to deletion
        const selectedType = types.find(
          (type) => type.ServiceProviderTypeId === selectedId
        );

        if (
          selectedType &&
          (selectedType.IsDelete || !selectedType.IsActive) &&
          !serviceTypes.find((t) => t.id === selectedId)
        ) {
          // Add the deleted/inactive type back with indication
          serviceTypes.push({
            id: selectedType.ServiceProviderTypeId!,
            name: `${selectedType.Description!} (Deleted)`,
            isDeleted: true,
          });
        }

        this.serviceTypesList = serviceTypes;
      },
      error: (err) => {
        console.error('Failed to load service types', err);
      },
    });
  }

  onAccreditedToggle() {
    const accredited = this.providerForm.get('isAccredited')?.value;
    this.toggleAccreditedFields(accredited);
  }
  toggleAccreditedFields(accredited: boolean) {
    this.isAccredited = accredited;
    if (accredited) {
      this.providerForm.get('dateAccredited')?.enable();
      this.providerForm.get('accreditedBy')?.enable();
    } else {
      this.providerForm.get('dateAccredited')?.disable();
      this.providerForm.get('accreditedBy')?.disable();
      this.providerForm.get('dateAccredited')?.setValue('');
      this.providerForm.get('accreditedBy')?.setValue(null);
    }
  }

  onVerifiedToggle() {
    const verified = this.providerForm.get('isVerified')?.value;
    this.toggleVerifiedFields(verified);
  }

  toggleVerifiedFields(verified: boolean) {
    this.isVerified = verified;

    if (verified) {
      this.providerForm.get('dateVerified')?.enable();
      this.providerForm.get('verifiedBy')?.enable();
    } else {
      this.providerForm.get('dateVerified')?.disable();
      this.providerForm.get('verifiedBy')?.disable();
      this.providerForm.get('dateVerified')?.setValue('');
      this.providerForm.get('verifiedBy')?.setValue(null);
    }
  }

  get contactNumbers(): FormArray {
    return this.providerForm.get('contactNumbers') as FormArray;
  }

  get faxNumbers(): FormArray {
    return this.providerForm.get('faxNumbers') as FormArray;
  }

  get emailAddresses(): FormArray {
    return this.providerForm.get('emailAddresses') as FormArray;
  }

  private createContactRow(value: any = {}): FormGroup {
    return this.fb.group({
      number: [value.Value || ''],
      name: [value.Name || ''],
      comment: [value.Comments || ''],
    });
  }

  private createFaxRow(value: any = {}): FormGroup {
    return this.fb.group({
      fax: [value.Value || ''],
      name: [value.Name || ''],
      comment: [value.Comments || ''],
    });
  }

  private createEmailRow(value: any = {}): FormGroup {
    return this.fb.group({
      email: [value.Value || '', [Validators.required, Validators.email]],
      comment: [value.Comments || ''],
    });
  }

  private initContacts(details: ContactDetail[], type: string): FormGroup[] {
    const filtered = details.filter((d) => d.Type === type);
    return filtered.length > 0
      ? filtered.map((c) =>
          type === 'Mobile' ? this.createContactRow(c) : this.createFaxRow(c)
        )
      : [type === 'Mobile' ? this.createContactRow() : this.createFaxRow()];
  }

  private initEmails(details: ContactDetail[]): FormGroup[] {
    const emails = details.filter((d) => d.Type === 'Email');
    return emails.length > 0
      ? emails.map((e) => this.createEmailRow(e))
      : [this.createEmailRow()];
  }

  addContactRow(): void {
    if (this.contactNumbers.length < 5) {
      this.contactNumbers.push(this.createContactRow());
    }
  }

  removeContactRow(index: number): void {
    if (this.contactNumbers.length > 1) {
      this.contactNumbers.removeAt(index);
    }
  }

  addFaxRow(): void {
    if (this.faxNumbers.length < 3) {
      this.faxNumbers.push(this.createFaxRow());
    }
  }

  removeFaxRow(index: number): void {
    if (this.faxNumbers.length > 1) {
      this.faxNumbers.removeAt(index);
    }
  }

  addEmailRow(): void {
    if (this.emailAddresses.length < 2) {
      this.emailAddresses.push(this.createEmailRow());
    }
  }

  removeEmailRow(index: number): void {
    if (this.emailAddresses.length > 1) {
      this.emailAddresses.removeAt(index);
    }
  }

  onClose(): void {
    this.close.emit();
  }

  onCancel(): void {
    this.close.emit();
  }

  onSubmit(): void {
    if (!this.providerForm.valid) {
      const invalid = Object.keys(this.providerForm.controls).filter(
        (control) => this.providerForm.get(control)?.invalid
      );
      console.log('Invalid controls:', invalid);
      this.toastr.show('Please fill in all required fields.', 'error');
      this.providerForm.markAllAsTouched();
      return;
    }

    const formData = this.providerForm.getRawValue();

    const contacts = formData.contactNumbers || [];
    const faxes = formData.faxNumbers || [];
    const emails = formData.emailAddresses || [];

    const contactDetails = this.mapContactDetails(contacts, faxes, emails);

    const payload = {
      Name: formData.name?.trim(),
      VATNumber: formData.vatNumber?.trim(),
      CompanyRegNo: formData.companyRegNo?.trim(),
      Branch: formData.branch?.trim(),
      OfficeAddress: formData.officeAddress?.trim(),
      StorageAddress: formData.storageAddress?.trim(),
      TownCity: formData.townCity?.trim(),
      Province: formData.province?.trim(),
    
      ServiceProviderTypeId: formData.serviceType?.id,
      DesignationNumber: formData.designationNo,
      Manager: 'Thabo Mokoena', // or formData.manager if dynamic
      RatePerKm: Number(formData.ratePerKm),

      AuthorisedBy: formData.authorisedBy,
      IsActive: formData.isActive,
      ActiveBy: formData.openedBy,
      IsVerified: formData.isVerified,
      VerifiedBy: formData.verifiedBy,
      IsAccredited: formData.isAccredited,
      AccreditedBy: formData.accreditedBy,

      RateAuthorisedOn: formData.dateAuthorised,
      ActiveOn: formData.dateOpened,
      VerifiedOn: formData.dateVerified,
      AccreditedOn: formData.dateAccredited,

      ContactDetails: contactDetails,
      IsDeleted: false,
    };

    console.log('Payload to submit:', payload);

    const request$ =
      this.isEdit && this.providerData?.ServiceProviderId
        ? this.service.updateServiceProvider(
            this.providerData.ServiceProviderId,
            payload
          )
        : this.service.addServiceProvider(payload);

    request$.subscribe({
      next: () => {
        const msg = this.isEdit ? 'updated' : 'added';
        this.toastr.show(`Service provider ${msg} successfully!`, 'success');
        this.formSubmit.emit(payload);
        this.close.emit();
      },
      error: (err) => {
        this.toastr.show('Failed to save service provider', 'error');
        console.error('Error:', err);
      },
    });
  }

  private mapContactDetails(
    contacts: any[],
    faxes: any[],
    emails: any[]
  ): ContactDetail[] {
    const contactList: ContactDetail[] = [];

    contacts.forEach((c) => {
      if (c.number && c.number?.internationalNumber) {
        const dialCode = c.number?.dialCode || '';
        const phoneValue = c.number?.number || '';

        contactList.push({
          Id: 0,
          Type: 'Mobile',
          Code: dialCode,
          Value: phoneValue,
          Name: c.name || '',
          Comments: c.comment || '',
        });
      }
    });

    faxes.forEach((f) => {
      if (f.fax && f.fax?.internationalNumber) {
        const dialCode = f.fax?.dialCode || '';
        const faxValue = f.fax?.number || '';

        contactList.push({
          Id: 0,
          Type: 'Fax',
          Code: dialCode,
          Value: faxValue,
          Name: f.name || '',
          Comments: f.comment || '',
        });
      }
    });

    emails.forEach((e) => {
      if (e.email) {
        contactList.push({
          Id: 0,
          Type: 'Email',
          Code: '',
          Value: e.email,
          Name: '',
          Comments: e.comment || '',
        });
      }
    });

    return contactList;
  }

  // openedByList = [
  //   { id: 1, name: 'Alice Smith' },
  //   { id: 2, name: 'Bob Johnson' },
  // ];
  // verifiedByList = [
  //   { id: 1, name: 'John Smith' },
  //   { id: 2, name: 'Jane Doe' },
  // ];

  // serviceTypeslist = [
  //   { id: 1, name: 'Type A' },
  //   { id: 2, name: 'Type B' },
  //   { id: 3, name: 'Type C' },
  // ];

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

  getNameById(list: any[], id: number): string {
    const match = list.find((x) => x.id === id);
    return match ? match.name : '';
  }

  //   selectedServiceTypeIsDeleted(): boolean {
  //   const selectedId = this.providerForm.get('serviceType')?.value;
  //   return this.serviceTypesList.some(
  //     (t) => t.id === selectedId && t.IsDeleted
  //   );
  // }
}
