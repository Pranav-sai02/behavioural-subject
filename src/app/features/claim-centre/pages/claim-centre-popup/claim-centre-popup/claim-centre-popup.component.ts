import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CountryISO, SearchCountryField } from 'ngx-intl-tel-input';
import { ClaimCentre } from '../../../models/ClaimCentre';
import { ClaimCentreService } from '../../../services/claim-centre-services/claim-centre.service';


@Component({
  selector: 'app-claim-centre-popup',
  standalone: false,
  templateUrl: './claim-centre-popup.component.html',
  styleUrl: './claim-centre-popup.component.css',
})
export class ClaimCentrePopupComponent {
  @Input() initialData?: ClaimCentre;
  @Output() close = new EventEmitter<void>();
  @Output() submit = new EventEmitter<ClaimCentre>();

  providerForm!: FormGroup;

  clientGroups = [
    { ClientGroupId: 1, Name: '1 Life Funeral', IsActive: true },
    { ClientGroupId: 2, Name: 'ABC Corp', IsActive: true },
    { ClientGroupId: 3, Name: 'XYZ Services', IsActive: true },
  ];
  provinces = [
    'Eastern Cape',
    'Free State',
    'Gauteng',
    'KwaZulu-Natal',
    'Limpopo',
    'Mpumalanga',
    'Northern Cape',
    'North West',
    'Western Cape',
  ];

  CountryISO = CountryISO;
  searchFields = [SearchCountryField.All];

  constructor(
    private fb: FormBuilder,
    private claimCentreService: ClaimCentreService
  ) {}

  ngOnInit(): void {
    this.providerForm = this.fb.group({
      Name: [''],
      ClientGroupId: [null],
      Branch: [''],
      Address: [''],
      Telephone: [''],
      Fax: [''],
      TownCity: [''],
      Province: [''],
      IsActive: [false],
    });

    if (this.initialData) {
      this.providerForm.patchValue({
        ...this.initialData,
        Telephone: this.initialData.Tel
          ? { number: this.initialData.Tel }
          : null,
        Fax: this.initialData.Fax ? { number: this.initialData.Fax } : null,
      });
    }
  }

  onSubmit(): void {
    if (this.providerForm.valid) {
      const formData = { ...this.providerForm.value };

      // ✅ Convert ngx-intl-tel-input values to string
      formData.Tel = formData.Telephone?.internationalNumber || '';
      formData.Fax = formData.Fax?.internationalNumber || '';

      if (!formData.Tel) formData.Tel = '';
      if (!formData.Fax) formData.Fax = '';

      delete formData.Telephone;
      delete formData.Fax;

      this.claimCentreService.createClaimCentre(formData).subscribe({
        next: (res) => {
          console.log('Saved successfully:', res);
          this.submit.emit(res); // emit saved result
          this.close.emit(); // optionally close the popup
        },
        error: (err) => {
          console.error('Error saving claim centre:', err);
        },
      });
    } else {
      this.providerForm.markAllAsTouched();
    }
  }

  onClose(): void {
    this.close.emit();
  }
}
