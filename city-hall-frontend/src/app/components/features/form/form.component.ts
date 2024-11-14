import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormConfig, FormDataSchema, FormFieldConfig, SCHEMA_PROPERTIES_TYPES, SchemaProperties } from './form.types';
import { FormService } from '../../../services/form/form.service';
import { FormSectionComponent } from '../form-section/form-section.component';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, HttpClientModule, FormSectionComponent],
})
export class FormComponent implements OnInit {
  identityForm!: FormGroup;
  schema!: FormDataSchema;
  formConfig!: FormConfig;
  formData: {
    [key: string]: string
  } = {};

  constructor(private fb: FormBuilder, private formService: FormService) {}

  ngOnInit(): void {
    this.formService.getFormSchema().subscribe({
      next: (data: FormDataSchema) => {
        this.schema = data;
        console.log(data);
        const config = this.formService.getFormConfig(this.schema);
        console.log(config);
        this.formConfig = config;
        this.initFormData();
      },
      error: (err) => console.error('Schema loading error', err),
    });
  }

  private initFormData() {
    this.formConfig.sections.forEach(section => {
      section.fields.forEach(field => {
        const key: string = field.label ? field.label : section.title;
        this.formData[key] = '';
      })
    })
  }

  getFormLabel(field: FormFieldConfig) {
    if (field.label) {
      return field.required ? `${field.label} *` : field.label;  
    }
    return '';
  }

  isDateField(field: FormFieldConfig) {
    return field.label && field.label.includes('Data');
  }

  isEmailField(field: FormFieldConfig) {
    return field.label && field.label.includes('e-mail');
  }

  onSubmit() {
    if (this.identityForm.valid) {
      console.log('Form submitted', this.identityForm.value);
    } else {
      console.log('Form is invalid');
    }
  }
}
