import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

interface PackageCard {
  id: string;
  title: string;
  body: string;
  url: string;
}

@Component({
  selector: 'app-order',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderComponent {
  readonly packages: PackageCard[] = [
    {
      id: 'complete',
      title: 'Complete numerology analysis',
      body: 'All 12 core numbers, cycles, pinnacles and health profile. Ideal for your first full reading.',
      url: 'https://www.numerologensverden.no/bestill-analyser/?package=komplett',
    },
    {
      id: 'partner',
      title: 'Relationship / partner report',
      body: 'Compares two charts to highlight harmony, lessons and cycles you share.',
      url: 'https://www.numerologensverden.no/bestill-analyser/?package=partner',
    },
    {
      id: 'business',
      title: 'Business / brand name reading',
      body: 'Tests company, product or brand names against Åse’s vibration charts before launch.',
      url: 'https://www.numerologensverden.no/bestill-analyser/?package=bedrift',
    },
    {
      id: 'baby',
      title: 'Baby / child name guidance',
      body: 'Evaluates suggested names to find supportive vibrations for newborns or children.',
      url: 'https://www.numerologensverden.no/bestill-analyser/?package=barn',
    },
  ];
}
