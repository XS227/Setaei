import { Routes } from '@angular/router';

import { HomeComponent } from './pages/home/home.component';
import { OrderComponent } from './pages/order/order.component';
import { SeoConfig } from './services/seo.service';

const BASE_URL = 'https://tall.setaei.com';

const HOME_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  name: 'Åse Steinsland Numerology Studio',
  url: BASE_URL,
  description:
    'Guided numerology intake that calculates every core, bridge and cycle number with instant PDF export for Åse Steinsland\'s clients.',
  areaServed: 'Worldwide',
  provider: {
    '@type': 'Person',
    name: 'Åse Karin Steinsland',
    url: 'https://www.numerologensverden.no/',
  },
  serviceType: ['Numerology analysis', 'Name number consultation', 'Personal year forecast'],
  brand: {
    '@type': 'Brand',
    name: 'Åse Steinsland Numerology Studio',
  },
  offers: {
    '@type': 'Offer',
    availability: 'https://schema.org/OnlineOnly',
    price: '0',
    priceCurrency: 'NOK',
    description: 'Free intake preview with downloadable PDF short analysis.',
  },
  potentialAction: {
    '@type': 'Action',
    name: 'Generate numerology overview',
    target: `${BASE_URL}/`,
  },
} as const;

const ORDER_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'OfferCatalog',
  name: 'Numerology analysis packages',
  url: `${BASE_URL}/order`,
  provider: {
    '@type': 'Person',
    name: 'Åse Karin Steinsland',
  },
  itemListElement: [
    {
      '@type': 'Offer',
      url: 'https://www.numerologensverden.no/bestill-analyser/?package=komplett',
      itemOffered: {
        '@type': 'Service',
        name: 'Complete numerology analysis',
        description: 'All 12 core numbers, cycles, pinnacles and health profile. Ideal for a first full reading.',
      },
    },
    {
      '@type': 'Offer',
      url: 'https://www.numerologensverden.no/bestill-analyser/?package=partner',
      itemOffered: {
        '@type': 'Service',
        name: 'Relationship / partner report',
        description: 'Compare two numerology charts to explore harmony, lessons and shared cycles.',
      },
    },
    {
      '@type': 'Offer',
      url: 'https://www.numerologensverden.no/bestill-analyser/?package=bedrift',
      itemOffered: {
        '@type': 'Service',
        name: 'Business / brand name reading',
        description: 'Test company, product or brand names against Åse\'s vibration charts before launch.',
      },
    },
    {
      '@type': 'Offer',
      url: 'https://www.numerologensverden.no/bestill-analyser/?package=barn',
      itemOffered: {
        '@type': 'Service',
        name: 'Baby / child name guidance',
        description: 'Evaluate suggested names to find supportive vibrations for newborns or children.',
      },
    },
  ],
} as const;

const HOME_SEO: SeoConfig = {
  title: 'Guided Numerology Intake | Åse Steinsland Numerology Studio',
  description:
    'Follow Åse Steinsland\'s guided numerology intake to calculate name, destiny, bridge and cycle numbers, then create a free PDF overview instantly.',
  path: '/',
  schema: HOME_SCHEMA,
};

const ORDER_SEO: SeoConfig = {
  title: 'Book a Detailed Numerology Analysis | Åse Steinsland',
  description:
    'Choose between Åse Steinsland\'s complete reading, partner insight, business naming or baby name guidance packages.',
  path: '/order',
  schema: ORDER_SCHEMA,
};

export const routes: Routes = [
  { path: '', component: HomeComponent, data: { seo: HOME_SEO } },
  { path: 'order', component: OrderComponent, data: { seo: ORDER_SEO } },
  { path: '**', redirectTo: '' },
];
