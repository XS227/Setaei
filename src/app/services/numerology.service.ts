import { Injectable } from '@angular/core';

export type ScriptType = 'latin' | 'rtl';
export type CalendarType = 'gregorian' | 'solarHijri' | 'hijri';

export interface ReductionResult {
  value: number;
  steps: number[];
}

export interface BreakdownEntry {
  label: string;
  value: number;
  type: 'vowel' | 'consonant' | 'letter';
  original?: string;
}

export interface PreparedCharacters {
  breakdown: BreakdownEntry[];
  ignored: string[];
  normalized: string;
  script: ScriptType;
}

export interface NameBreakdown {
  breakdown: BreakdownEntry[];
  total: number;
  number: number;
  steps: number[];
  ignored: string[];
  normalized: string;
  script: ScriptType;
}

export interface BirthDetails {
  calendar: CalendarType;
  year: number;
  month: number;
  day: number;
}

export interface ReductionWithDigits {
  calendarUsed: { year: number; month: number; day: number };
  digits: number[];
  total: number;
  number: number;
  steps: number[];
}

export interface MaturityResult {
  number: number;
  combined: number;
  steps: number[];
}

export interface CornerstoneResult {
  letter: string;
  value: number;
  number: number;
}

export interface BalanceLetter {
  letter: string;
  value: number;
}

export interface BalanceResult {
  letters: BalanceLetter[];
  total: number;
  number: number;
  steps: number[];
}

export interface BridgeResult {
  difference: number;
  number: number;
  steps: number[];
}

export interface HealthProfileResult {
  components: number[];
  total: number;
  number: number;
  steps: number[];
}

export interface AddressLettersResult {
  mode: 'letters';
  breakdown: BreakdownEntry[];
  total: number;
  number: number;
  steps: number[];
}

export interface AddressDigitsResult {
  mode: 'digits';
  digits: number[];
  total: number;
  number: number;
  steps: number[];
}

export type AddressResult = AddressLettersResult | AddressDigitsResult | null;

export interface TransitEntry {
  base: number;
  number: number;
  steps: number[];
}

export interface TransitSet {
  physical: TransitEntry;
  mental: TransitEntry;
  spiritual: TransitEntry;
}

export interface SeriesEntry {
  year: number;
  result: ReductionWithDigits;
}

export interface PersonalMonthEntry {
  month: number;
  number: number;
  steps: number[];
}

export interface PersonalMonthRow {
  year: number;
  months: PersonalMonthEntry[];
}

export interface EssenceEntry {
  year: number;
  total: number;
  number: number;
  steps: number[];
}

export interface CycleEntry {
  stage: number;
  startAge: number;
  endAge: number | null;
  number: number;
  steps: number[];
}

export interface ChallengeEntry {
  stage: number;
  startAge: number;
  endAge: number | null;
  number: number;
  steps: number[];
}

export interface TelephoneResult {
  digits: number[];
  total: number;
  number: number;
  steps: number[];
}

const MASTER_NUMBERS = new Set<number>([11, 22, 33]);

const LATIN_VALUES = new Map<string, number>([
  ['A', 1], ['B', 2], ['C', 3], ['D', 4], ['E', 5], ['F', 6], ['G', 7], ['H', 8], ['I', 9],
  ['J', 1], ['K', 2], ['L', 3], ['M', 4], ['N', 5], ['O', 6], ['P', 7], ['Q', 8], ['R', 9],
  ['S', 1], ['T', 2], ['U', 3], ['V', 4], ['W', 5], ['X', 6], ['Y', 7], ['Z', 8],
  ['Æ', 1], ['Ø', 6], ['Å', 1],
]);

