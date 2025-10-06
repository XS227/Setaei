import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NUMBER_STORIES } from '../../data/number-stories';
import {
  AddressDigitsResult,
  AddressLettersResult,
  BirthDetails,
  ChallengeEntry,
  CycleEntry,
  EssenceEntry,
  HealthProfileResult,
  MaturityResult,
  NumerologyService,
  PersonalMonthRow,
  ReductionWithDigits,
} from '../../services/numerology.service';
import { PdfService } from '../../services/pdf.service';

interface StepDefinition {
  title: string;
  description: string;
  summary: string;
  controls: string[];
}

interface CardBreakdownEntry {
  label: string;
  value: number;
}

interface AnalysisCard {
  key: string;
  label: string;
  number: number;
  story?: string;
  subtitle?: string;
  breakdown?: CardBreakdownEntry[];
  details?: string[];
}

interface AnalysisOverview {
  core: AnalysisCard[];
  current: AnalysisCard[];
  bridges: AnalysisCard[];
  cycles: AnalysisCard[];
  practical: AnalysisCard[];
  personalYears: { year: number; number: number }[];
  personalMonths: PersonalMonthRow[];
  essence: EssenceEntry[];
  pinnacles: CycleEntry[];
  lifeCycles: CycleEntry[];
  challenges: ChallengeEntry[];
}

const CARD_LABELS: Record<string, string> = {
  numberName: 'Name number',
  numberVowel: 'Vowel number',
  numberConsonant: 'Consonant number',
  numberDestiny: 'Destiny number',
  numberBirthday: 'Birthday number',
  numberMaturity: 'Maturity number',
  numberPersonalYear: 'Personal year',
  numberCurrentName: 'Current name number',
  numberCurrentVowel: 'Current vowel number',
  numberCornerstone: 'Cornerstone',
  numberLifeBridge: 'Life path / name bridge',
  numberSoulBridge: 'Vowel / consonant bridge',
  numberBalance: 'Balance number',
  numberTransitPhysical: 'Physical transit',
  numberTransitMental: 'Mental transit',
  numberTransitSpiritual: 'Spiritual transit',
  numberHealth: 'Health profile number',
  numberAddress: 'Address number',
  numberLucky: 'Lucky number',
  numberPhone: 'Telephone number',
};

