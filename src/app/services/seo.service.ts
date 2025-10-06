import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

export interface SeoConfig {
  title?: string;
  description?: string;
  path?: string;
  type?: string;
  image?: string;
  schema?: unknown;
}

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly baseUrl = 'https://tall.setaei.com';
  private readonly schemaElementId = 'structured-data';

  constructor(
    private readonly meta: Meta,
    private readonly title: Title,
    @Inject(DOCUMENT) private readonly document: Document,
  ) {}

  update(config: SeoConfig): void {
    const finalTitle = config.title ?? 'Åse Steinsland Numerology Studio';
    const finalDescription =
      config.description ??
      'Step through Åse Steinsland\'s numerology intake, calculate every core number instantly, and download a personalised PDF overview.';
    const finalPath = config.path ?? this.document?.location?.pathname ?? '/';
    const url = this.fullUrl(finalPath);
    const image = config.image ?? `${this.baseUrl}/assets/share-card.svg`;
    const type = config.type ?? 'website';

    this.title.setTitle(finalTitle);

    this.meta.updateTag({ name: 'description', content: finalDescription });
    this.meta.updateTag({ name: 'robots', content: 'index, follow' });
    this.meta.updateTag({ property: 'og:title', content: finalTitle });
    this.meta.updateTag({ property: 'og:description', content: finalDescription });
    this.meta.updateTag({ property: 'og:type', content: type });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ property: 'og:image', content: image });
    this.meta.updateTag({ property: 'og:site_name', content: 'Åse Steinsland Numerology Studio' });
    this.meta.updateTag({ property: 'og:locale', content: 'en_GB' });

    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: finalTitle });
    this.meta.updateTag({ name: 'twitter:description', content: finalDescription });
    this.meta.updateTag({ name: 'twitter:image', content: image });

    this.setCanonical(url);
    this.setSchema(config.schema);
  }

  private fullUrl(path: string): string {
    try {
      return new URL(path, this.baseUrl).toString();
    } catch {
      return `${this.baseUrl}/`;
    }
  }

  private setCanonical(url: string): void {
    let link = this.document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.document.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }

  private setSchema(schema?: unknown): void {
    const existing = this.document.getElementById(this.schemaElementId) as HTMLScriptElement | null;

    if (!schema) {
      existing?.remove();
      return;
    }

    const script = existing ?? this.document.createElement('script');
    script.type = 'application/ld+json';
    script.id = this.schemaElementId;
    script.textContent = JSON.stringify(schema);

    if (!existing) {
      this.document.head.appendChild(script);
    }
  }
}
