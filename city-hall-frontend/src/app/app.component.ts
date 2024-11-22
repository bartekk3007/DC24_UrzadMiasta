import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoaderComponent } from './components/ui/loader/loader.component';
import { LoadingService } from './services/loader/loading.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, LoaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'city-hall-app';
  isLoading: boolean = false;

  constructor(private loadingService: LoadingService) {
    this.loadingService.getIsLoading().subscribe(isLoading => {
      this.isLoading = isLoading;
    });
  }
}
