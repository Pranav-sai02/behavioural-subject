import { Component } from '@angular/core';

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
}
