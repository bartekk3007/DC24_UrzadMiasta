import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CamundaReasonResponse, CamundaSexResponse, FormConfig, FormDataSchema, FormDataType, FormFieldConfig, FormSectionConfig, StringBoolean } from './form.types';
import { FormService } from '../../../services/form/form.service';
import {SubmitPopUpComponent} from '../submit-pop-up/submit-pop-up.component';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import { LoadingService } from '../../../services/loader/loading.service';

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
  private readonly OPTIONAL_SECTIONS_COUNT = 2;
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
  private readonly OTHER_REASON_SECTION: FormSectionConfig = {
    fields: [
      {
        key: this.REASON_KEY,
        required: true
      }
    ],
    title: 'Podaj inny powód złożenia wniosku'
  };
  identityForm!: FormGroup;
  schema!: FormDataSchema;
  formConfig!: FormConfig;
  formData: FormDataType = {};
  json!: {[key: string]: any};
  currentSection: number = 0;
  isLastSection: boolean = false;
  isMen: boolean = false;
  reasonIndex: number = 0;
  sectionDisplayFlags = {
    stolen: false,
    other: false
  };

  constructor(private fb: FormBuilder, private formService: FormService, private dialog: MatDialog, private loadingService: LoadingService) {}

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

  private setSectionTitleBasedOnSex(sectionConfig: FormSectionConfig) {
    const text = this.isMen ? 'wnioskodawcy' : 'wnioskodawczyni';
    sectionConfig.title = `Dane kontaktowe ${text}`;
  }

  setCurrentSection() {
    const maxLength = this.getSectionsLength();
    this.isLastSection = this.currentSection === maxLength - 1;
    if (this.currentSection < maxLength) {
      this.currentSection++;
      return;
    }
  }

  displaySection(sectionTitle: string) {
    return sectionTitle === this.formConfig.sections[this.currentSection].title;
  }

  menSelected() {
    return (this.formData[this.SEX_KEY] && this.formData[this.SEX_KEY].includes(this.SEX_MEN)) as boolean;
  }

  setIsMen(camundaInfo: CamundaSexResponse) {
    this.isMen = this.getStringBooleanValue(camundaInfo.czyMezczyzna);
  }

  private displayPreviousDocumentSection() {
    return this.formData[this.REASON_KEY] && !this.formData[this.REASON_KEY].includes(this.FIRST_ID_REASON);
  }

  private displayStolenDocumentSection() {
    return this.formData[this.REASON_KEY] && this.formData[this.REASON_KEY].includes(this.IS_STOLEN_REASON);
  }

  private getSectionsLength() {
    const length = this.formConfig.sections.length;
    return length - 1;
  }

  private currentSectionHasSexProperty(): boolean {
    const formSectionFields = this.formConfig.sections[this.currentSection].fields.flatMap(field => field.label ? field.label : '');
    return formSectionFields.includes(this.SEX_KEY);
  }

  private currentSectionHasReasonProperty(): boolean {
    const currentSection =  this.formConfig.sections[this.currentSection];
    return currentSection.title.includes(this.REASON_KEY);
  }

  private setStolenAndOtherReasonFields(camundaInfo: CamundaReasonResponse) {
    this.sectionDisplayFlags = {
      other: this.getStringBooleanValue(camundaInfo.czyUzasadnienie),
      stolen: this.getStringBooleanValue(camundaInfo.czyKradziez)
    }

    if (this.sectionDisplayFlags.other) {
      this.formConfig.sections.splice(4, 0, this.OTHER_REASON_SECTION);
    }
  }

  private getStringBooleanValue = (flag: StringBoolean): boolean => flag === 'true'; 

  goToNextSection() {
    if (this.currentSectionHasSexProperty()) {
      this.sendSexInfoToCamunda();
    } else if(this.currentSectionHasReasonProperty()) {
      this.sendReasonInfoToCamunda();
    } else {
      this.setCurrentSection();
    }
  }

  setReasonIndex(field: FormFieldConfig) {
    const reason = this.formData[this.REASON_KEY];
    if (reason && field.options) {
      this.reasonIndex = field.options.indexOf(reason) + 1;
    }
  }

  private removeUselessSections() {
    if (!this.displayPreviousDocumentSection()) {
      this.formConfig.sections = this.formConfig.sections.filter(seciton => !seciton.title.includes('Dane poprzedniego') && !seciton.title.includes('kradzieży'));
      return;
    }
    if (!this.sectionDisplayFlags.stolen) {
      this.formConfig.sections = this.formConfig.sections.filter(seciton => !seciton.title.includes('kradzieży'));
    }
  }
  
  private sendReasonInfoToCamunda() {
    const data = {
      powod: this.reasonIndex
    }

    this.loadingService.setIsLoading(true);

    this.formService.sendDataToCamunda(data).subscribe(
      {
        next: response => {
          console.log(response);
          this.setStolenAndOtherReasonFields(response as CamundaReasonResponse);
          this.removeUselessSections();
          this.setCurrentSection();
          this.loadingService.setIsLoading(false);
        },
        error: error => {
          this.loadingService.setIsLoading(false);
          console.error(error);
        }
      }
    );
  }

  private sendSexInfoToCamunda() {
    const data = {
      plec: this.menSelected()
    }

    this.loadingService.setIsLoading(true);

    this.formService.sendDataToCamunda(data).subscribe(
      {
        next: response => {
          console.log(response);
          this.setIsMen(response as CamundaSexResponse);
          this.setSectionTitleBasedOnSex(this.formConfig.sections[this.currentSection + 1]);
          this.setCurrentSection();
          this.loadingService.setIsLoading(false);
        },
        error: error => {
          this.loadingService.setIsLoading(false);
          console.error(error);
        }
      }
    );
  }

  allRequiredFilled() {
    const fields = this.formConfig.sections[this.currentSection].fields;
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

  formDataToJSON(formData: FormDataType){
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


  }

  onSubmit() {
    this.adjustFormData();
    this.formDataToJSON(this.formData);
    this.dialog.open(SubmitPopUpComponent, {
      data: { json: this.json },
    });
  }
}
