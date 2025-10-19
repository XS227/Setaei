<?php
declare(strict_types=1);

mb_internal_encoding('UTF-8');

function loadEnv(string $path): array
{
    if (!is_readable($path)) {
        return [];
    }

    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) ?: [];
    $values = [];
    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === '' || str_starts_with($line, '#')) {
            continue;
        }
        if (!str_contains($line, '=')) {
            continue;
        }
        [$key, $value] = array_map('trim', explode('=', $line, 2));
        $value = trim($value, "\"' ");
        $values[$key] = $value;
    }

    return $values;
}

$env = loadEnv(__DIR__ . '/.env');
$apiKey = getenv('GOOGLE_PLACES_API_KEY') ?: ($env['GOOGLE_PLACES_API_KEY'] ?? null);
$placeId = getenv('GOOGLE_PLACE_ID') ?: ($env['GOOGLE_PLACE_ID'] ?? null);
$contactRecipient = getenv('ALANZA_CONTACT_EMAIL') ?: ($env['ALANZA_CONTACT_EMAIL'] ?? null);

$placeData = null;
$placeError = null;
$cacheLifetime = 60 * 60 * 12; // 12 hours

if ($apiKey && $placeId) {
    $cacheKey = substr(hash('sha256', $placeId), 0, 16);
    $cacheFile = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'alanza_place_' . $cacheKey . '.json';
    $shouldRefresh = true;

    if (is_readable($cacheFile)) {
        $age = time() - (int) filemtime($cacheFile);
        if ($age < $cacheLifetime) {
            $content = file_get_contents($cacheFile) ?: '';
            if ($content !== '') {
                $decoded = json_decode($content, true);
                if (is_array($decoded)) {
                    $placeData = $decoded;
                    $shouldRefresh = false;
                }
            }
        }
    }

    if ($shouldRefresh) {
        $endpoint = 'https://maps.googleapis.com/maps/api/place/details/json';
        $fields = [
            'name',
            'rating',
            'user_ratings_total',
            'formatted_address',
            'formatted_phone_number',
            'international_phone_number',
            'website',
            'opening_hours',
            'photos',
            'reviews',
            'geometry/location'
        ];
        $query = http_build_query([
            'place_id' => $placeId,
            'fields' => implode(',', $fields),
            'key' => $apiKey,
            'language' => 'fa'
        ], '', '&', PHP_QUERY_RFC3986);
        $url = $endpoint . '?' . $query;

        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 10,
            CURLOPT_FAILONERROR => false,
        ]);
        $response = curl_exec($ch);
        curl_close($ch);

        if ($response === false) {
            $placeError = 'دریافت اطلاعات از گوگل امکان‌پذیر نبود. لطفاً بعداً تلاش کنید.';
        } else {
            $decoded = json_decode($response, true);
            if (($decoded['status'] ?? '') === 'OK') {
                $placeData = $decoded['result'] ?? null;
                file_put_contents($cacheFile, json_encode($placeData, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
            } else {
                $placeError = $decoded['error_message'] ?? 'پاسخ نامعتبر از سرویس گوگل دریافت شد.';
            }
        }
    }
}

$reviews = [];
if (isset($placeData['reviews']) && is_array($placeData['reviews'])) {
    foreach (array_slice($placeData['reviews'], 0, 3) as $review) {
        $reviews[] = [
            'author' => $review['author_name'] ?? 'کاربر گوگل',
            'rating' => $review['rating'] ?? null,
            'text' => $review['text'] ?? '',
            'relative_time' => $review['relative_time_description'] ?? '',
        ];
    }
}

if (empty($reviews)) {
    $reviews = [
        [
            'author' => 'سمیرا. ک',
            'rating' => 5,
            'text' => 'دکتر الَنزا بسیار دقیق و حرفه‌ای کار می‌کند. تجربه ایمپلنت من بدون کوچک‌ترین درد و با نتیجه فوق‌العاده همراه بود.',
            'relative_time' => '۲ ماه پیش',
        ],
        [
            'author' => 'مهدی. س',
            'rating' => 5,
            'text' => 'محیط کلینیک خیلی آرامش‌بخش است و پرسنل برخورد بسیار محترمانه‌ای دارند. برای سفید کردن دندان‌ مراجعه کردم و نتیجه عالی بود.',
            'relative_time' => '۴ ماه پیش',
        ],
        [
            'author' => 'زهرا. الف',
            'rating' => 4.5,
            'text' => 'تشخیص دقیق و توضیحات کامل درباره روند درمان باعث شد با خیال راحت درمان ارتودنسی را شروع کنم.',
            'relative_time' => '۶ ماه پیش',
        ],
    ];
}

