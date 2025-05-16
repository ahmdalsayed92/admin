import { AfterViewInit, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../services/admin.service';
import { Entity } from '../../services/models/entity.model';
import { Router } from '@angular/router';
import {
  debounceTime,
  distinctUntilChanged,
  switchMap,
  tap,
} from 'rxjs/operators';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { env } from '../../environments/dev.env';
import { AlertService } from '../../services/alert.service';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss',
})
export class ListComponent implements OnInit {
  entities: Entity[] = [];
  searchControl = new FormControl('');
  searchResults: Entity[] = [];
  widgetCode1 = env.widgetCode1;
  widgetCode2 = env.widgetCode2;
  loading: boolean = false;
  offset: number = 0;
  currentPage = 1;
  totalPages = 1;
  pageNumbers: number[] = [];
  itemsPerPage = 10;
  totalItemsNumber: number = 0;
  openIndex: number | null = 0;
  key: any;
  sortBy: string = 'title';
  sortOrder: string = 'asc';

  constructor(
    private entityService: AdminService,
    private router: Router,
    private alertService: AlertService,
    private modalService: ModalService
  ) {}

  ngOnInit(): void {
    this.loadEntities();
    this.search();
  }

  search() {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300), // Wait 300ms after the last input
        distinctUntilChanged(), // Avoid duplicate requests for same input
        switchMap((keyword) => {
          if ((keyword ?? '').length < 3) {
            this.restoreOriginalList();
            return of(null);
          }
          this.loading = true;
          return this.entityService.searchEntities(keyword ?? '');
        }),
        tap(() => (this.loading = false))
      )
      .subscribe((response) => {
        if (response) {
          this.searchResults = response.results; // Update list with search results
        }
      });
  }

  restoreOriginalList() {
    this.searchResults = [...this.entities];
  }
  clearSearch() {
    this.searchControl.setValue('');
    this.restoreOriginalList();
  }

  loadEntities(): void {
    this.entityService
      .getEntities(this.offset, this.itemsPerPage, this.sortBy, this.sortOrder)
      .subscribe({
        next: (response) => {
          this.searchResults = response.entities;
          this.entities = [...this.searchResults];
          this.totalPages =
            response.total / response.limit > 1
              ? Math.ceil(response.total / response.limit)
              : 1;
          this.itemsPerPage = response.limit;
          this.totalItemsNumber = response.total;
          this.searchControl.setValue('');
        },
        error: (err) =>
          this.alertService.showAlert('danger', 'Server error occurred.'),
      });
  }

  editWebsite(item: Entity) {
    console.log('Edit website:', item);
    localStorage.setItem('entity', JSON.stringify(item));
    this.router.navigate(['/website']);
  }

  async toggleActivation(item: Entity) {
    const modalResponse = await this.modalService.openModal(
      `${item.isActive ? 'Deactivate' : 'Activate'} Widget`,
      `Are you sure you want to ${item.isActive ? 'deactivate' : 'activate'} ${
        item.title
      }?`
    );
    if (modalResponse === 'confirm') {
      this.entityService.toggleActivation(item._id, !item.isActive).subscribe({
        next: (response) => {
          this.loadEntities();
          this.alertService.showAlert(
            'success',
            'You have successfully activated/updated MOHAP Official Website.'
          );
        },
        error: (err) =>
          this.alertService.showAlert('danger', 'Server error occurred.'),
      });
    } else {
      this.alertService.showAlert(
        'danger',
        'You have cancelled the activation/deactivation.'
      );
    }
  }

  async deleteWidget(item: Entity) {
    const modalResponse = await this.modalService.openModal(
      'Delete Widget',
      `Are you sure you want to delete ${item.title}?`
    );
    if (modalResponse === 'confirm') {
      this.entityService.deleteEntity(item._id).subscribe({
        next: (response) => {
          console.log('Widget deleted:', response);
          this.loadEntities();
        },
        error: (err) => console.error('Error deleting widget:', err),
      });
    }
  }

  newWebsite() {
    console.log('New website');
    localStorage.removeItem('entity');
    this.router.navigate(['/website']);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.offset = (this.currentPage - 1) * this.itemsPerPage;
      this.loadEntities();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.offset = (this.currentPage - 1) * this.itemsPerPage;
      this.loadEntities();
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.offset = (this.currentPage - 1) * this.itemsPerPage;
      this.loadEntities();
    }
  }

  firstPage() {
    this.currentPage = 1;
    this.offset = 0;
    this.loadEntities();
  }

  lastPage() {
    this.currentPage = this.totalPages;
    this.offset = (this.currentPage - 1) * this.itemsPerPage;
    this.loadEntities();
  }

  toggleAccordion(i: number): void {
    this.openIndex = this.openIndex === i ? null : i;
  }

  copyCode(code: string) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code).then(
        () => {
          this.alertService.showAlert(
            'success',
            `Text copied to clipboard successfully`
          );
        },
        (err) => {
          console.error('Could not copy text: ', err);
        }
      );
    }
  }
}
