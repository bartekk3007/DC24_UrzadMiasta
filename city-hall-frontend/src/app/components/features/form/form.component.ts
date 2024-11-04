import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormConfig, FormDataSchema, SCHEMA_PROPERTIES_TYPES, SchemaProperties } from './form.types';
import { FormService } from '../../../services/form/form.service';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, HttpClientModule],
})
export class FormComponent implements OnInit {
  identityForm!: FormGroup;
  schema!: FormDataSchema;
  formConfig!: FormConfig;

  constructor(private fb: FormBuilder, private formService: FormService) {}

  ngOnInit(): void {
    this.formService.getFormSchema().subscribe({
      next: (data: FormDataSchema) => {
        this.schema = data;
        console.log(data);
        this.buildForm();
      },
      error: (err) => console.error('Schema loading error', err),
    });
  }

  buildForm() {
    const formControls: any = {};
    for (const field in this.schema.properties) {
      formControls[field] = new FormControl('', this.getValidators(field));
    }

    this.buildFormConfig();

    this.identityForm = new FormGroup(formControls);
    console.log(this.identityForm);
  }

  getValidators(field: string) {
    const validators = [];
    const fieldSchema = this.schema.properties[field];

    // Add required validator
    if (this.schema.required?.includes(field)) {
      validators.push(Validators.required);
    }

    return validators;
  }

  private buildFormConfig() {
    this.formConfig = {
      sections: this.getFormSections()
    }
  }

  private getFormSections = () => this.getFormSectionNames().map(sectionName => ({
    title: sectionName
  })); 

  private getFormSectionNames = () => Object.keys(this.schema.properties).map(key => this.getFormSectionName(key));

  private getFormSectionName = (formControl: string) => {
    // First letter to uppercase
    formControl = formControl.charAt(0).toUpperCase() + formControl.slice(1);
    return formControl.split(/(?=[A-Z])/).join(' ');    
  }

  private getFormControls(): string[] {
    return Object.keys(this.schema.properties || {});
  }

  areStringTypeProps = (schemaProperties: SchemaProperties, fieldName: string) => schemaProperties[fieldName].type === SCHEMA_PROPERTIES_TYPES.STRING;
  
  areObjectTypeProps = (schemaProperties: SchemaProperties, fieldName: string) => schemaProperties[fieldName].type === SCHEMA_PROPERTIES_TYPES.OBJECT;

  onSubmit() {
    if (this.identityForm.valid) {
      console.log('Form submitted', this.identityForm.value);
    } else {
      console.log('Form is invalid');
    }
  }
}
