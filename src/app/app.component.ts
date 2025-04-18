import {
  Component,
  viewChild,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AlertService } from './services/alert.service';
import { ModalService } from './services/modal.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'admin';
  @ViewChild('alertContainer', { read: ViewContainerRef, static: true })
  alertContainer!: ViewContainerRef;

  @ViewChild('modalContainer', { read: ViewContainerRef, static: true })
  modalContainer!: ViewContainerRef;

  constructor(
    private alertService: AlertService,
    private modalService: ModalService
  ) {}

  ngAfterViewInit(): void {
    this.alertService.registerContainer(this.alertContainer);
    this.modalService.registerContainer(this.modalContainer);
  }
}
