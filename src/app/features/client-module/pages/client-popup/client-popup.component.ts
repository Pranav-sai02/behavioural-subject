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
      // Pre-fill all accordions with existing data
      this.tabState.updateCompanyInfo(this.clientToEdit);
      this.tabState.updateClaimInfo(this.clientToEdit);
      this.tabState.updateClientData(this.clientToEdit);
      this.tabState.updateCustomLabels(this.clientToEdit);
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

  /** Prepare payload with safe defaults */
  private preparePayload(fullClient: Client): any {
  return {
    clientId: fullClient.ClientId || 0,
    clientGroupId: fullClient.ClientGroupId || 1,
    clientName: fullClient.ClientName?.trim() || '',
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

    claimsManager: fullClient.ClaimsManager || '',
    address: fullClient.Address || '',
    claimFormDeclaration: fullClient.ClaimFormDeclaration || '',
    claimFormDeclarationPlain: fullClient.ClaimFormDeclarationPlain || '',
    code: fullClient.Code || '',
    companyLogo: fullClient.CompanyLogo || '',
    companyLogoData: fullClient.CompanyLogoData || null,
    fax: fullClient.Fax || '',
    mobile: fullClient.Mobile || '',
    otherValidationNotes: fullClient.OtherValidationNotes || '',
    policyFile: fullClient.PolicyFile || '',
    policyLabel: fullClient.PolicyLabel || '',
    policyLookupFileData: fullClient.PolicyLookupFileData || null,
    policyLookupFileName: fullClient.PolicyLookupFileName || '',
    policyLookupPath: fullClient.PolicyLookupPath || '',
    printName: fullClient.PrintName || fullClient.ClientName || '',
    tel: fullClient.Tel || '',

    validationLabel1: fullClient.ValidationLabel1 || '',
    validationLabel2: fullClient.ValidationLabel2 || '',
    validationLabel3: fullClient.ValidationLabel3 || '',
    validationLabel4: fullClient.ValidationLabel4 || '',
    validationLabel5: fullClient.ValidationLabel5 || '',
    validationLabel6: fullClient.ValidationLabel6 || '',

    webURL: fullClient.WebURL || '',
    webValidationURL: fullClient.WebValidationURL || '',

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
        ? this.clientService.updateClient(payload.clientId, payload)
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

