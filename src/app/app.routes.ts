import { Routes } from '@angular/router';

import { HomeComponent } from './pages/home/home.component';
import { OrderComponent } from './pages/order/order.component';
import { SeoConfig } from './services/seo.service';

const BASE_URL = 'https://tall.setaei.com';
const SHARE_IMAGE = `${BASE_URL}/assets/share-card.svg`;
const HOME_BREADCRUMB_ID = `${BASE_URL}/#breadcrumb`;
const ORDER_BREADCRUMB_ID = `${BASE_URL}/order#breadcrumb`;
const PUBLISHED_TIME = '2024-04-15T08:00:00+02:00';
const LAST_UPDATED = '2024-06-05T10:00:00+02:00';

const PROFESSIONAL_SERVICE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  '@id': `${BASE_URL}#professional-service`,
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
  image: SHARE_IMAGE,
  potentialAction: {
    '@type': 'Action',
    name: 'Generate numerology overview',
    target: `${BASE_URL}/`,
  },
} as const;

const HOME_BREADCRUMB = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  '@id': HOME_BREADCRUMB_ID,
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: BASE_URL,
    },
  ],
} as const;

const HOME_WEBPAGE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Guided Numerology Intake | Åse Steinsland Numerology Studio',
  url: BASE_URL,
  description:
    'Follow Åse Steinsland\'s guided numerology intake to calculate name, destiny, bridge and cycle numbers, then create a free PDF overview instantly.',
  inLanguage: 'en',
  datePublished: PUBLISHED_TIME,
  dateModified: LAST_UPDATED,
  image: SHARE_IMAGE,
  breadcrumb: { '@id': HOME_BREADCRUMB_ID },
  isPartOf: {
    '@type': 'WebSite',
    name: 'Åse Steinsland Numerology Studio',
    url: BASE_URL,
  },
  about: { '@id': `${BASE_URL}#professional-service` },
} as const;

const HOME_SCHEMA = [HOME_WEBPAGE_SCHEMA, HOME_BREADCRUMB, PROFESSIONAL_SERVICE_SCHEMA] as const;

const ORDER_BREADCRUMB = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  '@id': ORDER_BREADCRUMB_ID,
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: BASE_URL,
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Order analysis',
      item: `${BASE_URL}/order`,
    },
  ],
} as const;

const ORDER_WEBPAGE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Book a Detailed Numerology Analysis | Åse Steinsland',
  url: `${BASE_URL}/order`,
  description:
    'Choose between Åse Steinsland\'s complete reading, partner insight, business naming or baby name guidance packages.',
  inLanguage: 'en',
  datePublished: PUBLISHED_TIME,
  dateModified: LAST_UPDATED,
  image: SHARE_IMAGE,
  breadcrumb: { '@id': ORDER_BREADCRUMB_ID },
  isPartOf: {
    '@type': 'WebSite',
    name: 'Åse Steinsland Numerology Studio',
    url: BASE_URL,
  },
  about: { '@id': `${BASE_URL}#professional-service` },
} as const;

const ORDER_CATALOG_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'OfferCatalog',
  name: 'Numerology analysis packages',
  url: `${BASE_URL}/order`,
  inLanguage: 'en',
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

const ORDER_SCHEMA = [ORDER_WEBPAGE_SCHEMA, ORDER_BREADCRUMB, ORDER_CATALOG_SCHEMA, PROFESSIONAL_SERVICE_SCHEMA] as const;

const HOME_SEO: SeoConfig = {
  title: 'Guided Numerology Intake | Åse Steinsland Numerology Studio',
  description:
    'Follow Åse Steinsland\'s guided numerology intake to calculate name, destiny, bridge and cycle numbers, then create a free PDF overview instantly.',
  path: '/',
  image: SHARE_IMAGE,
  imageAlt: 'Abstract orange numerology illustration with Åse Steinsland monogram',
  keywords: [
    'Åse Steinsland numerology',
    'numerology intake form',
    'name number calculator',
    'destiny number calculator',
    'personal year forecast',
  ],
  publishedTime: PUBLISHED_TIME,
  modifiedTime: LAST_UPDATED,
  schema: HOME_SCHEMA,
};

const ORDER_SEO: SeoConfig = {
  title: 'Book a Detailed Numerology Analysis | Åse Steinsland',
  description:
    'Choose between Åse Steinsland\'s complete reading, partner insight, business naming or baby name guidance packages.',
  path: '/order',
  image: SHARE_IMAGE,
  imageAlt: 'Åse Steinsland numerology packages illustration',
  keywords: ['numerology analysis order', 'Åse Steinsland booking', 'numerology consultation packages'],
  publishedTime: PUBLISHED_TIME,
  modifiedTime: LAST_UPDATED,
  schema: ORDER_SCHEMA,
};

export const routes: Routes = [
  { path: '', component: HomeComponent, data: { seo: HOME_SEO } },
  { path: 'order', component: OrderComponent, data: { seo: ORDER_SEO } },

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'order', component: OrderComponent },
  { path: '**', redirectTo: '' },
];
