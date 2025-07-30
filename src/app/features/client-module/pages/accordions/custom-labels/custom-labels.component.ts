import { Component } from '@angular/core';
import { TabStateService } from '../../../services/tabs-behavioural-service/tabState.service';

@Component({
  selector: 'app-custom-labels',
  standalone: false,
  templateUrl: './custom-labels.component.html',
  styleUrl: './custom-labels.component.css',
})
export class CustomLabelsComponent {
  policyFiles = ['File A', 'File B', 'File C'];
  roles = ['Controller', 'Claims Controller', 'Admin'];

  selectedPolicyFile: string = this.policyFiles[0];  // Default selected
  validationLabels = {
    label1: 'Label 1',
    label2: 'Label 2',
    label3: '',
    label4: '',
    label5: '',
    label6: '',
  };
  policyLabel: string = 'Standard Policy';

  constructor(private tabState: TabStateService) {}

  /**
   * Update TabStateService whenever values change
   */
  updateCustomLabels(): void {
    this.tabState.updateCustomLabels({
      PolicyFile: this.selectedPolicyFile,
      PolicyLabel: this.policyLabel,
      ValidationLabel1: this.validationLabels.label1,
      ValidationLabel2: this.validationLabels.label2,
      ValidationLabel3: this.validationLabels.label3,
      ValidationLabel4: this.validationLabels.label4,
      ValidationLabel5: this.validationLabels.label5,
      ValidationLabel6: this.validationLabels.label6,
    });

    console.log('Custom Labels updated in TabState:', {
      file: this.selectedPolicyFile,
      policyLabel: this.policyLabel,
    });
  }
}
