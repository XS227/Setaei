import { AsyncPipe } from '@angular/common';
import { Component, DestroyRef, OnInit } from '@angular/core';
import { Observable, filter } from 'rxjs';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { RouterOutlet } from '@angular/router';

import { FooterComponent } from './components/footer/footer.component';
import { HeaderComponent } from './components/header/header.component';
import { ThemeService } from './services/theme.service';
import { SeoConfig, SeoService } from './services/seo.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, AsyncPipe],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  theme$!: Observable<'light' | 'dark'>;

  constructor(
    private readonly theme: ThemeService,
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly seo: SeoService,
    private readonly destroyRef: DestroyRef,
  ) {}
  constructor(private readonly theme: ThemeService) {}

  ngOnInit(): void {
    this.theme$ = this.theme.theme$;
    this.theme.init();
    this.registerSeoUpdates();
  }

  onToggleTheme(): void {
    this.theme.toggle();
  }

  private registerSeoUpdates(): void {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        let route = this.activatedRoute;
        while (route.firstChild) {
          route = route.firstChild;
        }
        const config = (route.snapshot.data['seo'] ?? {}) as Partial<SeoConfig>;
        this.seo.update({ ...config, path: config.path ?? this.router.url });
      });
  }
}
