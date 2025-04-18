import {
  ComponentRef,
  Injectable,
  Injector,
  ViewContainerRef,
} from '@angular/core';
import { AlertComponent } from '../components/alert/alert.component';

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  private containerRef!: ViewContainerRef;
  constructor(private injector: Injector) {}

  registerContainer(container: ViewContainerRef) {
    this.containerRef = container;
  }

  showAlert(
    type: 'success' | 'danger' | 'info' | 'warning',
    message: string,
    duration: number = 4000
  ) {
    if (!this.containerRef) return;

    const alertRef: ComponentRef<AlertComponent> =
      this.containerRef.createComponent(AlertComponent);
    alertRef.instance.type = type;
    alertRef.instance.message = message;

    setTimeout(() => {
      alertRef.destroy();
    }, duration);
  }
}
