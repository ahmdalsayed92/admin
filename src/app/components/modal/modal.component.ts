import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss',
})
export class ModalComponent {
  @Input() header: string = 'hello world';
  @Input() body = '';
  @Output() cancel = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<void>();

  constructor(private modalServices: ModalService) {}

  closeModal() {
    this.modalServices.closeModal();
    this.cancel.emit();
  }
  confirmModal() {
    this.modalServices.confirm();
    this.confirm.emit();
  }
}
