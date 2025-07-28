import { Component, EventEmitter, Output } from '@angular/core';
import { CaseService } from '../../../services/case-service/case.service';

@Component({
  selector: 'app-case-popup',
  standalone: false,
  templateUrl: './case-popup.component.html',
  styleUrl: './case-popup.component.css',
})
export class CasePopupComponent {
  showPopup = false;

  clientName: string = '';
  serviceType: string = '';

  @Output() close = new EventEmitter<void>();

  constructor(private caseService: CaseService) {}

  onClose() {
    this.close.emit();
    this.showPopup = false;
  }

  openPopup() {
    this.showPopup = true;
  }

  onSave() {
    const newCase: any = {
      ClientName: this.clientName,
      ServiceType: this.serviceType,
      // Add more fields as needed
    };

    this.caseService.createCase(newCase).subscribe({
      next: (response) => {
        console.log('Case saved successfully:', response);
        this.onClose();
      },
      error: (error) => {
        console.error('Error saving case:', error);
      },
    });
  }
}
