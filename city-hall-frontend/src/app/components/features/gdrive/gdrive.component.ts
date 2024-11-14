import {Component, ElementRef, ViewChild} from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-gdrive',
  standalone: true,
  imports: [],
  templateUrl: './gdrive.component.html',
  styleUrl: './gdrive.component.scss'
})
export class GdriveComponent {
  constructor(private http: HttpClient) {}

  @ViewChild('fileInput') fileInput!: ElementRef;
  file: File;
  formData: FormData = new FormData();

  handleChange(fileInput:any): void{
    this.file = fileInput?.files[0];
  }
  uploadFile(): void{
    if (!this.file) {
      console.log("Nie wybrano pliku")
      return;
    }
    this.formData.append('uploadFile', this.file, this.file.name)
    this.http.post('http://localhost:5000/upload',this.formData)
      .subscribe(response => {
        console.log("Plik wyslany ", response)
      },error => {
        console.error("Blad przy wysylaniu pliku ", error)
        })
  }
}
