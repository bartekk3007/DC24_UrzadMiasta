<<<<<<< Updated upstream
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
=======
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormConfig, FormDataSchema, FormFieldConfig } from './form.types';
import { FormService } from '../../../services/form/form.service';
import { saveAs } from 'file-saver';
import {SubmitPopUpComponent} from '../submit-pop-up/submit-pop-up.component';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
>>>>>>> Stashed changes

@Component({
  selector: 'app-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './form.component.html',
  styleUrl: './form.component.scss'
})
<<<<<<< Updated upstream
export class FormComponent {
  readonly GENDERS = {
    MALE: 'male',
    FEMALE: 'female'
  } as const;

  readonly REASONS = {
    OTHER: 'other'
  } as const;
=======
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
  json : {[key: string]: any};

  constructor(private fb: FormBuilder, private formService: FormService, private dialog: MatDialog) {}
>>>>>>> Stashed changes

  displayDifferentReasonInput: boolean = false;

  identityForm: FormGroup;
  currentGender: typeof this.GENDERS[keyof typeof this.GENDERS] = this.GENDERS.MALE;
  readonly TITLES = {
    'male': 'wnioskodawcy',
    'female': 'wnioskodawczyni'
  };

  constructor(private fb: FormBuilder) {
    this.identityForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      birthDate: ['', Validators.required],
      gender: [this.GENDERS.MALE, Validators.required],
      familyName: [''],
      birthPlace: ['', Validators.required],
      citizenship: ['', Validators.required],
      street: ['', Validators.required],
      houseNumber: ['', Validators.required],
      postalCode: ['', Validators.required],
      city: ['', Validators.required],
      phoneNumber: [''],
      email: [''],
      reason: ['', Validators.required],
      otherReason: [''],
      photoMethod: ['', Validators.required],
      applicantSignature: ['', Validators.required],
    });

    this.identityForm.get('gender')?.valueChanges.subscribe(value => {
      this.currentGender = value;
    });

    this.identityForm.get('reason')?.valueChanges.subscribe(value => {
      const reason = value;
      this.displayDifferentReasonInput = reason === this.REASONS.OTHER;
    });
  }

<<<<<<< Updated upstream
  onSubmit() {
    if (this.identityForm.valid) {
      console.log('Form submitted', this.identityForm.value);
    } else {
      console.log('Form is invalid');
    }
=======
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
    this.json = {
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

    console.log(this.json);

  }

  onSubmit() {
    this.adjustFormData();
    console.log(this.formData);
    this.formDataToJSON(this.formData);
    let dialogRef = this.dialog.open(SubmitPopUpComponent, {
      data: { json: this.json },
    });
>>>>>>> Stashed changes
  }

  getTitleForGender = () => this.TITLES[this.currentGender];
}
