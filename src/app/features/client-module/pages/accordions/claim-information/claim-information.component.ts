import { Component } from '@angular/core';
import { TabStateService } from '../../../services/tabs-behavioural-service/tabState.service';

@Component({
  selector: 'app-claim-information',
  standalone: false,
  templateUrl: './claim-information.component.html',
  styleUrl: './claim-information.component.css',
})
export class ClaimInformationComponent {
  editorContent: string = '';
  selectedManager: string = '';
  claimDeclaration = '';
  processClaims = false;
  nearestClaimCentre = false;
  enableDeathClaimVoucher = false;

  claimsManagers = [
    { value: 'manager1', label: 'John Doe' },
    { value: 'manager2', label: 'Jane Smith' },
    { value: 'manager3', label: 'Michael Johnson' }
  ];

  constructor(private tabState: TabStateService) {}

  /**
   * Auto-update claim info in TabStateService when any field changes
   */
  updateClaimState(): void {
    this.tabState.updateClaimInfo({
      ClaimsManager: this.selectedManager || '',
      ClaimFormDeclaration: this.claimDeclaration || '',
      ClaimFormDeclarationPlain: this.editorContent || '',
      ProcessClaims: this.processClaims,
      NearestClaimCentre: this.nearestClaimCentre,
      EnableVoucherExportOnDeathClaim: this.enableDeathClaimVoucher,
    });

    console.log('Claim Information updated in TabState');
  }
}
