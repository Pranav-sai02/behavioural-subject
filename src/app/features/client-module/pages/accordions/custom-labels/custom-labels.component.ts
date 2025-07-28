import { Component } from '@angular/core';

@Component({
  selector: 'app-custom-labels',
  standalone: false,
  templateUrl: './custom-labels.component.html',
  styleUrl: './custom-labels.component.css',
})
export class CustomLabelsComponent {
  policyFiles = ['File A', 'File B', 'File C']; // Replace with actual file list
  roles = ['Controller', 'Claims Controller', 'Admin'];
}