const SECTION_LABELS = {
  core: 'Core profile',
  current: 'Current identity',
  bridges: 'Bridges & balance',
  cycles: 'Cycles & transits',
  practical: 'Practical numbers',
};

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  @ViewChild('analysisPreview') analysisPreview?: ElementRef<HTMLElement>;

  readonly form: FormGroup;
  readonly steps: StepDefinition[] = [
    {
      title: 'Welcome',
      description: 'Share the name Åse should greet you with.',
      summary: 'Preferred name',
      controls: ['preferredName'],
    },
    {
      title: 'Birth names',
      description: 'Add the full birth certificate name and any current name you use today.',
      summary: 'Birth & current names',
      controls: ['birthName', 'currentName'],
    },
    {
      title: 'Birth details',
      description: 'Confirm your sex, birth date and original calendar so we can translate everything to Western time.',
      summary: 'Birth data & calendar',
      controls: ['sex', 'birthDate', 'calendar', 'targetYear'],
    },
    {
      title: 'Contact information',
      description: 'Share the best ways for Åse to reach you for delivery and optional follow up.',
      summary: 'How to reach you',
      controls: ['address', 'phone', 'email'],
    },
    {
      title: 'Intentions',
      description: 'Leave notes for Åse to tailor the consultation to your goals.',
      summary: 'Your intentions',
      controls: ['notes'],
    },
  ];

  currentStep = 0;
  analysis?: AnalysisOverview;
  analysisGenerated = false;
  errorMessage = '';
  isDownloading = false;
  readonly sectionLabels = SECTION_LABELS;
  readonly personalMonthColumns = Array.from({ length: 9 }, (_, index) => index + 1);
  readonly cardSections: (keyof Pick<AnalysisOverview, 'core' | 'current' | 'bridges' | 'cycles' | 'practical'>)[] = [
    'core',
    'current',
    'bridges',
    'cycles',
    'practical',
  ];

  constructor(
    private readonly fb: FormBuilder,
    private readonly numerology: NumerologyService,
    private readonly pdfService: PdfService,
    private readonly router: Router,
  ) {
    const currentYear = new Date().getFullYear();
    this.form = this.fb.group({
      preferredName: ['', [Validators.required, Validators.maxLength(80)]],
      birthName: ['', [Validators.required, Validators.maxLength(180)]],
      currentName: ['', [Validators.maxLength(180)]],
      sex: [''],
      birthDate: ['', Validators.required],
      calendar: ['gregorian', Validators.required],
      targetYear: [currentYear, [Validators.required, Validators.min(1900), Validators.max(2400)]],
      address: ['', [Validators.maxLength(200)]],
      phone: ['', [Validators.maxLength(40)]],
      email: ['', Validators.email],
      notes: ['', [Validators.maxLength(800)]],
    });
  }

  get stories(): [number, string][] {
    return Object.entries(NUMBER_STORIES)
      .map(([key, story]) => [Number(key), story] as [number, string])
      .sort((a, b) => a[0] - b[0]);
  }

  get progressValue(): number {
    if (this.analysisGenerated) {
      return 100;
    }
    const value = (this.currentStep / this.steps.length) * 100;
    return Math.round(value);
  }

  get stepLabel(): string {
    return `Step ${this.currentStep + 1} of ${this.steps.length}`;
  }

  get progressLabel(): string {
    if (this.analysisGenerated) {
      return 'Overview ready';
    }
    return `Progress: ${this.progressValue}% complete`;
  }

  get currentStepTitle(): string {
    return this.steps[this.currentStep]?.title ?? '';
  }

  formatRange(entry: { startAge: number; endAge: number | null }): string {
    const end = entry.endAge === null ? '∞' : entry.endAge;
    return `${entry.startAge}–${end}`;
  }

  goNext(): void {
    if (!this.validateStep(this.currentStep)) {
      return;
    }
    if (this.currentStep < this.steps.length - 1) {
      this.currentStep += 1;
      this.analysisGenerated = false;
      this.analysis = undefined;
    }
  }

  goBack(): void {
    if (this.currentStep > 0) {
      this.currentStep -= 1;
      this.analysisGenerated = false;
      this.analysis = undefined;
    }
  }

  finish(): void {
    if (!this.validateStep(this.currentStep)) {
      return;
    }
    if (this.generateOverview()) {
      this.analysisGenerated = true;
      setTimeout(() => this.scrollToResults(), 150);
    }
  }

  async downloadPdf(): Promise<void> {
    if (!this.analysisGenerated) {
      const generated = this.generateOverview();
      if (!generated) {
        return;
      }
      this.analysisGenerated = true;
    }

    const element = this.analysisPreview?.nativeElement;
    if (!element || this.isDownloading) {
      return;
    }

    try {
      this.isDownloading = true;
      await this.pdfService.exportElement(element, 'ase-steinsland-short-analysis.pdf');
    } finally {
      this.isDownloading = false;
    }
  }

  openOrder(): void {
    if (!this.analysisGenerated) {
      const generated = this.generateOverview();
      if (!generated) {
        return;
      }
      this.analysisGenerated = true;
    }
    this.router.navigate(['/order']);
  }

  private validateStep(index: number): boolean {
    const step = this.steps[index];
    if (!step) {
      return true;
    }
    let valid = true;
    step.controls.forEach((controlName) => {
      const control = this.form.get(controlName);
      if (!control) {
        return;
      }
      control.markAsTouched();
      control.updateValueAndValidity();
      if (control.invalid) {
        valid = false;
      }
    });
    return valid;
  }

  private scrollToResults(): void {
    if (this.analysisPreview) {
      this.analysisPreview.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  cardsFor(section: (typeof this.cardSections)[number]): AnalysisCard[] {
    if (!this.analysis) {
      return [];
    }
    return this.analysis[section];
  }

  private buildCard(options: Partial<AnalysisCard> & { key: string; number: number }): AnalysisCard {
    const label = CARD_LABELS[options.key] || options.key;
    return {
      key: options.key,
      label,
      number: options.number,
      story: options.story,
      subtitle: options.subtitle,
      breakdown: options.breakdown,
      details: options.details,
    };
  }

  private generateOverview(): boolean {
    this.errorMessage = '';
    const birthName = (this.form.get('birthName')?.value as string || '').trim();
    const currentName = (this.form.get('currentName')?.value as string || '').trim();
    const birthDateRaw = this.form.get('birthDate')?.value as string;
    const calendar = this.form.get('calendar')?.value as BirthDetails['calendar'];
    const targetYearControl = this.form.get('targetYear');
    const targetYear = Number(targetYearControl?.value ?? new Date().getFullYear());
    const address = (this.form.get('address')?.value as string || '').trim();
    const phone = (this.form.get('phone')?.value as string || '').trim();

    if (!birthName || !birthDateRaw || !calendar || !Number.isFinite(targetYear)) {
      this.errorMessage = 'Add your birth name, date of birth and target year to generate the overview.';
      return false;
    }

    const [year, month, day] = birthDateRaw.split('-').map((segment) => parseInt(segment, 10));
    if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
      this.errorMessage = 'The birth date looks incomplete. Please use the YYYY-MM-DD format.';
      return false;
    }

    const birthData: BirthDetails = { calendar, year, month, day };

    let destiny: ReductionWithDigits;
    let personalYear: ReductionWithDigits;
    try {
      destiny = this.numerology.destinyNumber(birthData);
      personalYear = this.numerology.personalYearNumber(birthData, targetYear);
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'Unable to convert the birth date.';
      return false;
    }

    const nameBreakdown = this.numerology.breakdownName(birthName);
    const vowelBreakdown = this.numerology.breakdownName(birthName, { mode: 'vowel' });
    const consonantBreakdown = this.numerology.breakdownName(birthName, { mode: 'consonant' });
    const maturity = this.numerology.maturityNumber(nameBreakdown.number, destiny.number);

    const birthday = this.numerology.birthdayNumber(birthData);
    const lucky = this.numerology.luckyNumber(birthData);
    const cornerstoneValue = this.numerology.cornerstone(birthName);
    const balanceValue = this.numerology.balanceNumber(birthName);
    const lifeBridge = this.numerology.bridgeNumber(destiny.number, nameBreakdown.number);
    const soulBridge = this.numerology.bridgeNumber(vowelBreakdown.number, consonantBreakdown.number);
    const healthProfile = this.numerology.healthProfileMetrics(nameBreakdown.number, personalYear.number, birthday.number);

    const currentNameBreakdown = currentName ? this.numerology.breakdownName(currentName) : null;
    const currentVowelBreakdown = currentName ? this.numerology.breakdownName(currentName, { mode: 'vowel' }) : null;
    const addressCalc = address ? this.numerology.addressNumber(address) : null;
    const phoneCalc = phone ? this.numerology.telephoneNumber(phone) : null;

    const personalYearsSeries = this.numerology.personalYearSeries(birthData, targetYear);
    const personalMonths = this.numerology.personalMonthMatrix(birthData, targetYear);
    const essence = this.numerology.essenceCycle(nameBreakdown, targetYear - 4, 13);
    const transits = this.numerology.transitNumbers(
      nameBreakdown.number,
      vowelBreakdown.number,
      consonantBreakdown.number,
      personalYear.number,
    );
    const pinnacles = this.numerology.pinnacleCycles(birthData);
    const lifeCycle = this.numerology.lifeCycles(birthData);
    const challenges = this.numerology.challengeNumbers(birthData);

    const stories = NUMBER_STORIES;

    const coreCards: AnalysisCard[] = [
      this.buildCard({
        key: 'numberName',
        number: nameBreakdown.number,
        story: stories[nameBreakdown.number],
        breakdown: nameBreakdown.breakdown.map((entry) => ({ label: entry.label, value: entry.value })),
      }),
      this.buildCard({
        key: 'numberVowel',
        number: vowelBreakdown.number,
        story: stories[vowelBreakdown.number],
        breakdown: vowelBreakdown.breakdown.map((entry) => ({ label: entry.label, value: entry.value })),
      }),
      this.buildCard({
        key: 'numberConsonant',
        number: consonantBreakdown.number,
        story: stories[consonantBreakdown.number],
        breakdown: consonantBreakdown.breakdown.map((entry) => ({ label: entry.label, value: entry.value })),
      }),
      this.buildCard({
        key: 'numberDestiny',
        number: destiny.number,
        story: stories[destiny.number],
        breakdown: destiny.digits.map((digit) => ({ label: digit.toString(), value: digit })),
      }),
      this.buildCard({
        key: 'numberBirthday',
        number: birthday.number,
        story: stories[birthday.number],
        breakdown: birthday.digits.map((digit) => ({ label: digit.toString(), value: digit })),
      }),
      this.buildCard({
        key: 'numberMaturity',
        number: maturity.number,
        story: stories[maturity.number],
        subtitle: `Combined: ${maturity.combined}`,
        breakdown: [{ label: 'Σ', value: maturity.combined }],
      }),
      this.buildCard({
        key: 'numberPersonalYear',
        number: personalYear.number,
        story: stories[personalYear.number],
        breakdown: personalYear.digits.map((digit) => ({ label: digit.toString(), value: digit })),
      }),
    ];

    const currentCards: AnalysisCard[] = [];
    if (currentNameBreakdown) {
      currentCards.push(this.buildCard({
        key: 'numberCurrentName',
        number: currentNameBreakdown.number,
        story: stories[currentNameBreakdown.number],
        breakdown: currentNameBreakdown.breakdown.map((entry) => ({ label: entry.label, value: entry.value })),
      }));
    }
    if (currentVowelBreakdown) {
      currentCards.push(this.buildCard({
        key: 'numberCurrentVowel',
        number: currentVowelBreakdown.number,
        story: stories[currentVowelBreakdown.number],
        breakdown: currentVowelBreakdown.breakdown.map((entry) => ({ label: entry.label, value: entry.value })),
      }));
    }

    const bridgeCards: AnalysisCard[] = [];
    if (cornerstoneValue) {
      bridgeCards.push(this.buildCard({
        key: 'numberCornerstone',
        number: cornerstoneValue.number,
        story: stories[cornerstoneValue.number],
        subtitle: `${cornerstoneValue.letter} → ${cornerstoneValue.value}`,
        breakdown: [{ label: cornerstoneValue.letter, value: cornerstoneValue.value }],
      }));
    }
    if (lifeBridge) {
      bridgeCards.push(this.buildCard({
        key: 'numberLifeBridge',
        number: lifeBridge.number,
        story: stories[lifeBridge.number],
        subtitle: `Difference: ${lifeBridge.difference}`,
        breakdown: [{ label: 'Δ', value: lifeBridge.difference }],
      }));
    }
    if (soulBridge) {
      bridgeCards.push(this.buildCard({
        key: 'numberSoulBridge',
        number: soulBridge.number,
        story: stories[soulBridge.number],
        subtitle: `Difference: ${soulBridge.difference}`,
        breakdown: [{ label: 'Δ', value: soulBridge.difference }],
      }));
    }
    if (balanceValue) {
      bridgeCards.push(this.buildCard({
        key: 'numberBalance',
        number: balanceValue.number,
        story: stories[balanceValue.number],
        subtitle: `Letters: ${balanceValue.letters.map((entry) => entry.letter).join(' + ')}`,
        breakdown: balanceValue.letters.map((entry, index) => ({ label: entry.letter || `c${index + 1}`, value: entry.value })),
      }));
    }

    const cycleCards: AnalysisCard[] = [
      this.buildCard({
        key: 'numberTransitPhysical',
        number: transits.physical.number,
        story: stories[transits.physical.number],
        subtitle: `Base: ${transits.physical.base}`,
        breakdown: [
          { label: 'Base', value: transits.physical.base },
          { label: 'Personal year', value: personalYear.number },
        ],
      }),
      this.buildCard({
        key: 'numberTransitMental',
        number: transits.mental.number,
        story: stories[transits.mental.number],
        subtitle: `Base: ${transits.mental.base}`,
        breakdown: [
          { label: 'Base', value: transits.mental.base },
          { label: 'Personal year', value: personalYear.number },
        ],
      }),
      this.buildCard({
        key: 'numberTransitSpiritual',
        number: transits.spiritual.number,
        story: stories[transits.spiritual.number],
        subtitle: `Base: ${transits.spiritual.base}`,
        breakdown: [
          { label: 'Base', value: transits.spiritual.base },
          { label: 'Personal year', value: personalYear.number },
        ],
      }),
    ];

    const practicalCards: AnalysisCard[] = [];
    if (healthProfile) {
      practicalCards.push(this.buildCard({
        key: 'numberHealth',
        number: healthProfile.number,
        story: stories[healthProfile.number],
        subtitle: `Components: ${healthProfile.components.join(' + ')}`,
        breakdown: healthProfile.components.map((value, index) => ({ label: `c${index + 1}`, value })),
      }));
    }
    if (addressCalc) {
      if ((addressCalc as AddressDigitsResult).mode === 'digits') {
        const digitsResult = addressCalc as AddressDigitsResult;
        practicalCards.push(this.buildCard({
          key: 'numberAddress',
          number: digitsResult.number,
          story: stories[digitsResult.number],
          subtitle: `Digits: ${digitsResult.digits.join(' + ')}`,
          breakdown: digitsResult.digits.map((digit, index) => ({ label: `d${index + 1}`, value: digit })),
        }));
      } else {
        const lettersResult = addressCalc as AddressLettersResult;
        practicalCards.push(this.buildCard({
          key: 'numberAddress',
          number: lettersResult.number,
          story: stories[lettersResult.number],
          subtitle: `Letters: ${lettersResult.breakdown.map((entry) => entry.label).join(' + ')}`,
          breakdown: lettersResult.breakdown.map((entry) => ({ label: entry.label, value: entry.value })),
        }));
      }
    }
    if (lucky) {
      practicalCards.push(this.buildCard({
        key: 'numberLucky',
        number: lucky.value,
        story: stories[lucky.value],
        subtitle: `Month + Day`,
        breakdown: [
          { label: 'Month', value: birthData.month },
          { label: 'Day', value: birthData.day },
        ],
      }));
    }
    if (phoneCalc) {
      practicalCards.push(this.buildCard({
        key: 'numberPhone',
        number: phoneCalc.number,
        story: stories[phoneCalc.number],
        subtitle: `Digits: ${phoneCalc.digits.join(' + ')}`,
        breakdown: phoneCalc.digits.map((digit, index) => ({ label: `p${index + 1}`, value: digit })),
      }));
    }

    this.analysis = {
      core: coreCards,
      current: currentCards,
      bridges: bridgeCards,
      cycles: cycleCards,
      practical: practicalCards,
      personalYears: personalYearsSeries.map(({ year: yr, result }) => ({ year: yr, number: result.number })),
      personalMonths,
      essence,
      pinnacles,
      lifeCycles: lifeCycle,
      challenges,
    };
    return true;
  }
}
