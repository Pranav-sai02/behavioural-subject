import { Component } from '@angular/core';
import { TabStateService } from '../../../services/tabs-behavioural-service/tabState.service';

@Component({
  selector: 'app-client-data',
  standalone: false,
  templateUrl: './client-data.component.html',
  styleUrl: './client-data.component.css',
})
export class ClientDataComponent {
  selectedValue: number | null = null;

  policyFiles = [
    { label: 'File A', value: 1 },
    { label: 'File B', value: 2 },
    { label: 'File C', value: 3 },
  ];

  constructor(private tabState: TabStateService) {}

  /**
   * Called when user selects a new policy file
   */
  onPolicyFileChange(): void {
    const selectedFile = this.selectedValue
      ? this.policyFiles.find(p => p.value === this.selectedValue)?.label
      : '';

    // Update TabState with current selection
    this.tabState.updateClientData({
      PolicyFile: selectedFile,
      PolicyLabel: 'Client Policy', // Can be replaced by dynamic input
    });

    console.log('Client Data updated in TabState:', selectedFile);
  }
}
