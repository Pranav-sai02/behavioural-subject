import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  CountryISO,
  PhoneNumberFormat,
  SearchCountryField,
} from 'ngx-intl-tel-input';
import { Client } from '../../models/Client';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { ClientService } from '../../services/client-services/client.service';
import { TabStateService } from '../../services/tabs-behavioural-service/tabState.service';

@Component({
  selector: 'app-client-popup',
  standalone: false,
  templateUrl: './client-popup.component.html',
  styleUrl: './client-popup.component.css',
})
export class ClientPopupComponent implements OnInit {
  public selectedTab: number = 0;
  showConfirmModal = false;
  showSuccess = false;

  tabs = [
    { label: 'Details', type: 'details' },
    { label: 'Services', type: 'services' },
    { label: 'Rating-Questions', type: 'rating-questions' },
    { label: 'Documents', type: 'documents' },
    { label: 'Claim-Centre', type: 'claim-centre' },
    { label: 'Service-Provider', type: 'service-provider' },
    { label: 'Claim-Controller', type: 'claim-controller' },
  ];

  @Input() clientToEdit!: Client;
  @Input() isEditMode: boolean = false;
  @Output() close = new EventEmitter<void>();

  constructor(
    private clientService: ClientService,
    private tabState: TabStateService
  ) { }

  ngOnInit(): void {
    if (this.isEditMode && this.clientToEdit) {
      this.tabState.updateDetails(this.clientToEdit);
    }
  }

  selectTab(index: number): void {
    this.selectedTab = index;
  }

  confirmClose(): void {
    this.showConfirmModal = true;
  }

  confirmYes(): void {
    this.showConfirmModal = false;
    this.close.emit();
  }

  closeForm(): void {
    this.showConfirmModal = false;
    this.close.emit();
  }

  /** Prepares payload with safe defaults */
  private preparePayload(fullClient: Client): any {
    return {
      clientGroupId: fullClient.ClientGroupId || 1,
      clientName: fullClient.ClientName?.trim() || 'Test Client',
      doTextExport: fullClient.DoTextExport ?? true,
      isActive: fullClient.IsActive ?? true,
      nearestClaimCentre: fullClient.NearestClaimCentre ?? false,
      policyLookup: fullClient.PolicyLookup ?? true,
      processClaims: fullClient.ProcessClaims ?? true,
      useMembershipNumber: fullClient.UseMembershipNumber ?? false,
      validate: fullClient.Validate ?? true,
      validationExternalFile: fullClient.ValidationExternalFile ?? false,
      validationOther: fullClient.ValidationOther ?? false,
      validationWeb: fullClient.ValidationWeb ?? true,
      webValidationAVS: fullClient.WebValidationAVS ?? true,
      webValidationOTH: fullClient.WebValidationOTH ?? false,
      enableVoucherExportOnDeathClaim: fullClient.EnableVoucherExportOnDeathClaim ?? false,

      claimsManager: fullClient.ClaimsManager || 'Jane Smith',
      address: fullClient.Address || '45 Baker Street, Johannesburg',
      claimFormDeclaration: fullClient.ClaimFormDeclaration || 'This is a declaration.',
      claimFormDeclarationPlain: fullClient.ClaimFormDeclarationPlain || 'Plain declaration text.',
      code: fullClient.Code || 'D903',
      companyLogo: fullClient.CompanyLogo || 'logo.png',
      companyLogoData: fullClient.CompanyLogoData || null,
      fax: fullClient.Fax || '011-555-1234',
      mobile: fullClient.Mobile || '083-555-9876',
      otherValidationNotes: fullClient.OtherValidationNotes || 'None',
      policyFile: fullClient.PolicyFile || 'policy.pdf',
      policyLabel: fullClient.PolicyLabel || 'Standard Policy',
      policyLookupFileData: fullClient.PolicyLookupFileData || null,
      policyLookupFileName: fullClient.PolicyLookupFileName || 'lookup.pdf',
      policyLookupPath: fullClient.PolicyLookupPath || '/docs/policy',
      printName: fullClient.PrintName || fullClient.ClientName || 'Delta Inc',
      tel: fullClient.Tel || '011-111-1111',

      validationLabel1: fullClient.ValidationLabel1 || 'Label 1',
      validationLabel2: fullClient.ValidationLabel2 || 'Label 2',
      validationLabel3: fullClient.ValidationLabel3 || 'Label 3',
      validationLabel4: fullClient.ValidationLabel4 || 'Label 4',
      validationLabel5: fullClient.ValidationLabel5 || 'Label 5',
      validationLabel6: fullClient.ValidationLabel6 || 'null',

      webURL: fullClient.WebURL || 'https://delta.com',
      webValidationURL: fullClient.WebValidationURL || 'https://delta.com/validate',

      clientServiceProvider: fullClient.ClientServiceProvider || [],
      clientService: fullClient.ClientService || [],
      clientRatingQuestion: fullClient.ClientRatingQuestion || [],
      clientDocument: fullClient.clientDocument || [],
      clientClaimController: fullClient.ClientClaimController || [],
      clientClaimCentre: fullClient.ClientClaimCentre || []
    };
  }

  save(): void {
    this.tabState.gatherFullClient().subscribe((fullClient: Client) => {
      console.log('Merged client data to save:', fullClient);

      const payload = this.preparePayload(fullClient);
      console.log('Final payload:', payload);

      const request$ = this.isEditMode
        ? this.clientService.updateClient(payload.ClientId, payload)
        : this.clientService.createClient(payload);

      request$.subscribe({
        next: () => {
          this.showSuccess = true;
          setTimeout(() => {
            this.showSuccess = false;
            this.closeForm();
          }, 2000);
        },
        error: (err) => {
          console.error('Failed to save client:', err);
          if (err?.error?.errors) {
            const messages = Object.values(err.error.errors).flat().join('\n');
            alert(`Validation failed:\n${messages}`);
          } else {
            alert('Failed to save client.');
          }
        },
      });
    });
  }

  printPage(): void {
    window.print();
  }
}

