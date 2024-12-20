import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CamundaPayload, CamundaResponse, CamundaSexResponse, FormConfig, FormDataSchema, FormFieldConfig, FormSectionConfig, SCHEMA_PROPERTIES_TYPES, SchemaObjectProperties, SchemaProperties, SchemaStringProperties } from '../../components/features/form/form.types';
import { map, Observable } from 'rxjs';
import { Validators, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { environment } from '../../../../environments/environment'; 

@Injectable({
  providedIn: 'root'
})
export class FormService {
  private readonly FORM_ENDPOINT = 'form';
  private readonly PDF_ENDPOINT = 'generatePdf';
  private readonly CAMUNDA_ENDPOINT = 'camunda';
  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) { }

  getFormSchema(): Observable<FormDataSchema> {
    return this.http.get<FormDataSchema>(`${this.apiUrl}/${this.FORM_ENDPOINT}`);
  }

  getPDF(json: {[key: string]: any}): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${this.PDF_ENDPOINT}`, json, { observe: 'response', responseType: "blob" as "json"});
  }

  sendDataToCamunda(data: CamundaPayload): Observable<CamundaResponse> {
    return this.http.post<CamundaResponse>(`${this.apiUrl}/${this.CAMUNDA_ENDPOINT}`, data);
  }

  getFormConfig(schema: FormDataSchema): FormConfig {
    const formConfig: FormConfig = {
      sections: this.getFormSections(schema)
    };

    return formConfig;
  }

  private getFormSections(schema: FormDataSchema): FormSectionConfig[] {
    const formSectionsConfig: FormSectionConfig[] = [];
    const sectionsNames = this.getFormSectionNames(schema);
    const schemaProperties = schema.properties;

    let index = 0;
    for(let key in schemaProperties) {
      const isRequired = schema.required.includes(key);
      formSectionsConfig.push(this.getSectionConfig(sectionsNames[index], schemaProperties[key], isRequired))
      index++;
    }

    return formSectionsConfig;
  }

  private getSectionConfig(sectionTitle: string, properties: SchemaStringProperties | SchemaObjectProperties, isRequired: boolean): FormSectionConfig {
    const sectionConfig: FormSectionConfig = {
      title: sectionTitle,
      fields: []
    }

    if (this.isStringTypeProperty(properties)) {
      sectionConfig.fields.push(this.getFormStringField(properties, isRequired, undefined, sectionTitle));
    } else {
      sectionConfig.fields.push(...this.getFormObjectFields(properties));
    }

    return sectionConfig;
  }

  private getFieldOptions(description: string) {
    return description.split(' /');
  }

  private getFormStringField(stringProperties: SchemaStringProperties, isRequired: boolean, label: string | undefined = undefined, sectionTitle?: string): FormFieldConfig {
    const key = label ? label : sectionTitle as string;

    const fieldConfig: FormFieldConfig = {
      required: isRequired,
      validators: this.getFieldValidators(stringProperties),
      label: label ? label : undefined,
      options: stringProperties.description ? this.getFieldOptions(stringProperties.description) : undefined,
      key: key
    };
    
    return fieldConfig;
  }

  private getFormObjectFields(objectProperties: SchemaObjectProperties): FormFieldConfig[] {
    const fieldConfigs: FormFieldConfig[] = [];
    const properties = objectProperties.properties;

    for(let key in properties) {
      const isRequired = (objectProperties.required && objectProperties.required.includes(key)) as boolean;
      fieldConfigs.push(this.getFormStringField(properties[key], isRequired, this.getFormSectionName(key)))
    }

    return fieldConfigs;
  }
 
  private getFieldValidators(stringProperties: SchemaStringProperties) {
    const validators: ValidatorFn[] = [];

    if (stringProperties.pattern) {
        validators.push(Validators.pattern(new RegExp(stringProperties.pattern)));
    }

    if (stringProperties.format === 'email') {
        validators.push(Validators.email);
    }

    if (stringProperties.contentEncoding === 'base64') {
        validators.push((control: AbstractControl): ValidationErrors | null => {
            const base64Regex = /^[A-Za-z0-9+/]+={0,2}$/;
            return base64Regex.test(control.value) ? null : { base64: true };
        });
    }

    return validators;
  }

  private getFormSectionNames = (schema: FormDataSchema) => Object.keys(schema.properties).map(key => this.getFormSectionName(key));

  private getFormSectionName = (formControl: string) => {
    formControl = formControl.charAt(0).toUpperCase() + formControl.slice(1);
    return formControl.split(/(?=[A-Z])/).join(' ');    
  }

  private isStringTypeProperty = (property: SchemaObjectProperties | SchemaStringProperties) => property.type === SCHEMA_PROPERTIES_TYPES.STRING;
}