$galleryImages = [];
if (isset($placeData['photos']) && is_array($placeData['photos'])) {
    foreach (array_slice($placeData['photos'], 0, 6) as $photo) {
        if (!empty($photo['photo_reference'])) {
            $galleryImages[] = sprintf(
                'https://maps.googleapis.com/maps/api/place/photo?maxwidth=1200&photo_reference=%s&key=%s',
                urlencode($photo['photo_reference']),
                urlencode($apiKey)
            );
        }
    }
}

if (empty($galleryImages)) {
    $galleryImages = [
        'https://images.unsplash.com/photo-1504904126298-3f4f0c5a9b05?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1588771930296-88c48ec7c6b9?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1520013573795-38516d266c7d?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1528793192287-97b6da0e5e56?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1526256262350-7da7584cf5eb?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1609840114035-3c981b782d3c?auto=format&fit=crop&w=1200&q=80',
    ];
}

$contactSuccess = false;
$contactError = null;
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['contact_form'])) {
    $name = trim($_POST['name'] ?? '');
    $phone = trim($_POST['phone'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $message = trim($_POST['message'] ?? '');

    if ($name === '' || $phone === '' || $message === '') {
        $contactError = 'لطفاً تمام فیلدهای ضروری را تکمیل کنید.';
    } elseif ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $contactError = 'آدرس ایمیل وارد شده معتبر نیست.';
    } elseif ($contactRecipient) {
        $subject = 'پیام جدید از وب‌سایت کلینیک دندانپزشکی الَنزا';
        $body = "نام: {$name}\nتلفن: {$phone}\nایمیل: {$email}\n\nپیام:\n{$message}";
        $headers = 'Content-Type: text/plain; charset=UTF-8';
        $contactSuccess = mail($contactRecipient, $subject, $body, $headers);
        if (!$contactSuccess) {
            $contactError = 'ارسال پیام با خطا مواجه شد. لطفاً بعداً تلاش کنید.';
        }
    } else {
        $contactError = 'پیکربندی ایمیل تکمیل نشده است. لطفاً با کلینیک تماس بگیرید.';
    }
}

$businessName = $placeData['name'] ?? 'کلینیک دندانپزشکی الَنزا';
$rating = $placeData['rating'] ?? 4.9;
$totalRatings = $placeData['user_ratings_total'] ?? 124;
$address = $placeData['formatted_address'] ?? 'تهران، سعادت‌آباد، خیابان سرو غربی، پلاک ۳۵';
$phone = $placeData['international_phone_number'] ?? '+98 21 1234 5678';
$website = $placeData['website'] ?? 'https://example.com';
$mapUrl = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3239.034020179613!2d51.34100231536641!3d35.78024918017143!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3f8e05da4f1b30d9%3A0x5b9bf0b6ea5b0f5!2sTehran!5e0!3m2!1sen!2sir!4v1700000000000!5m2!1sen!2sir';

$structuredData = [
    '@context' => 'https://schema.org',
    '@type' => 'Dentist',
    'name' => $businessName,
    'image' => $galleryImages[0] ?? null,
    'url' => $website,
    'telephone' => $phone,
    'address' => [
        '@type' => 'PostalAddress',
        'streetAddress' => 'خیابان سرو غربی، پلاک ۳۵',
        'addressLocality' => 'تهران',
        'addressRegion' => 'تهران',
        'postalCode' => '1998753456',
        'addressCountry' => 'IR',
    ],
    'aggregateRating' => [
        '@type' => 'AggregateRating',
        'ratingValue' => $rating,
        'reviewCount' => $totalRatings,
    ],
    'openingHoursSpecification' => [
        [
            '@type' => 'OpeningHoursSpecification',
            'dayOfWeek' => ['Monday', 'Tuesday', 'Wednesday', 'Thursday'],
            'opens' => '09:00',
            'closes' => '18:00',
        ],
        [
            '@type' => 'OpeningHoursSpecification',
            'dayOfWeek' => 'Saturday',
            'opens' => '09:00',
            'closes' => '14:00',
        ],
    ],
];
?>
<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>کلینیک دندانپزشکی الَنزا | تخصصی‌ترین خدمات دندانپزشکی در تهران</title>
  <meta name="description" content="کلینیک دندانپزشکی الَنزا ارائه‌دهنده ایمپلنت، ارتودنسی و زیبایی دندان با بهره‌گیری از جدیدترین تکنولوژی‌ها و پزشکان مجرب در تهران." />
  <meta name="keywords" content="کلینیک دندانپزشکی، ایمپلنت دندان، ارتودنسی، دندانپزشکی زیبایی، دکتر الَنزا" />
  <meta property="og:title" content="کلینیک دندانپزشکی الَنزا" />
  <meta property="og:description" content="رزرو آنلاین نوبت و مشاهده نمونه‌کارهای کلینیک دندانپزشکی الَنزا" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://alanza-clinic.example" />
  <meta property="og:image" content="<?= htmlspecialchars($galleryImages[0] ?? '', ENT_QUOTES, 'UTF-8') ?>" />
  <link rel="canonical" href="https://alanza-clinic.example" />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.rtl.min.css" integrity="sha384-zGylLqf+UkOaxCPPhhCmzHket2/rpqsLhS4XAI0czuS1MVNR9rF+edS5JhT1kG2R" crossorigin="anonymous">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css" integrity="sha384-YkS2NodIZ6Tn6PvxI6Bfq5lHppZArYrusS4x+h0/pk3jfbQfVIAtF5NCzlyzS0gw" crossorigin="anonymous">
  <link rel="stylesheet" href="assets/alanza.css">
  <script type="application/ld+json">
<?= json_encode($structuredData, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT) ?>
  </script>
</head>
<body>
  <header class="hero-section py-5" id="top">
    <div class="container py-lg-5 hero-overlay">
      <div class="row align-items-center g-5">
        <div class="col-lg-6">
          <span class="badge bg-light text-dark mb-3 px-3 py-2 fs-6">کلینیک دندانپزشکی تمام‌دیجیتال</span>
          <h1 class="display-5 fw-bold mb-4">زیبایی لبخند شما، تخصص ماست</h1>
          <p class="lead mb-4">در کلینیک دندانپزشکی الَنزا با بهره‌گیری از فناوری‌های نوین تصویربرداری سه‌بعدی، درمان‌های ایمپلنت، ارتودنسی و طراحی لبخند را با دقت میلی‌متری تجربه کنید.</p>
          <div class="d-flex flex-column flex-sm-row gap-3">
            <a class="btn btn-primary btn-lg px-4" href="#contact">درخواست مشاوره رایگان</a>
            <a class="btn btn-outline-light btn-lg px-4" href="https://wa.me/982112345678" target="_blank" rel="noopener">گفتگوی واتساپ</a>
          </div>
          <div class="d-flex flex-wrap gap-3 align-items-center mt-4">
            <span class="rating-chip"><i class="bi bi-star-fill"></i><?= htmlspecialchars(number_format((float) $rating, 1), ENT_QUOTES, 'UTF-8') ?> / ۵</span>
            <small><?= htmlspecialchars($totalRatings, ENT_QUOTES, 'UTF-8') ?> نظر ثبت‌شده در گوگل</small>
          </div>
        </div>
        <div class="col-lg-6 hero-visual text-center">
          <img src="https://images.unsplash.com/photo-1522844990619-4951c40f7eda?auto=format&fit=crop&w=900&q=80" alt="تجهیزات مدرن کلینیک دندانپزشکی الَنزا" class="img-fluid">
        </div>
      </div>
    </div>
  </header>

  <main>
    <section class="py-5" id="services">
      <div class="container">
        <div class="row justify-content-between align-items-center mb-5 g-4">
          <div class="col-lg-7">
            <h2 class="section-heading h1 mb-3">خدمات تخصصی الَنزا</h2>
            <p class="fs-5 text-muted">تیم ما با استفاده از اسکنرهای داخل دهانی، پرینتر سه‌بعدی و مواد پریمیوم، درمان‌هایی دقیق و ماندگار ارائه می‌کند.</p>
          </div>
          <div class="col-lg-4 text-lg-end">
            <a class="btn btn-primary px-4" href="#gallery">مشاهده نمونه‌کارها</a>
          </div>
        </div>
        <div class="row g-4">
          <div class="col-md-6 col-xl-3">
            <article class="service-card p-4 h-100">
              <div class="icon-circle"><i class="bi bi-braces"></i></div>
              <h3 class="h4 mb-3">ارتودنسی دیجیتال</h3>
              <p class="text-muted">حرکت‌دهی دندان‌ها با الاینرهای شفاف و براکت‌های سرامیکی کم‌حجم؛ همراه با تحلیل سه‌بعدی قبل از شروع درمان.</p>
            </article>
          </div>
          <div class="col-md-6 col-xl-3">
            <article class="service-card p-4 h-100">
              <div class="icon-circle"><i class="bi bi-shield-plus"></i></div>
              <h3 class="h4 mb-3">ایمپلنت فوری</h3>
              <p class="text-muted">پیوند استخوان و کاشت ایمپلنت در یک جلسه با راهنمای دیجیتال، مناسب افرادی که به دنبال درمان سریع و ماندگار هستند.</p>
            </article>
          </div>
          <div class="col-md-6 col-xl-3">
            <article class="service-card p-4 h-100">
              <div class="icon-circle"><i class="bi bi-brightness-alt-high"></i></div>
              <h3 class="h4 mb-3">لمینیت و طراحی لبخند</h3>
              <p class="text-muted">طراحی دیجیتال لبخند بر اساس تناسب چهره شما و ساخت لمینیت‌های نانو به صورت اختصاصی برای هر دندان.</p>
            </article>
          </div>
          <div class="col-md-6 col-xl-3">
            <article class="service-card p-4 h-100">
              <div class="icon-circle"><i class="bi bi-heart-pulse"></i></div>
              <h3 class="h4 mb-3">دندانپزشکی کودکان</h3>
              <p class="text-muted">فضایی دوستانه با استفاده از تکنیک‌های رفتاردرمانی، فلورایدتراپی و فیشورسیلانت برای محافظت دندان‌های کودکان.</p>
            </article>
          </div>
        </div>
      </div>
    </section>

    <section class="py-5 bg-white" id="about">
      <div class="container">
        <div class="row g-5 align-items-center">
          <div class="col-lg-6">
            <img class="img-fluid rounded-4 shadow-lg" src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=900&q=80" alt="دکتر الَنزا در حال معاینه بیمار">
          </div>
          <div class="col-lg-6">
            <h2 class="section-heading h1 mb-4">درباره دکتر الَنزا</h2>
            <p class="fs-5 text-muted mb-4">دکتر سارا الَنزا، متخصص پروتزهای دندانی و عضو انجمن دندانپزشکان آمریکا (ADA) است. ایشان با بیش از ۱۵ سال تجربه، صدها طرح لبخند موفق را برای بیماران داخل و خارج از کشور اجرا کرده‌اند.</p>
            <ul class="list-unstyled fs-5 text-muted d-grid gap-3">
              <li><i class="bi bi-check-circle-fill text-primary ms-2"></i>دارای مدرک فلوشیپ ایمپلنتولوژی دیجیتال از دانشگاه UCLA</li>
              <li><i class="bi bi-check-circle-fill text-primary ms-2"></i>عضو فعال آکادمی دندانپزشکی زیبایی اروپا (EAED)</li>
              <li><i class="bi bi-check-circle-fill text-primary ms-2"></i>سخنران منتخب همایش طراحی لبخند ۲۰۲۳ برلین</li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <section class="py-5" id="gallery">
      <div class="container">
        <div class="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center mb-4 gap-3">
          <h2 class="section-heading h1 mb-0">گالری نتایج درمان</h2>
          <p class="text-muted mb-0">نمونه‌هایی از طراحی لبخند و درمان‌های زیبایی بیماران کلینیک الَنزا</p>
        </div>
        <div class="row g-3">
<?php foreach ($galleryImages as $image): ?>
          <div class="col-6 col-lg-4">
            <div class="gallery-card overflow-hidden">
              <img src="<?= htmlspecialchars($image, ENT_QUOTES, 'UTF-8') ?>" alt="نمونه کار دندانپزشکی الَنزا" loading="lazy">
            </div>
          </div>
<?php endforeach; ?>
        </div>
        <?php if ($placeError): ?>
        <div class="alert alert-warning mt-4" role="alert">
          <?= htmlspecialchars($placeError, ENT_QUOTES, 'UTF-8') ?>
        </div>
        <?php endif; ?>
      </div>
    </section>

    <section class="py-5 bg-white" id="testimonials">
      <div class="container">
        <div class="row align-items-center mb-4">
          <div class="col-lg-8">
            <h2 class="section-heading h1 mb-3">نظرات مراجعین</h2>
            <p class="text-muted fs-5">تجربه بیماران ما بهترین معرف کیفیت خدمات الَنزا است. بخشی از بازخوردهای دریافت‌شده را مطالعه کنید.</p>
          </div>
          <div class="col-lg-4 text-lg-end">
            <a class="btn btn-outline-primary px-4" href="<?= htmlspecialchars($website, ENT_QUOTES, 'UTF-8') ?>" target="_blank" rel="noopener">مطالعه نظرات بیشتر</a>
          </div>
        </div>
        <div class="row g-4">
<?php foreach ($reviews as $review): ?>
          <div class="col-md-6 col-lg-4">
            <article class="testimonial-card h-100">
              <div class="d-flex align-items-center justify-content-between">
                <h3 class="h5 mb-0"><?= htmlspecialchars($review['author'], ENT_QUOTES, 'UTF-8') ?></h3>
                <?php if ($review['rating']): ?>
                <span class="rating-chip"><i class="bi bi-star-fill"></i><?= htmlspecialchars($review['rating'], ENT_QUOTES, 'UTF-8') ?></span>
                <?php endif; ?>
              </div>
              <small class="text-muted"><?= htmlspecialchars($review['relative_time'], ENT_QUOTES, 'UTF-8') ?></small>
              <blockquote class="mb-0">“<?= htmlspecialchars($review['text'], ENT_QUOTES, 'UTF-8') ?>”</blockquote>
            </article>
          </div>
<?php endforeach; ?>
        </div>
      </div>
    </section>

    <section class="py-5" id="cta">
      <div class="container">
        <div class="row align-items-center g-4">
          <div class="col-lg-8">
            <div class="contact-card">
              <h2 class="section-heading h1 mb-3">رزرو آنلاین نوبت</h2>
              <p class="fs-5 mb-4">برای هماهنگی سریع‌تر، فرم زیر را تکمیل کنید تا کارشناسان ما در کمتر از ۲ ساعت کاری با شما تماس بگیرند.</p>
              <?php if ($contactSuccess): ?>
              <div class="alert alert-success" role="alert">پیام شما با موفقیت ارسال شد. متشکریم!</div>
              <?php elseif ($contactError): ?>
              <div class="alert alert-danger" role="alert"><?= htmlspecialchars($contactError, ENT_QUOTES, 'UTF-8') ?></div>
              <?php endif; ?>
              <form method="post" class="row g-3" id="contact">
                <input type="hidden" name="contact_form" value="1">
                <div class="col-md-6">
                  <label class="form-label" for="name">نام و نام خانوادگی*</label>
                  <input class="form-control" type="text" id="name" name="name" required>
                </div>
                <div class="col-md-6">
                  <label class="form-label" for="phone">شماره تماس*</label>
                  <input class="form-control" type="tel" id="phone" name="phone" required>
                </div>
                <div class="col-md-6">
                  <label class="form-label" for="email">ایمیل</label>
                  <input class="form-control" type="email" id="email" name="email" placeholder="example@email.com">
                </div>
                <div class="col-12">
                  <label class="form-label" for="message">شرح درخواست*</label>
                  <textarea class="form-control" id="message" name="message" rows="4" required></textarea>
                </div>
                <div class="col-12 d-grid d-sm-flex gap-3">
                  <button type="submit" class="btn btn-primary px-4">ارسال درخواست</button>
                  <a class="btn btn-outline-secondary px-4" href="https://booking.example.com" target="_blank" rel="noopener">رزرو از طریق سامانه آنلاین</a>
                </div>
              </form>
            </div>
          </div>
          <div class="col-lg-4">
            <div class="bg-white rounded-4 shadow-lg p-4 h-100">
              <h3 class="h4 mb-3">اطلاعات تماس</h3>
              <ul class="list-unstyled d-grid gap-2 text-muted">
                <li><i class="bi bi-geo-alt-fill text-primary ms-2"></i><?= htmlspecialchars($address, ENT_QUOTES, 'UTF-8') ?></li>
                <li><i class="bi bi-telephone-fill text-primary ms-2"></i><a href="tel:<?= htmlspecialchars(preg_replace('/\s+/', '', $phone), ENT_QUOTES, 'UTF-8') ?>" class="text-decoration-none"><?= htmlspecialchars($phone, ENT_QUOTES, 'UTF-8') ?></a></li>
                <li><i class="bi bi-globe text-primary ms-2"></i><a href="<?= htmlspecialchars($website, ENT_QUOTES, 'UTF-8') ?>" class="text-decoration-none" target="_blank" rel="noopener">وب‌سایت رسمی کلینیک</a></li>
                <li><i class="bi bi-clock-fill text-primary ms-2"></i>شنبه تا چهارشنبه ۹ تا ۱۸ | پنجشنبه ۹ تا ۱۴</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="py-5 bg-white" id="map">
      <div class="container">
        <div class="row g-4">
          <div class="col-lg-6">
            <h2 class="section-heading h1 mb-3">مسیر دسترسی</h2>
            <p class="text-muted fs-5">کلینیک الَنزا در قلب منطقه سعادت‌آباد واقع شده و دسترسی آسانی از بزرگراه چمران و یادگار امام دارد. پارکینگ اختصاصی برای مراجعین در نظر گرفته شده است.</p>
            <a class="btn btn-outline-primary px-4" href="https://www.google.com/maps/dir//<?= urlencode($address) ?>" target="_blank" rel="noopener">مسیریابی در گوگل مپ</a>
          </div>
          <div class="col-lg-6">
            <div class="ratio ratio-4x3 rounded-4 shadow-lg overflow-hidden">
              <iframe src="<?= htmlspecialchars($mapUrl, ENT_QUOTES, 'UTF-8') ?>" allowfullscreen loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>

  <footer class="py-4">
    <div class="container">
      <div class="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3">
        <div>
          <p class="mb-1">© <?= date('Y') ?> کلینیک دندانپزشکی الَنزا. تمامی حقوق محفوظ است.</p>
          <small>طراحی و توسعه با تمرکز بر تجربه کاربری و فناوری‌های روز دندانپزشکی.</small>
        </div>
        <div class="d-flex gap-3">
          <a href="#services" class="text-decoration-none">خدمات</a>
          <a href="#gallery" class="text-decoration-none">گالری</a>
          <a href="#testimonials" class="text-decoration-none">نظرات</a>
          <a href="#contact" class="text-decoration-none">تماس</a>
        </div>
      </div>
    </div>
  </footer>

  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js" integrity="sha384-U1DAWAznBHeqEIlVSCgzq+iQm+49j0eK6Ff8HgnbZQzQIb2jZu5w5Q5sgb3H0ec" crossorigin="anonymous"></script>
  <script>
    document.addEventListener('DOMContentLoaded', () => {
      const form = document.querySelector('#contact');
      if (!form) return;
      const name = form.querySelector('#name');
      const phone = form.querySelector('#phone');
      const message = form.querySelector('#message');

      form.addEventListener('submit', (event) => {
        if (!name.value.trim() || !phone.value.trim() || !message.value.trim()) {
          event.preventDefault();
          form.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
    });
  </script>
</body>
</html>