const ABJAD_VALUES = new Map<string, number>([
  ['ا', 1], ['أ', 1], ['إ', 1], ['آ', 1], ['ٱ', 1], ['ء', 1],
  ['ب', 2], ['پ', 2],
  ['ج', 3], ['چ', 3],
  ['د', 4],
  ['ه', 5], ['ة', 5], ['ۀ', 5], ['ﻩ', 5],
  ['و', 6], ['ؤ', 6],
  ['ز', 7], ['ژ', 7],
  ['ح', 8],
  ['ط', 9],
  ['ي', 10], ['ى', 10], ['ئ', 10], ['ی', 10], ['ے', 10],
  ['ك', 20], ['ک', 20], ['گ', 20],
  ['ل', 30],
  ['م', 40],
  ['ن', 50],
  ['س', 60],
  ['ع', 70],
  ['ف', 80], ['ڤ', 80],
  ['ص', 90],
  ['ق', 100],
  ['ر', 200],
  ['ش', 300],
  ['ت', 400], ['ث', 500],
  ['خ', 600],
  ['ذ', 700],
  ['ض', 800],
  ['ظ', 900],
  ['غ', 1000],
]);

const LATIN_VOWELS = new Set<string>(['A', 'E', 'I', 'O', 'U', 'Æ', 'Ø', 'Å']);

const SPECIAL_LATIN = new Map<string, string>([
  ['Æ', 'Æ'], ['æ', 'Æ'],
  ['Ø', 'Ø'], ['ø', 'Ø'],
  ['Å', 'Å'], ['å', 'Å'],
]);

const Y_EXCEPTIONS = new Set<string>(['AY', 'EY', 'IY', 'OY', 'UY', 'YA', 'YE', 'YI', 'YO', 'YU', 'YÅ', 'YÆ']);

const ARABIC_DIACRITICS = /[\u064B-\u065F\u0670\u06D6-\u06ED]/g;
const RTL_CONTROL = /[\u200C\u200F\u200E]/g;

function detectScriptInternal(input: string): ScriptType {
  if (/[\u0600-\u06FF]/.test(input)) {
    return 'rtl';
  }
  return 'latin';
}

function expandLatinChar(char: string): string[] {
  if (char === 'Æ') return ['A', 'E'];
  if (char === 'Ø') return ['O', 'E'];
  if (char === 'Å') return ['A', 'A'];
  return [char];
}

function reduceNumber(value: number): ReductionResult {
  const steps: number[] = [];
  let current = Math.abs(Number(value) || 0);

  if (current === 0) {
    return { value: 0, steps: [0] };
  }

  steps.push(current);

  while (current > 9 && !MASTER_NUMBERS.has(current)) {
    current = current
      .toString()
      .split('')
      .map(Number)
      .reduce((sum, digit) => sum + digit, 0);
    steps.push(current);
  }

  return { value: current, steps };
}

function classifyLatinLetter(char: string, prev: string | null, next: string | null): 'vowel' | 'consonant' {
  if (char === 'Y') {
    const prevIsVowel = prev ? LATIN_VOWELS.has(prev) : false;
    const nextIsVowel = next ? LATIN_VOWELS.has(next) : false;
    const pairPrev = prev ? `${prev}Y` : '';
    const pairNext = next ? `Y${next}` : '';
    if (prevIsVowel || nextIsVowel || Y_EXCEPTIONS.has(pairPrev) || Y_EXCEPTIONS.has(pairNext)) {
      return 'consonant';
    }
    return 'vowel';
  }

  if (LATIN_VOWELS.has(char)) {
    return 'vowel';
  }

  return 'consonant';
}

