import { ComponentRef, Injectable, ViewContainerRef } from '@angular/core';
import { ModalComponent } from '../components/modal/modal.component';

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  private containerRef!: ViewContainerRef;

  constructor() {}

  registerContainer(container: ViewContainerRef) {
    this.containerRef = container;
  }

  openModal(title: string, body: string) {
    if (!this.containerRef) return Promise.reject('No container');

    const modalRef: ComponentRef<ModalComponent> =
      this.containerRef.createComponent(ModalComponent);
    modalRef.instance.header = title;
    modalRef.instance.body = body;

    return new Promise((resolve) => {
      modalRef.instance.confirm.subscribe(() => {
        modalRef.destroy();
        resolve('confirm');
      });

      modalRef.instance.cancel.subscribe(() => {
        modalRef.destroy();
        resolve('cancel');
      });
    });
  }

  closeModal() {
    if (!this.containerRef) return;

    const modalRef = this.containerRef.get(0);
    if (modalRef) {
      modalRef.destroy();
      console.log('Modal destroyed');
    }
  }

  confirm() {
    this.closeModal();
    return 'confirmed';
  }
}
