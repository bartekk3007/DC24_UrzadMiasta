import { Routes } from '@angular/router';
import { FormComponent } from './components/features/form/form.component';
import {GdriveComponent} from './components/features/gdrive/gdrive.component';

export const routes: Routes = [
    {
        path: '',
        component: FormComponent
    },
    {
      path: 'gdrive',
      component: GdriveComponent
    }
];