function prepareLatinCharacters(raw: string): PreparedCharacters {
  const ignored = new Set<string>();
  const cleaned = raw
    .replace(/[-'’–—]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const intermediate: string[] = [];
  const breakdown: BreakdownEntry[] = [];

  for (let index = 0; index < cleaned.length; index += 1) {
    const char = cleaned[index];
    if (char === ' ') {
      intermediate.push(' ');
      continue;
    }

    const normalized = SPECIAL_LATIN.get(char) || char.toUpperCase();
    if (!LATIN_VALUES.has(normalized)) {
      ignored.add(char);
      continue;
    }

    const expanded = expandLatinChar(normalized);
    const previous = index > 0 ? (cleaned[index - 1] || '').toUpperCase() : null;
    const next = index < cleaned.length - 1 ? (cleaned[index + 1] || '').toUpperCase() : null;
    expanded.forEach((letter) => {
      const type = classifyLatinLetter(letter, previous, next);
      breakdown.push({ label: letter, value: LATIN_VALUES.get(letter) ?? 0, type, original: char });
    });
    intermediate.push(normalized);
  }

  return {
    breakdown,
    ignored: Array.from(ignored),
    normalized: intermediate.join('').replace(/\s+/g, ' ').trim(),
    script: 'latin',
  };
}

function prepareRTLCharacters(raw: string): PreparedCharacters {
  const ignored = new Set<string>();
  const normalized = raw
    .replace(/ﻻ/g, 'لا')
    .replace(ARABIC_DIACRITICS, '')
    .replace(RTL_CONTROL, '')
    .replace(/\s+/g, ' ')
    .trim();

  const breakdown: BreakdownEntry[] = [];
  for (const char of normalized) {
    if (char === ' ') {
      continue;
    }
    if (ABJAD_VALUES.has(char)) {
      breakdown.push({
        label: char,
        original: char,
        value: ABJAD_VALUES.get(char) ?? 0,
        type: 'letter',
      });
    } else {
      ignored.add(char);
    }
  }

  return {
    breakdown,
    ignored: Array.from(ignored),
    normalized,
    script: 'rtl',
  };
}

interface BreakdownOptions {
  mode?: 'all' | 'vowel' | 'consonant';
  script?: ScriptType;
}

function breakdownName(raw: string, options: BreakdownOptions = {}): NameBreakdown {
  const targetScript: ScriptType = options.script || detectScriptInternal(raw);
  const mode = options.mode || 'all';
  const prepared = targetScript === 'rtl'
    ? prepareRTLCharacters(raw)
    : prepareLatinCharacters(raw);

  const filtered = prepared.breakdown.filter((entry) => {
    if (prepared.script === 'rtl') return true;
    if (mode === 'vowel') {
      return entry.type === 'vowel';
    }
    if (mode === 'consonant') {
      return entry.type === 'consonant';
    }
    return true;
  });

  const total = filtered.reduce((sum, item) => sum + item.value, 0);
  const reduction = reduceNumber(total);

  return {
    breakdown: filtered,
    total,
    number: reduction.value,
    steps: reduction.steps,
    ignored: prepared.ignored,
    normalized: prepared.normalized,
    script: prepared.script,
  };
}

function digitsOf(value: number | string): number[] {
  return value
    .toString()
    .replace(/[^0-9]/g, '')
    .split('')
    .map(Number)
    .filter(Number.isFinite);
}

function julianDayToGregorian(jd: number): { year: number; month: number; day: number } {
  let j = jd + 32044;
  const g = Math.floor(j / 146097);
  const dg = j % 146097;
  const c = Math.floor(((dg / 36524) + 1) * 3 / 4);
  const dc = dg - c * 36524;
  const b = Math.floor(dc / 1461);
  const db = dc % 1461;
  const a = Math.floor(((db / 365) + 1) * 3 / 4);
  const da = db - a * 365;
  const y = g * 400 + c * 100 + b * 4 + a;
  const m = Math.floor((da * 5 + 308) / 153) - 2;
  const d = da - Math.floor((m + 4) * 153 / 5) + 122;
  const year = y - 4800 + Math.floor((m + 2) / 12);
  const month = ((m + 2) % 12) + 1;
  const day = d + 1;
  return { year, month, day };
}

function gregorianToJulianDay(year: number, month: number, day: number): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return day + Math.floor((153 * m + 2) / 5)
    + 365 * y + Math.floor(y / 4) - Math.floor(y / 100)
    + Math.floor(y / 400) - 32045;
}

function hijriToJulianDay(year: number, month: number, day: number): number {
  return day
    + Math.ceil(29.5 * (month - 1))
    + (year - 1) * 354
    + Math.floor((3 + 11 * year) / 30)
    + 1948440 - 385;
}

function solarHijriToJulianDay(year: number, month: number, day: number): number {
  const epBase = year - (year >= 0 ? 474 : 473);
  const epYear = 474 + (epBase % 2820);
  return day
    + (month <= 7 ? (month - 1) * 31 : (month - 1) * 30 + 6)
    + Math.floor((epYear * 682 - 110) / 2816)
    + (epYear - 1) * 365
    + Math.floor(epBase / 2820) * 1029983
    + 1948320.5 - 1;
}

function convertToGregorian(calendar: CalendarType, year: number, month: number, day: number): { year: number; month: number; day: number } {
  if (calendar === 'gregorian') {
    return { year, month, day };
  }
  if (calendar === 'solarHijri') {
    const jd = solarHijriToJulianDay(year, month, day);
    return julianDayToGregorian(Math.floor(jd));
  }
  if (calendar === 'hijri') {
    const jd = hijriToJulianDay(year, month, day);
    return julianDayToGregorian(jd);
  }
  throw new Error('Unsupported calendar');
}

function componentDigits(value: number): number[] {
  return value
    .toString()
    .split('')
    .map(Number)
    .filter(Number.isFinite);
}

function destinyNumber({ calendar = 'gregorian', year, month, day }: BirthDetails): ReductionWithDigits {
  const gregorian = convertToGregorian(calendar, year, month, day);
  const components = [gregorian.year, gregorian.month, gregorian.day];
  const digits = components.flatMap(componentDigits);
  const total = digits.reduce((sum, digit) => sum + digit, 0);
  const reduction = reduceNumber(total);
  return {
    calendarUsed: gregorian,
    digits,
    total,
    number: reduction.value,
    steps: reduction.steps,
  };
}

function birthdayNumber({ calendar = 'gregorian', year, month, day }: BirthDetails): ReductionWithDigits {
  const gregorian = convertToGregorian(calendar, year, month, day);
  const digits = componentDigits(gregorian.day);
  const total = digits.reduce((sum, digit) => sum + digit, 0);
  const reduction = reduceNumber(total);
  return {
    calendarUsed: gregorian,
    digits,
    total,
    number: reduction.value,
    steps: reduction.steps,
  };
}

function personalYearNumber({ calendar = 'gregorian', year, month, day }: BirthDetails, targetYear: number): ReductionWithDigits {
  const gregorian = convertToGregorian(calendar, year, month, day);
  const digits = [gregorian.month, gregorian.day, targetYear]
    .flatMap(componentDigits);
  const total = digits.reduce((sum, digit) => sum + digit, 0);
  const reduction = reduceNumber(total);
  return {
    calendarUsed: gregorian,
    digits,
    total,
    number: reduction.value,
    steps: reduction.steps,
  };
}

function maturityNumber(nameNumberValue: number, destinyNumberValue: number): MaturityResult {
  const combined = nameNumberValue + destinyNumberValue;
  const reduction = reduceNumber(combined);
  return {
    number: reduction.value,
    combined,
    steps: reduction.steps,
  };
}

function cornerstone(name: string): CornerstoneResult | null {
  if (!name || !name.trim()) return null;
  const prepared = prepareLatinCharacters(name);
  const firstLetter = prepared.breakdown.find((entry) => entry.type !== undefined);
  if (!firstLetter) return null;
  const reduction = reduceNumber(firstLetter.value);
  return {
    letter: firstLetter.label,
    value: firstLetter.value,
    number: reduction.value,
  };
}

function balanceNumber(name: string): BalanceResult | null {
  const prepared = prepareLatinCharacters(name);
  const letters = prepared.breakdown
    .filter((entry) => entry.type === 'consonant')
    .slice(0, 4)
    .map((entry) => ({ letter: entry.label, value: entry.value }));
  if (!letters.length) {
    return null;
  }
  const total = letters.reduce((sum, entry) => sum + entry.value, 0);
  const reduction = reduceNumber(total);
  return {
    letters,
    total,
    number: reduction.value,
    steps: reduction.steps,
  };
}

function bridgeNumber(primary: number, secondary: number): BridgeResult | null {
  if (!Number.isFinite(primary) || !Number.isFinite(secondary)) return null;
  const difference = Math.abs(primary - secondary);
  const reduction = reduceNumber(difference);
  return {
    difference,
    number: reduction.value,
    steps: reduction.steps,
  };
}

function addressNumber(raw: string): AddressResult {
  if (!raw || !raw.trim()) return null;
  const digits = (raw.match(/\d/g) || []).map(Number);
  if (digits.length) {
    const total = digits.reduce((sum, digit) => sum + digit, 0);
    const reduction = reduceNumber(total);
    return {
      mode: 'digits',
      digits,
      total,
      number: reduction.value,
      steps: reduction.steps,
    };
  }

  const prepared = detectScriptInternal(raw) === 'rtl'
    ? prepareRTLCharacters(raw)
    : prepareLatinCharacters(raw);
  const values = prepared.breakdown.map((entry) => entry.value);
  if (!values.length) return null;
  const total = values.reduce((sum, value) => sum + value, 0);
  const reduction = reduceNumber(total);
  return {
    mode: 'letters',
    breakdown: prepared.breakdown,
    total,
    number: reduction.value,
    steps: reduction.steps,
  };
}

function luckyNumber({ calendar = 'gregorian', year, month, day }: BirthDetails): ReductionResult {
  const gregorian = convertToGregorian(calendar, year, month, day);
  const total = gregorian.month + gregorian.day;
  return reduceNumber(total);
}

function healthProfileMetrics(nameNumberValue: number, personalYearValue: number, birthdayValue: number): HealthProfileResult | null {
  const components = [nameNumberValue, personalYearValue, birthdayValue]
    .filter((value) => Number.isFinite(value));
  if (!components.length) return null;
  const total = components.reduce((sum, value) => sum + value, 0);
  const reduction = reduceNumber(total);
  return {
    components,
    total,
    number: reduction.value,
    steps: reduction.steps,
  };
}

function personalYearSeries(birthData: BirthDetails, startYear: number, length = 9): SeriesEntry[] {
  const series: SeriesEntry[] = [];
  for (let offset = 0; offset < length; offset += 1) {
    const year = startYear + offset;
    const result = personalYearNumber(birthData, year);
    series.push({ year, result });
  }
  return series;
}

function personalMonthMatrix(birthData: BirthDetails, startYear: number, years = 9, months = 9): PersonalMonthRow[] {
  const rows: PersonalMonthRow[] = [];
  const series = personalYearSeries(birthData, startYear, years);
  series.forEach(({ year, result }) => {
    const row: PersonalMonthRow = { year, months: [] };
    for (let month = 1; month <= months; month += 1) {
      const reduction = reduceNumber(result.number + month);
      row.months.push({ month, number: reduction.value, steps: reduction.steps });
    }
    rows.push(row);
  });
  return rows;
}

function transitNumbers(nameNumberValue: number, vowelNumberValue: number, consonantNumberValue: number, personalYearValue: number): TransitSet {
  const basePersonalYear = Number.isFinite(personalYearValue) ? personalYearValue : 0;
  const physicalBase = Number.isFinite(consonantNumberValue) ? consonantNumberValue : 0;
  const mentalBase = Number.isFinite(vowelNumberValue) ? vowelNumberValue : 0;
  const spiritualBase = Number.isFinite(nameNumberValue) ? nameNumberValue : 0;

  const physical = reduceNumber(physicalBase + basePersonalYear);
  const mental = reduceNumber(mentalBase + basePersonalYear);
  const spiritual = reduceNumber(spiritualBase + basePersonalYear);

  return {
    physical: { base: physicalBase, number: physical.value, steps: physical.steps },
    mental: { base: mentalBase, number: mental.value, steps: mental.steps },
    spiritual: { base: spiritualBase, number: spiritual.value, steps: spiritual.steps },
  };
}

function essenceCycle(breakdown: NameBreakdown, startYear: number, length = 13): EssenceEntry[] {
  if (!breakdown || !breakdown.breakdown || !breakdown.breakdown.length) return [];
  const values = breakdown.breakdown.map((entry) => entry.value);
  const cycle: EssenceEntry[] = [];
  for (let offset = 0; offset < length; offset += 1) {
    const primary = values[offset % values.length];
    const secondary = values[(offset + 1) % values.length];
    const tertiary = values[(offset + 2) % values.length];
    const total = primary + secondary + tertiary;
    const reduction = reduceNumber(total);
    cycle.push({
      year: startYear + offset,
      total,
      number: reduction.value,
      steps: reduction.steps,
    });
  }
  return cycle;
}

function reduceComponent(value: number): number {
  return reduceNumber(value).value;
}

function reduceComponentWithSteps(value: number): ReductionResult {
  const reduction = reduceNumber(value);
  return { value: reduction.value, steps: reduction.steps };
}

function pinnacleCycles({ calendar = 'gregorian', year, month, day }: BirthDetails): CycleEntry[] {
  const gregorian = convertToGregorian(calendar, year, month, day);
  const monthCore = reduceComponent(gregorian.month);
  const dayCore = reduceComponent(gregorian.day);
  const yearCore = reduceComponent(gregorian.year);

  const first = reduceComponentWithSteps(monthCore + dayCore);
  const second = reduceComponentWithSteps(dayCore + yearCore);
  const third = reduceComponentWithSteps(first.value + second.value);
  const fourth = reduceComponentWithSteps(monthCore + yearCore);

  return [
    { stage: 1, startAge: 0, endAge: 35, number: first.value, steps: first.steps },
    { stage: 2, startAge: 36, endAge: 44, number: second.value, steps: second.steps },
    { stage: 3, startAge: 45, endAge: 53, number: third.value, steps: third.steps },
    { stage: 4, startAge: 54, endAge: null, number: fourth.value, steps: fourth.steps },
  ];
}

function lifeCycles({ calendar = 'gregorian', year, month, day }: BirthDetails): CycleEntry[] {
  const gregorian = convertToGregorian(calendar, year, month, day);
  const first = reduceComponentWithSteps(gregorian.month);
  const second = reduceComponentWithSteps(gregorian.day);
  const third = reduceComponentWithSteps(gregorian.year);
  return [
    { stage: 1, startAge: 0, endAge: 27, number: first.value, steps: first.steps },
    { stage: 2, startAge: 28, endAge: 54, number: second.value, steps: second.steps },
    { stage: 3, startAge: 55, endAge: null, number: third.value, steps: third.steps },
  ];
}

function challengeNumbers({ calendar = 'gregorian', year, month, day }: BirthDetails): ChallengeEntry[] {
  const gregorian = convertToGregorian(calendar, year, month, day);
  const monthCore = reduceComponent(gregorian.month);
  const dayCore = reduceComponent(gregorian.day);
  const yearCore = reduceComponent(gregorian.year);

  const first = reduceComponentWithSteps(Math.abs(monthCore - dayCore));
  const second = reduceComponentWithSteps(Math.abs(dayCore - yearCore));
  const third = reduceComponentWithSteps(Math.abs(first.value - second.value));
  const fourth = reduceComponentWithSteps(Math.abs(monthCore - yearCore));

  return [
    { stage: 1, startAge: 0, endAge: 35, number: first.value, steps: first.steps },
    { stage: 2, startAge: 36, endAge: 44, number: second.value, steps: second.steps },
    { stage: 3, startAge: 45, endAge: 53, number: third.value, steps: third.steps },
    { stage: 4, startAge: 54, endAge: null, number: fourth.value, steps: fourth.steps },
  ];
}

function telephoneNumber(raw: string): TelephoneResult | null {
  if (!raw || !raw.trim()) return null;
  const digits = (raw.match(/\d/g) || []).map(Number);
  if (!digits.length) return null;
  const total = digits.reduce((sum, digit) => sum + digit, 0);
  const reduction = reduceNumber(total);
  return {
    digits,
    total,
    number: reduction.value,
    steps: reduction.steps,
  };
}

function inferLanguageFromName(name: string): 'en' | 'no' | 'fa' {
  if (detectScriptInternal(name) === 'rtl') {
    return 'fa';
  }
  if (/[ÆØÅæøå]/.test(name)) {
    return 'no';
  }
  return 'en';
}

@Injectable({
  providedIn: 'root',
})
export class NumerologyService {
  detectScript(input: string): ScriptType {
    return detectScriptInternal(input);
  }

  breakdownName(raw: string, options: BreakdownOptions = {}): NameBreakdown {
    return breakdownName(raw, options);
  }

  reduceNumber(value: number): ReductionResult {
    return reduceNumber(value);
  }

  destinyNumber(details: BirthDetails): ReductionWithDigits {
    return destinyNumber(details);
  }

  birthdayNumber(details: BirthDetails): ReductionWithDigits {
    return birthdayNumber(details);
  }

  personalYearNumber(details: BirthDetails, targetYear: number): ReductionWithDigits {
    return personalYearNumber(details, targetYear);
  }

  maturityNumber(nameNumberValue: number, destinyNumberValue: number): MaturityResult {
    return maturityNumber(nameNumberValue, destinyNumberValue);
  }

  cornerstone(name: string): CornerstoneResult | null {
    return cornerstone(name);
  }

  balanceNumber(name: string): BalanceResult | null {
    return balanceNumber(name);
  }

  bridgeNumber(primary: number, secondary: number): BridgeResult | null {
    return bridgeNumber(primary, secondary);
  }

  addressNumber(raw: string): AddressResult {
    return addressNumber(raw);
  }

  luckyNumber(details: BirthDetails): ReductionResult {
    return luckyNumber(details);
  }

  healthProfileMetrics(nameNumberValue: number, personalYearValue: number, birthdayValue: number): HealthProfileResult | null {
    return healthProfileMetrics(nameNumberValue, personalYearValue, birthdayValue);
  }

  personalYearSeries(details: BirthDetails, startYear: number, length = 9): SeriesEntry[] {
    return personalYearSeries(details, startYear, length);
  }

  personalMonthMatrix(details: BirthDetails, startYear: number, years = 9, months = 9): PersonalMonthRow[] {
    return personalMonthMatrix(details, startYear, years, months);
  }

  transitNumbers(nameNumberValue: number, vowelNumberValue: number, consonantNumberValue: number, personalYearValue: number): TransitSet {
    return transitNumbers(nameNumberValue, vowelNumberValue, consonantNumberValue, personalYearValue);
  }

  essenceCycle(breakdown: NameBreakdown, startYear: number, length = 13): EssenceEntry[] {
    return essenceCycle(breakdown, startYear, length);
  }

  pinnacleCycles(details: BirthDetails): CycleEntry[] {
    return pinnacleCycles(details);
  }

  lifeCycles(details: BirthDetails): CycleEntry[] {
    return lifeCycles(details);
  }

  challengeNumbers(details: BirthDetails): ChallengeEntry[] {
    return challengeNumbers(details);
  }

  telephoneNumber(raw: string): TelephoneResult | null {
    return telephoneNumber(raw);
  }

  convertToGregorian(calendar: CalendarType, year: number, month: number, day: number): { year: number; month: number; day: number } {
    return convertToGregorian(calendar, year, month, day);
  }

  inferLanguageFromName(name: string): 'en' | 'no' | 'fa' {
    return inferLanguageFromName(name);
  }
}
