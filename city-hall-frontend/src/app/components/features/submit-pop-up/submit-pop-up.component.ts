import { Component, Inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle
} from '@angular/material/dialog';
import {MatButton} from '@angular/material/button';
import {FormService} from '../../../services/form/form.service';
import {saveAs} from 'file-saver';
import {HttpClient} from '@angular/common/http';

@Component({
  selector: 'app-submit-pop-up',
  standalone: true,
  imports: [
    MatDialogContent,
    MatDialogActions,
    MatButton,
    MatDialogClose,
    MatDialogTitle
  ],
  templateUrl: './submit-pop-up.component.html',
  styleUrl: './submit-pop-up.component.scss'
})
export class SubmitPopUpComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: {json: {[key: string]: any}}, private formService: FormService, private http: HttpClient) { }

  downloadPdf(){
    this.formService.getPDF(this.data.json).subscribe(
      res => saveAs(res.body, "wniosek.pdf")
    );
  }
  savePdfToDrive(){
    let formData: FormData = new FormData()
    this.formService.getPDF(this.data.json).subscribe(
      res => {
        formData.append('uploadFile', res.body, "wniosek.pdf")
        this.http.post('http://localhost:5001/upload', formData)
          .subscribe(response => {
            console.log("Plik wyslany ", response)
          }, error => {
            console.error("Blad przy wysylaniu pliku ", error)
          })
      }
    );
  }
  sendPdfMail(){

  }
}
