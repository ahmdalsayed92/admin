import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  ReactiveFormsModule,
  FormArray,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Entity } from '../../services/models/entity.model';
import { AdminService } from '../../services/admin.service';
import { env } from '../../environments/dev.env';
import { AlertService } from '../../services/alert.service';
import {
  validUrlValidator,
  minItemsValidator,
} from '../../validators/validators';

@Component({
  selector: 'app-add-edit',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './add-edit.component.html',
  styleUrl: './add-edit.component.scss',
})
export class AddEditComponent implements OnInit {
  form: FormGroup;
  entityData: Entity | null = null;
  pagesList = [{ title: '', url: '' }];
  adminsList = [{ adminName: '', adminEmail: '' }];
  emailString: string = '';
  firstStep = true;
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
      pages: this.fb.array([], [minItemsValidator(3)]),
      admins: this.fb.array([]),
    });

    this.initForm();
    this.loadEditData();
  }
  ngOnInit(): void {
    this.form.valueChanges.subscribe((value) => {
      if (
        this.form.controls['websiteName'].valid &&
        this.form.controls['baseUrl'].valid &&
        this.form.controls['admins'].valid
      ) {
        this.nextStep = true;
        console.log(this.nextStep);
      } else {
        this.nextStep = false;
        console.log(this.nextStep);
      }

      if (this.form.controls['pages'].valid && this.nextStep === true) {
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
  get admins() {
    return this.form.get('admins') as FormArray;
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

    this.adminsList.forEach((item) => {
      this.admins.push(
        this.fb.group({
          adminName: [item.adminName, Validators.required],
          adminEmail: [
            item.adminEmail,
            [Validators.required, Validators.email],
          ],
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

  addAdmin() {
    this.admins.push(
      this.fb.group({
        adminName: ['', Validators.required],
        adminEmail: ['', [Validators.required, Validators.email]],
      })
    );
  }

  removeAdmin(index: number) {
    this.admins.removeAt(index);
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
      this.admins.clear();
      this.entityData.admins.forEach((admin) => {
        this.admins.push(
          this.fb.group({
            adminName: [admin.adminName, Validators.required],
            adminEmail: [
              admin.adminEmail,
              [Validators.required, Validators.email],
            ],
          })
        );
      });

      this.emailString = this.adminsList
        .map((admin) => admin.adminEmail)
        .join(',');
    }
  }

  onSubmit() {
    let requestBody: Entity;
    if (this.form.valid) {
      requestBody = {
        _id: '',
        title: this.form.value.websiteName,
        domain: this.form.value.baseUrl,
        admins: this.form.value.admins,
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
          console.error('Error updating entity:', err.error);
          this.alertService.showAlert('danger', err.error.error);
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
        admins: this.form.value.admins,
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

  copyCode() {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(this.widgetCode).then(
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
  ngOnDestroy(): void {
    if (this.entityData) {
      localStorage.removeItem(this.entityData._id);
    }
  }
}
