import { Routes } from '@angular/router';
import { AddEditComponent } from './components/add-edit/add-edit.component';
import { ListComponent } from './components/list/list.component';

export const routes: Routes = [
  { path: '', component: ListComponent }, // Home route
  { path: 'website', component: AddEditComponent }, // Add/Edit route
];
