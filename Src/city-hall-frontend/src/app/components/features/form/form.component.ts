import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './form.component.html',
  styleUrl: './form.component.scss'
})
export class FormComponent {
  readonly GENDERS = {
    MALE: 'male',
    FEMALE: 'female'
  } as const;

  readonly REASONS = {
    OTHER: 'other'
  } as const;

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

  onSubmit() {
    if (this.identityForm.valid) {
      console.log('Form submitted', this.identityForm.value);
    } else {
      console.log('Form is invalid');
    }
  }

  getTitleForGender = () => this.TITLES[this.currentGender];
}
