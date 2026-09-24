# uae-occasions

**UAE public holidays, national observances and international days — with Hijri dates. Zero dependencies.**

A small data-and-functions package for the United Arab Emirates calendar: public holidays, national observances (Flag Day, Emirati Women's Day, Innovation Month) and officially designated international days, each with English and Arabic names and its issuing authority. Hijri conversion uses the **Umm al-Qura calendar built into JavaScript's `Intl` API** — no dependencies, no conversion tables to maintain.

Built and maintained by [Trivos Labs](https://trivoslabs.com), Dubai.

## Important: estimates vs. announcements

Islamic holiday dates in the UAE are set by **UAE Cabinet announcement**, typically confirmed close to the date. Entries resolved from Hijri rules carry `estimate: true` and should be treated as planning estimates, never as confirmed holiday dates. The Cabinet announcement is always authoritative.

## Install

```bash
npm install @trivoslabs/uae-occasions
```

Requires Node 18+ (or any modern browser bundler). No dependencies.

## Usage

```js
import {
  publicHolidaysInYear,
  occasionsInYear,
  nextOccasion,
  isPublicHoliday,
  toHijri,
} from "@trivoslabs/uae-occasions";

// UAE public holidays for a year
for (const h of publicHolidaysInYear(2027)) {
  console.log(h.date, h.name.en, h.name.ar, h.estimate ? "(estimate)" : "");
}

// Everything: holidays, observances, international days
occasionsInYear(2027);
occasionsInYear(2027, { types: ["national-observance"] });

// The next occasion from today
nextOccasion();

// Is a given date a UAE public holiday?
isPublicHoliday(new Date("2027-12-02")); // true

// Gregorian → Hijri (Umm al-Qura)
toHijri(new Date());
// { year: 1448, month: 4, day: 13, monthName: { en: "Rabi Al Thani", ar: "ربيع الآخر" } }
```

## Each resolved entry

| Field | Meaning |
|---|---|
| `id` | Stable kebab-case identifier |
| `name` | `{ en, ar }` |
| `type` | `public-holiday` · `national-observance` · `international-day` · `awareness-period` |
| `authority` | The issuing body (UAE Cabinet, UN resolution, UNESCO, …) |
| `date`, `endDate`, `durationDays` | Resolved Gregorian dates (UTC midnight) |
| `estimate` | `true` when the date derives from a Hijri rule and awaits official announcement |
| `notes` | Optional `{ en, ar }` caveats |

## Data policy

Only occasions with an identifiable issuing authority are included; the `authority` field records it for every entry. Unofficial "days" with no authoritative body are deliberately excluded.

## Tests

```bash
npm test
```

## License

Apache-2.0 © Trivos Labs FZCO

---

<div dir="rtl">

# مناسبات الإمارات

**العطلات الرسمية والمناسبات الوطنية والأيام الدولية في دولة الإمارات العربية المتحدة — مع التاريخ الهجري، وبدون أي اعتماديات.**

حزمة صغيرة من البيانات والدوال لتقويم دولة الإمارات: العطلات الرسمية، والمناسبات الوطنية (يوم العلم، يوم المرأة الإماراتية، شهر الإمارات للابتكار)، والأيام الدولية المعتمدة رسمياً — لكل منها اسم بالعربية والإنجليزية وجهة الإصدار. يعتمد التحويل الهجري على **تقويم أم القرى المدمج في واجهة `Intl`** في جافاسكريبت، فلا حاجة إلى مكتبات خارجية أو جداول تحويل.

من تطوير [تريفوس لابز](https://trivoslabs.com)، دبي.

## تنبيه مهم: تقديرات لا إعلانات

تُحدَّد مواعيد العطلات الإسلامية في الدولة بقرار من **مجلس الوزراء**، ويصدر الإعلان عادةً قُبيل الموعد. المدخلات المحسوبة من قواعد هجرية تحمل الوسم `estimate: true` وينبغي التعامل معها كتقديرات للتخطيط لا كمواعيد مؤكدة؛ فالإعلان الرسمي هو المرجع دائماً.

## سياسة البيانات

لا تُدرج إلا المناسبات التي لها جهة إصدار معروفة، ويوثّق الحقل `authority` هذه الجهة لكل مدخل. أما «الأيام» غير الرسمية التي لا جهة معتمدة لها فهي مستبعدة عمداً.

## الترخيص

Apache-2.0 © تريفوس لابز

</div>
