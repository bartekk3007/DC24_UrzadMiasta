import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormConfig, FormDataSchema, FormFieldConfig } from './form.types';
import { FormService } from '../../../services/form/form.service';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule],
})
export class FormComponent implements OnInit {
  private readonly REASON_KEY = 'Powód złożenia wniosku';
  private readonly FIRST_ID_REASON = 'Pierwszy dowód';
  private readonly IS_STOLEN_REASON = 'Kradzież dowodu';
  private readonly PREV_ID_SECTION_TITLE = 'Dane poprzedniego dowodu osobistego';
  private readonly ID_STOLEN_SECTION_TITLE = 'Dane dotyczące zgłoszenia kradzieży dowodu';
  private readonly SEX_MEN = 'mężczyzna';
  private readonly SEX_KEY = 'Płeć';
  private readonly PREV_ID_KEYS = [
    'Data wydania dowodu',
    'Numer  C A N',
    'Numer dowodu osobistego',
    'Organ wydający dowód'
  ];
  private readonly STOLEN_ID_KEYS = [
    'Data zgłoszenia',
    'Nazwa i adres jednostki policji'
  ];
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
        this.formData[field.key] = '';
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

  displaySection(sectionTitle: string) {
    if (!this.isPreviousIdSection(sectionTitle) && !this.isIdStolenSection(sectionTitle)) {
      return true;
    } else {
      if (this.isPreviousIdSection(sectionTitle)) {
        return this.displayPreviousDocumentSection();
      }
      return this.displayStolenDocumentSection();
    }
  }

  isMen() {
    return this.formData[this.SEX_KEY] && this.formData[this.SEX_KEY].includes(this.SEX_MEN);
  }

  private isPreviousIdSection(sectionTitle: string): boolean {
    return sectionTitle.includes(this.PREV_ID_SECTION_TITLE);
  }

  private isIdStolenSection(sectionTitle: string): boolean {
    return sectionTitle.includes(this.ID_STOLEN_SECTION_TITLE);
  }

  private displayPreviousDocumentSection() {
    return this.formData[this.REASON_KEY] && !this.formData[this.REASON_KEY].includes(this.FIRST_ID_REASON);
  }

  private displayStolenDocumentSection() {
    return this.formData[this.REASON_KEY] && this.formData[this.REASON_KEY].includes(this.IS_STOLEN_REASON);
  }

  isReasonField(sectionTitle: string) {
    return sectionTitle.includes(this.REASON_KEY);
  }

  allRequiredFilled() {
    const fields = this.formConfig.sections.flatMap(section => section.fields);
    for (let field of fields) {
      if (this.PREV_ID_KEYS.includes(field.key) && !this.displayPreviousDocumentSection()) {
        continue;
      }

      if (this.STOLEN_ID_KEYS.includes(field.key) && !this.displayStolenDocumentSection()) {
        continue;
      }

      if (field.required && this.formData[field.key] === '') {
        return false;
      }
    }

    return true;
  }

  adjustFormData() {
    if (!this.displayPreviousDocumentSection()) {
      this.PREV_ID_KEYS.forEach(key => {
        delete this.formData[key];
      });
    }
    if (!this.displayStolenDocumentSection()) {
      this.STOLEN_ID_KEYS.forEach(key => {
        delete this.formData[key];
      });
    }
  }

  formDataToJSON(formData: {[key: string]: string}){
    let json : {[key: string]: any} = {
      "Miejscowość i data": formData["Miejscowość i data"],
      "Dane osobowe wnioskodawcy/wnioskodawczyni": {
        "Imię/Imiona": formData["Imię/ Imiona"],
        "Nazwisko": formData["Nazwisko"],
        "Data urodzenia": formData["Data urodzenia"],
        "Płeć": formData["Płeć"],
        "Nazwisko rodowe": formData["Nazwisko rodowe"],
        "Miejsce urodzenia": formData["Miejsce urodzenia"],
        "Obywatelstwo": formData["Obywatelstwo"]
      },
      "Dane kontaktowe wnioskodawcy/wnioskodawczyni": {
        "Ulica": formData["Ulica"],
        "Numer domu/lokalu": formData["Numer domu/lokalu"],
        "Kod pocztowy": formData["Kod pocztowy"],
        "Miejscowość": formData["Miejscowość"],
        "Nr. telefonu (opcjonalny)": (formData["Nr. telefonu (opcjonalny)"] == "")? undefined : formData["Nr. telefonu (opcjonalny)"],
        "Adres e-mail (opcjonalny)": (formData["Adres e-mail (opcjonalny)"] == "")? undefined : formData["Adres e-mail (opcjonalny)"]
      },
      "Powód złożenia wniosku": formData["Powód złożenia wniosku"],
      "Dane poprzedniego dowodu osobistego": ("Numer  C A N" in formData)? {
        "Numer dowodu osobistego": formData["Numer dowodu osobistego"],
        "Numer CAN": formData["Numer  C A N"],
        "Data wydania dowodu": formData["Data wydania dowodu"],
        "Organ wydający dowód": formData["Organ wydający dowód"]
      } : undefined,
      "Dane dotyczące zgłoszenia kradzieży dowodu": ("Nazwa i adres jednostki policji" in formData)? {
        "Nazwa i adres jednostki policji": formData["Nazwa i adres jednostki policji"],
        "Data zgłoszenia": formData["Data zgłoszenia"]
      } : undefined,
      "Fotografia": formData["Fotografia"]
    };

    console.log(json);

    this.formService.getPDF(json).subscribe(
      res => saveAs(res.body, "wniosek.pdf")
    );

  }

  onSubmit() {
    this.adjustFormData();
    console.log(this.formData);
    this.formDataToJSON(this.formData);
  }
}
