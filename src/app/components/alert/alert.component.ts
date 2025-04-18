import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alert.component.html',
  styleUrl: './alert.component.scss',
})
export class AlertComponent {
  @Input() type: 'success' | 'danger' | 'info' | 'warning' = 'info';
  @Input() message = '';

  get alertClass() {
    return `alert-${this.type}`;
  }
}
