(function () {
  const MASTER_NUMBERS = new Set([11, 22, 33]);

  const LATIN_VALUES = new Map([
    ['A', 1], ['B', 2], ['C', 3], ['D', 4], ['E', 5], ['F', 6], ['G', 7], ['H', 8], ['I', 9],
    ['J', 1], ['K', 2], ['L', 3], ['M', 4], ['N', 5], ['O', 6], ['P', 7], ['Q', 8], ['R', 9],
    ['S', 1], ['T', 2], ['U', 3], ['V', 4], ['W', 5], ['X', 6], ['Y', 7], ['Z', 8]
  ]);

  const ABJAD_VALUES = new Map([
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
    ['غ', 1000]
  ]);

  const LATIN_VOWELS = new Set(['A', 'E', 'I', 'O', 'U', 'Æ', 'Ø', 'Å']);

  const SPECIAL_LATIN = new Map([
    ['Æ', 'Æ'], ['æ', 'Æ'],
    ['Ø', 'Ø'], ['ø', 'Ø'],
    ['Å', 'Å'], ['å', 'Å']
  ]);

  const Y_EXCEPTIONS = new Set(['AY', 'EY', 'IY', 'OY', 'UY', 'YA', 'YE', 'YI', 'YO', 'YU', 'YÅ', 'YÆ']);

  const ARABIC_DIACRITICS = /[\u064B-\u065F\u0670\u06D6-\u06ED]/g;
  const RTL_CONTROL = /[\u200C\u200F\u200E]/g;

  function detectScript(input) {
    if (/[\u0600-\u06FF]/.test(input)) {
      return 'rtl';
    }
    return 'latin';
  }

  function expandLatinChar(char) {
    if (char === 'Æ') return ['A', 'E'];
    if (char === 'Ø') return ['O', 'E'];
    if (char === 'Å') return ['A', 'A'];
    return [char];
  }

  function reduceNumber(value) {
    const steps = [];
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

  function classifyLatinLetter(char, prev, next) {
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

  function prepareLatinCharacters(raw) {
    const ignored = new Set();
    const cleaned = raw
      .replace(/[-'’–—]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const intermediate = [];
    for (const char of cleaned) {
      if (char === ' ') {
        intermediate.push(' ');
        continue;
      }
      if (SPECIAL_LATIN.has(char)) {
        intermediate.push(SPECIAL_LATIN.get(char));
        continue;
      }
      const stripped = char.normalize('NFD').replace(/\p{Diacritic}/gu, '').toUpperCase();
      if (/^[A-Z]$/.test(stripped)) {
        intermediate.push(stripped);
      } else {
        ignored.add(char);
      }
    }

    const pureLetters = intermediate.filter((ch) => ch !== ' ');
    const breakdown = [];
    let letterIndex = -1;

    for (const char of intermediate) {
      if (char === ' ') {
        continue;
      }
      letterIndex += 1;
      const prev = pureLetters[letterIndex - 1];
      const next = pureLetters[letterIndex + 1];
      const type = classifyLatinLetter(char, prev, next);
      const expansions = expandLatinChar(char);
      expansions.forEach((expansion) => {
        if (LATIN_VALUES.has(expansion)) {
          breakdown.push({
            label: expansion,
            original: char,
            value: LATIN_VALUES.get(expansion),
            type,
          });
        } else {
          ignored.add(char);
        }
      });
    }

    return {
      breakdown,
      ignored: Array.from(ignored),
      normalized: intermediate.join('').replace(/\s+/g, ' ').trim(),
      script: 'latin',
    };
  }

  function prepareRTLCharacters(raw) {
    const ignored = new Set();
    const normalized = raw
      .replace(/ﻻ/g, 'لا')
      .replace(ARABIC_DIACRITICS, '')
      .replace(RTL_CONTROL, '')
      .replace(/\s+/g, ' ')
      .trim();

    const breakdown = [];
    for (const char of normalized) {
      if (char === ' ') {
        continue;
      }
      if (ABJAD_VALUES.has(char)) {
        breakdown.push({
          label: char,
          original: char,
          value: ABJAD_VALUES.get(char),
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

  function breakdownName(raw, options = {}) {
    const targetScript = options.script || detectScript(raw);
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

  function digitsOf(value) {
    return value
      .toString()
      .replace(/[^0-9]/g, '')
      .split('')
      .map(Number)
      .filter(Number.isFinite);
  }

  function julianDayToGregorian(jd) {
    let j = jd + 32044;
    const g = Math.floor(j / 146097);
    const dg = j % 146097;
    const c = Math.floor((dg / 36524 + 1) * 3 / 4);
    const dc = dg - c * 36524;
    const b = Math.floor(dc / 1461);
    const db = dc % 1461;
    const a = Math.floor((db / 365 + 1) * 3 / 4);
    const da = db - a * 365;
    const y = g * 400 + c * 100 + b * 4 + a;
    const m = Math.floor((da * 5 + 308) / 153) - 2;
    const d = da - Math.floor((m + 4) * 153 / 5) + 122;
    const year = y - 4800 + Math.floor((m + 2) / 12);
    const month = ((m + 2) % 12) + 1;
    const day = d + 1;
    return { year, month, day };
  }

  function persianToJulianDay(year, month, day) {
    const epBase = year - (year >= 0 ? 474 : 473);
    const epYear = 474 + (epBase % 2820);
    return day
      + (month <= 7 ? (month - 1) * 31 : (month - 1) * 30 + 6)
      + Math.floor((epYear * 682 - 110) / 2816)
      + (epYear - 1) * 365
      + Math.floor(epBase / 2820) * 1029983
      + (1948320 - 1);
  }

  function hijriToJulianDay(year, month, day) {
    return day
      + Math.ceil(29.5 * (month - 1))
      + (year - 1) * 354
      + Math.floor((3 + 11 * year) / 30)
      + 1948439 - 1;
  }

  function validateGregorian(year, month, day) {
    const date = new Date(Date.UTC(year, month - 1, day));
    return date.getUTCFullYear() === year
      && date.getUTCMonth() === month - 1
      && date.getUTCDate() === day;
  }

  function convertToGregorian(calendar, year, month, day) {
    if (calendar === 'gregorian' || !calendar) {
      if (!validateGregorian(year, month, day)) {
        throw new Error('Invalid Gregorian date');
      }
      return { year, month, day };
    }
    if (calendar === 'solarHijri') {
      const jd = persianToJulianDay(year, month, day);
      return julianDayToGregorian(jd);
    }
    if (calendar === 'hijri') {
      const jd = hijriToJulianDay(year, month, day);
      return julianDayToGregorian(jd);
    }
    throw new Error('Unsupported calendar');
  }

  function componentDigits(number) {
    return number
      .toString()
      .split('')
      .map(Number)
      .filter((n) => Number.isFinite(n));
  }

  function buildReduction(value) {
    const { value: number, steps } = reduceNumber(value);
    return { number, steps };
  }

  function destinyNumber({ calendar = 'gregorian', year, month, day }) {
    const gregorian = convertToGregorian(calendar, year, month, day);
    const components = [gregorian.year, gregorian.month, gregorian.day];
    const digits = components.flatMap(componentDigits);
    const total = digits.reduce((sum, digit) => sum + digit, 0);
    const reduction = reduceNumber(total);
    return {
      calendarUsed: gregorian,
      components,
      digits,
      total,
      number: reduction.value,
      steps: reduction.steps,
    };
  }

  function birthdayNumber({ calendar = 'gregorian', year, month, day }) {
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

  function personalYearNumber({ calendar = 'gregorian', year, month, day }, targetYear) {
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

  function maturityNumber(nameNumber, destinyNumberValue) {
    const combined = nameNumber + destinyNumberValue;
    const reduction = reduceNumber(combined);
    return {
      combined,
      number: reduction.value,
      steps: reduction.steps,
    };
  }

  function inferLanguageFromName(name) {
    if (detectScript(name) === 'rtl') {
      return 'fa';
    }
    if (/[ÆØÅæøå]/.test(name)) {
      return 'no';
    }
    return 'en';
  }

  window.Numerology = {
    detectScript,
    breakdownName,
    reduceNumber,
    destinyNumber,
    birthdayNumber,
    personalYearNumber,
    maturityNumber,
    convertToGregorian,
    inferLanguageFromName,
  };
})();
