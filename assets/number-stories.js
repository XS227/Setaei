(function () {
  const STORIES = {
    en: {
      1: '1 sparks initiative, courage and pioneering leadership.',
      2: '2 balances relationships with empathy, diplomacy and grace.',
      3: '3 radiates creativity, story and joyful expression.',
      4: '4 builds structure, discipline and dependable foundations.',
      5: '5 thrives on freedom, movement and adventurous change.',
      6: '6 nurtures communities through care, harmony and artistry.',
      7: '7 seeks wisdom, spiritual insight and reflective analysis.',
      8: '8 manifests ambition, stewardship and material mastery.',
      9: '9 heals with compassion, humanitarian vision and closure.',
      11: '11 channels luminous intuition and inspired guidance.',
      22: '22 turns visionary architecture into lasting realities.',
      33: '33 uplifts collectives with unconditional love and service.',
    },
    no: {
      1: '1 tenner initiativ, mot og banebrytende lederskap.',
      2: '2 balanserer relasjoner med empati, diplomati og ro.',
      3: '3 stråler kreativitet, fortelling og livsglede.',
      4: '4 bygger struktur, disiplin og trygge fundament.',
      5: '5 lever av frihet, bevegelse og eventyrlig endring.',
      6: '6 verner fellesskap gjennom omsorg, harmoni og kunstnerånd.',
      7: '7 søker visdom, åndelig innsikt og reflektert analyse.',
      8: '8 manifesterer ambisjon, forvaltning og materiell mestring.',
      9: '9 leger med medfølelse, humanitært blikk og avslutning.',
      11: '11 formidler lysende intuisjon og inspirert veiledning.',
      22: '22 gjør visjonære ideer om til varige byggverk.',
      33: '33 løfter fellesskapet med ubetinget kjærlighet og tjeneste.',
    },
    fa: {
      1: '۱ آغازگر جسارت، ابتکار و رهبری پیشگام است.',
      2: '۲ روابط را با همدلی، دیپلماسی و آرامش متعادل می‌کند.',
      3: '۳ خلاقیت، روایتگری و شادی بیان را می‌تاباند.',
      4: '۴ ساختار، نظم و پایه‌های قابل اعتماد می‌سازد.',
      5: '۵ با آزادی، حرکت و دگرگونی ماجراجویانه زنده است.',
      6: '۶ با مراقبت، هماهنگی و هنر از جمع حمایت می‌کند.',
      7: '۷ در پی حکمت، بینش معنوی و تحلیل درون‌نگر است.',
      8: '۸ جاه‌طلبی، مدیریت و مهارت مادی را محقق می‌کند.',
      9: '۹ با شفقت، دید انسان‌دوستانه و رهایی التیام می‌بخشد.',
      11: '۱۱ الهام و شهود درخشان را جاری می‌سازد.',
      22: '۲۲ طرح‌های آرمان‌گرایانه را به واقعیت‌های پایدار تبدیل می‌کند.',
      33: '۳۳ با عشق بی‌قید و خدمت جمعی را بالا می‌برد.',
    },
  };

  window.NumberStories = {
    get(lang, number) {
      const locale = STORIES[lang] || STORIES.en;
      return locale[number] || '';
    },
    stories: STORIES,
  };
})();
