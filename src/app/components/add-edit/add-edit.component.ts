import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  ReactiveFormsModule,
  FormArray,
} from '@angular/forms';
import { Router } from '@angular/router';
import { Entity } from '../../services/models/entity.model';
import { AdminService } from '../../services/admin.service';
import { env } from '../../environments/dev.env';
import { AlertService } from '../../services/alert.service';

@Component({
  selector: 'app-add-edit',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './add-edit.component.html',
  styleUrl: './add-edit.component.scss',
})
export class AddEditComponent implements OnInit {
  form: FormGroup;
  entityData: Entity | null = null;
  pagesList = [{ title: '', url: '' }];

  firtsStep = true;
  secondStep = false;
  thirdStep = false;
  widgetCode1 = env.widgetCode1;
  widgetCode2 = env.widgetCode2;
  widgetCode: string = '';
  editMode: boolean = false;
  key: string = '';
  nextStep: boolean = false;
  disableSubmit: boolean = true;
  steps: any = [
    {
      title: 'Website Details',
      completed: false,
      currentStep: true,
      upcommingStep: false,
    },
    {
      title: 'Pages',
      completed: false,
      currentStep: false,
      upcommingStep: true,
    },
    {
      title: 'Widget Code',
      completed: false,
      currentStep: false,
      upcommingStep: true,
    },
  ];
  constructor(
    private fb: FormBuilder,
    private adminService: AdminService,
    private router: Router,
    private alertService: AlertService
  ) {
    this.form = this.fb.group({
      govEntity: [''],
      websiteName: ['', [Validators.required]],
      baseUrl: ['', [Validators.required]],
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      pages: this.fb.array([]),
    });

    this.initForm();
    this.loadEditData();
  }
  ngOnInit(): void {
    this.form.valueChanges.subscribe((value) => {
      if (
        this.form.controls['websiteName'].valid &&
        this.form.controls['baseUrl'].valid &&
        this.form.controls['name'].valid &&
        this.form.controls['email'].valid
      ) {
        this.nextStep = true;
        console.log(this.nextStep);
      } else {
        this.nextStep = false;
        console.log(this.nextStep);
      }

      if (this.form.controls['pages'].valid) {
        this.disableSubmit = false;
      } else {
        this.disableSubmit = true;
      }
    });
  }

  // Getter for pages FormArray
  get pages() {
    return this.form.get('pages') as FormArray;
  }

  // Function to load the initial form with pages
  initForm() {
    this.pagesList.forEach((item) => {
      this.pages.push(
        this.fb.group({
          title: [item.title, Validators.required],
          url: [item.url, [Validators.required]],
        })
      );
    });
  }
  // Function to add a new blank page
  addPage() {
    this.pages.push(
      this.fb.group({
        title: ['', Validators.required],
        url: ['', [Validators.required]],
      })
    );
  }

  // Function to remove a page
  removePage(index: number) {
    this.pages.removeAt(index);
  }

  loadEditData() {
    const storedEntity = localStorage.getItem('entity');
    if (storedEntity) {
      this.entityData = JSON.parse(storedEntity);
      this.fillForm();
      this.editMode = true;
    }
  }

  fillForm() {
    if (this.entityData) {
      this.form.patchValue({
        govEntity: '', // Add proper mapping here if needed
        websiteName: this.entityData.title,
        baseUrl: this.entityData.domain,
        name: this.entityData.adminName,
        email: this.entityData.adminEmail,
      });

      // Clear existing pages and add those from entityData
      this.pages.clear();
      this.entityData.pages.forEach((page) => {
        this.pages.push(
          this.fb.group({
            title: [page.title, Validators.required],
            url: [page.url, [Validators.required]],
          })
        );
      });
    }
  }

  onSubmit() {
    let requestBody: Entity;
    if (this.form.valid) {
      requestBody = {
        _id: '',
        title: this.form.value.websiteName,
        domain: this.form.value.baseUrl,
        adminName: this.form.value.name,
        adminEmail: this.form.value.email,
        pages: this.form.value.pages,
      };

      this.adminService.createEntity(requestBody).subscribe({
        next: (response) => {
          this.key = response.apiKey;
          this.widgetCode = this.widgetCode1 + this.key + this.widgetCode2;
          this.alertService.showAlert(
            'success',
            `You have successfully added ${requestBody.title}.`
          );
        },

        error: (err) => {
          console.error('Error updating entity:', err);
          this.alertService.showAlert(
            'danger',
            `error has occured,  Try again.`
          );
        },
      });
    } else {
      console.log('Form is invalid');
    }
  }

  update() {
    let requestBody: Entity;
    if (this.form.valid) {
      requestBody = {
        _id: this.entityData ? this.entityData._id : '',
        title: this.form.value.websiteName,
        domain: this.form.value.baseUrl,
        adminName: this.form.value.name,
        adminEmail: this.form.value.email,
        pages: this.form.value.pages,
      };
      this.adminService.updateEntity(requestBody._id, requestBody).subscribe({
        next: (response) => {
          this.key = response.updated.apiKey || '';
          this.widgetCode = this.widgetCode1 + this.key + this.widgetCode2;
        },
        error: (err) => {
          console.error('Error updating entity:', err);
        },
      });
    } else {
      console.log('Form is invalid');
    }
  }
  done() {
    this.router.navigate(['/']);
  }

  preventDefaults(event: Event): void {
    event.preventDefault();
  }

  continueStep(target: string) {
    if (target === 'first') {
      this.steps[0].completed = true;
      this.steps[0].currentStep = false;
      this.steps[1].currentStep = true;
    } else {
      this.steps[1].completed = true;
      this.steps[1].currentStep = false;
      this.steps[1].upcommingStep = false;
      this.steps[2].upcommingStep = false;
      this.steps[2].completed = true;
    }
  }
  backStep() {
    this.steps[0].completed = false;
    this.steps[0].currentStep = true;
    this.steps[1].currentStep = false;
  }
  ngOnDestroy(): void {
    if (this.entityData) {
      localStorage.removeItem(this.entityData._id);
    }
  }
}
