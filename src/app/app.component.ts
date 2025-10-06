import { AsyncPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { RouterOutlet } from '@angular/router';

import { FooterComponent } from './components/footer/footer.component';
import { HeaderComponent } from './components/header/header.component';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, AsyncPipe],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  theme$!: Observable<'light' | 'dark'>;

  constructor(private readonly theme: ThemeService) {}

  ngOnInit(): void {
    this.theme$ = this.theme.theme$;
    this.theme.init();
  }

  onToggleTheme(): void {
    this.theme.toggle();
  }
}
