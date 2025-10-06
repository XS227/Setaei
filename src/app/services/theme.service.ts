import { DOCUMENT } from '@angular/common';
import { Inject, Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

type ThemeMode = 'light' | 'dark';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly storageKey = 'numerology-theme';
  private readonly renderer: Renderer2;
  private readonly themeSubject = new BehaviorSubject<ThemeMode>('light');

  readonly theme$ = this.themeSubject.asObservable();

  constructor(
    @Inject(DOCUMENT) private readonly documentRef: Document,
    rendererFactory: RendererFactory2,
  ) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  private get prefersDark(): boolean {
    return typeof window !== 'undefined'
      && window.matchMedia
      && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  private validate(theme: string | null): ThemeMode | null {
    if (theme === 'dark' || theme === 'light') {
      return theme;
    }
    return null;
  }

  private readStoredTheme(): ThemeMode | null {
    try {
      return this.validate(localStorage.getItem(this.storageKey));
    } catch {
      return null;
    }
  }

  private storeTheme(theme: ThemeMode): void {
    try {
      localStorage.setItem(this.storageKey, theme);
    } catch {
      // Ignore persistence errors (e.g. private browsing)
    }
  }

  init(): ThemeMode {
    const stored = this.readStoredTheme();
    const theme = stored ?? (this.prefersDark ? 'dark' : 'light');
    return this.apply(theme, { persist: !stored });
  }

  get current(): ThemeMode {
    const attribute = this.documentRef.documentElement.getAttribute('data-theme');
    return this.validate(attribute) ?? 'light';
  }

  apply(theme: ThemeMode, options: { persist?: boolean } = {}): ThemeMode {
    const next = this.validate(theme) ?? (this.prefersDark ? 'dark' : 'light');
    this.renderer.setAttribute(this.documentRef.documentElement, 'data-theme', next);
    this.themeSubject.next(next);
    if (options.persist) {
      this.storeTheme(next);
    }
    return next;
  }

  toggle(): ThemeMode {
    const next = this.current === 'dark' ? 'light' : 'dark';
    this.apply(next, { persist: true });
    return next;
  }
}
