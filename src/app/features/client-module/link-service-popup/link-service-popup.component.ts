import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ServiceProviderTypes } from '../../service-provider/service-provider-types/models/ServiceProviderTypes';
import { ServiceProviderTypesService } from '../../service-provider/service-provider-types/services/serviceProvider-types/service-provider-types.service';

@Component({
  selector: 'app-link-service-popup',
  standalone: false,
  templateUrl: './link-service-popup.component.html',
  styleUrl: './link-service-popup.component.css'
})
export class LinkServicePopupComponent implements OnInit {
  @Output() close = new EventEmitter<void>();
  @Output() formSubmit = new EventEmitter<any>();

  serviceTypes: ServiceProviderTypes[] = [];

  clientServiceForm: FormGroup;

  editorModules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ script: 'sub' }, { script: 'super' }],
      [{ indent: '-1' }, { indent: '+1' }],
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      [{ color: [] }, { background: [] }],
      [{ font: [] }],
      [{ align: [] }],
      ['link', 'image', 'video'],
      ['clean']
    ]
  };

  constructor(
    private fb: FormBuilder,
    private serviceProviderTypeService: ServiceProviderTypesService
  ) {
    this.clientServiceForm = this.fb.group({
      ServiceId: ['', Validators.required],
      Note: ['', Validators.required],
      TransferNumber: ['']
    });
  }

  ngOnInit(): void {
    this.loadServiceTypes();
  }

  private loadServiceTypes(): void {
    this.serviceProviderTypeService.getAll().subscribe({
      next: (services: ServiceProviderTypes[]) => {
        this.serviceTypes = services;
      },
      error: (err) => {
        console.error('❌ Failed to load service types:', err);
      }
    });
  }

  onSubmit(): void {
    if (this.clientServiceForm.invalid) {
      this.clientServiceForm.markAllAsTouched();
      const firstInvalidControl = document.querySelector('.ng-invalid');
      if (firstInvalidControl) {
        firstInvalidControl.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }

    const formData = this.clientServiceForm.value;

    const payload = {
      ServiceId: formData.ServiceId,
      Note: formData.Note,
      NotePlain: this.stripHtmlTags(formData.Note),
      TransferNumber: formData.TransferNumber
    };

    this.formSubmit.emit(payload);
    this.onClose();
  }

  private stripHtmlTags(html: string): string {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  }

  onCancel(): void {
    this.clientServiceForm.reset();
    this.onClose();
  }

  onClose(): void {
    this.close.emit();
  }

  get formControl() {
    return this.clientServiceForm.controls;
  }
}
