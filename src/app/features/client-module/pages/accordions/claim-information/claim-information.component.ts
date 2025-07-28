import { Component, EventEmitter, Input, Output } from '@angular/core';

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

  // ✅ Move it inside the class
  claimsManagers = [
    { value: 'manager1', label: 'John Doe' },
    { value: 'manager2', label: 'Jane Smith' },
    { value: 'manager3', label: 'Michael Johnson' }
  ];
}
