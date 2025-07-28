import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Client } from '../../models/Client';
import { ClientService } from '../../services/client-services/client.service';
import { Tab } from '../../models/tabs.enum';
import { TabStateService } from '../../services/tabs-behavioural-service/tabState.service';
import { Observable, take } from 'rxjs';

@Component({
  selector: 'app-client-popup',
  standalone: false,
  templateUrl: './client-popup.component.html',
  styleUrls: ['./client-popup.component.css'],
})
export class ClientPopupComponent implements OnInit {
  readonly Tab = Tab; // expose Tab enum for template
  selectedTab$!: Observable<Tab>; // Active tab observable

  @Input() clientToEdit!: Client;
  @Input() isEditMode: boolean = false;
  @Output() close = new EventEmitter<void>();

  showSuccess = false;

  constructor(
    private clientService: ClientService,
    private tabState: TabStateService // inject TabStateService
  ) {}

  ngOnInit(): void {
    this.selectedTab$ = this.tabState.selectedTab$;
    if (this.isEditMode) {
      // Populate TabState slices
      this.tabState.updateDetails(this.clientToEdit);
      // Optionally split and update other slices if data is available
    }
  }

  selectTab(tab: Tab): void {
    this.tabState.setSelectedTab(tab);
  }

  closeForm() {
    this.close.emit();
  }

  printPage() {
    window.print();
  }

  save() {
  this.tabState.gatherFullClient()
    .pipe(take(1))
    .subscribe((fullClient: Client) => {
      if (this.isEditMode) {
        // Pass the ID and the payload
        this.clientService
          .updateClient(fullClient.ClientId, fullClient)
          .subscribe(() => this.showSuccess = true);
      } else {
        this.clientService
          .createClient(fullClient)
          .subscribe(() => this.showSuccess = true);
      }
    });
}
}
