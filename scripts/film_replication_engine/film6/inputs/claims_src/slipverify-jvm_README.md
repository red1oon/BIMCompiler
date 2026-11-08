# slipverify-jvm — Thai transfer slip verification for Java and Kotlin

[![CI](https://github.com/sunJirapath/slipverify-jvm/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/sunJirapath/slipverify-jvm/actions/workflows/ci.yml)
[![CodeQL](https://github.com/sunJirapath/slipverify-jvm/actions/workflows/codeql.yml/badge.svg)](https://github.com/sunJirapath/slipverify-jvm/actions/workflows/codeql.yml)
[![Maven Central](https://img.shields.io/maven-central/v/io.github.sunjirapath.slipverify/slipverify-core)](https://central.sonatype.com/artifact/io.github.sunjirapath.slipverify/slipverify-core)
[![Coverage](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2FsunJirapath%2Fslipverify-jvm%2Fbadges%2Fcoverage.json)](https://github.com/sunJirapath/slipverify-jvm/actions/workflows/ci.yml)
[![License](https://img.shields.io/github/license/sunJirapath/slipverify-jvm)](LICENSE)
[![Core Java 11+](https://img.shields.io/badge/Core-Java%2011%2B-blue)](#modules)
[![Spring Boot 4 / Java 17+](https://img.shields.io/badge/Starter-Spring%20Boot%204%20%2F%20Java%2017%2B-green)](#quick-start-spring-boot)

Takes a slip image that your frontend sends as base64, finds the slip's mini QR, parses it with
[promptparse-jvm](https://github.com/sunJirapath/promptparse-jvm), optionally confirms it with a slip-verification
provider, runs your business checks (amount, receiver, age, duplicates) and returns **one typed result with reason
codes**. Java-friendly API, Spring Boot starter included. ตรวจสลิป Java / Kotlin.

> **Disclaimer:** not affiliated with, endorsed by, or sponsored by any bank or slip-verification provider.
> **An offline QR check is not proof of payment.** Anyone can print a slip QR. Only a provider's confirmation counts,
> and without a provider this library returns at most `UNVERIFIED`.

[English](#english) · [ภาษาไทย](#ภาษาไทย)

## English

### Install

Latest version: **0.1.2**, available on Maven Central. Group `io.github.sunjirapath.slipverify`, artifacts
`slipverify-core`, `slipverify-provider-slipok`, `slipverify-provider-easyslip`, `slipverify-image-zxing`,
`slipverify-store-redis`, `slipverify-spring-boot-starter` (see [Modules](#modules)).

```kotlin
// Gradle (Kotlin DSL)
dependencies {
    implementation("io.github.sunjirapath.slipverify:slipverify-core:0.1.2")
}
```

```xml
<!-- Maven -->
<dependency>
  <groupId>io.github.sunjirapath.slipverify</groupId>
  <artifactId>slipverify-core</artifactId>
  <version>0.1.2</version>
</dependency>
```

Providers: EasySlip and SlipOK. RDCW is planned once its success response is documented
(see [docs/RESEARCH.md](docs/RESEARCH.md)).

The Spring Boot starter targets Spring Boot 4 / Java 17 (built and tested against 4.1). On Spring Boot 3 or an app that
wires its own beans, use `slipverify-core` plus a provider module directly: they are plain libraries with no Spring
dependency.

### How it works

```mermaid
flowchart LR
    A[base64 image<br/>or QR payload] --> B[validate and decode<br/>size, magic bytes, dimensions, timeout]
    B --> C[find QR with ZXing<br/>retry scale / contrast / crops / rotations]
    C --> D[promptparse-jvm slip parse<br/>CRC auto-fix]
    D -->|no provider| U[UNVERIFIED]
    D --> E[provider chain<br/>EasySlip → SlipOK, fallback on timeout / 5xx]
    E -->|not found| I[INVALID]
    E -->|confirmed| F[business checks<br/>amount, receiver, age]
    F --> G[duplicate store<br/>memory or Redis]
    G --> V[VALID]
    F -->|fails| I
    G -->|seen before| I
```

### Modules

| Module | Artifact | Contents |
|---|---|---|
| `core` | `slipverify-core` | result model, `SlipVerifier`, `SlipProvider` / `DuplicateStore` / `QrExtractor`, business checks, in-memory store |
| `image-zxing` | `slipverify-image-zxing` | base64 → image → slip QR (ZXing) |
| `provider-common` | `slipverify-provider-common` | HTTP + JSON helpers shared by providers |
| `provider-easyslip` | `slipverify-provider-easyslip` | [EasySlip](https://document.easyslip.com/en/v2/) API v2 |
| `provider-slipok` | `slipverify-provider-slipok` | [SlipOK](https://slipok.com/api-documentation/) |
| `store-redis` | `slipverify-store-redis` | duplicate store on Redis (`SET NX PX`, Lettuce) |
| `spring-boot-starter` | `slipverify-spring-boot-starter` | auto-config, properties, metrics, example controller (Boot 4, Java 17) |
| `examples` | – | plain Java and Spring Boot demos |

`core` depends only on promptparse-jvm. Libraries use Java 11 bytecode; the starter needs Java 17.

### Quick start: Spring Boot

```kotlin
dependencies {
    implementation("io.github.sunjirapath.slipverify:slipverify-spring-boot-starter:0.1.2")
    implementation("io.github.sunjirapath.slipverify:slipverify-provider-easyslip:0.1.2")
    // optional: slipverify-provider-slipok, slipverify-store-redis
}
```

```yaml
slipverify:
  provider-order: easyslip,slipok
  easyslip:
    api-key: ${EASYSLIP_API_KEY:}      # from the environment, never from source
  duplicate:
    store: memory                       # or redis (+ redis-uri)
  web:
    enabled: true                       # example endpoint POST /slips/verify (add auth + rate limiting!)
```

```java
@RestController
class PayController {
  private final SlipVerificationService slips;
  PayController(SlipVerificationService slips) { this.slips = slips; }

  @PostMapping("/pay/confirm")
  SlipVerificationResult confirm(@RequestBody ConfirmBody body) {
    return slips.verify(new SlipRequest(body.image(), null, new BigDecimal("150.00"),
        new ReceiverRule("1234", "สมชาย"), Duration.ofMinutes(30)));
  }
}
```

### Quick start: plain Java

```java
SlipVerifier verifier = SlipVerifier.builder()
    .qrExtractor(new ZxingQrExtractor())                                   // needed for imageBase64
    .provider(new EasySlipProvider(new EasySlipConfig(System.getenv("EASYSLIP_API_KEY"))))
    .duplicateStore(new InMemoryDuplicateStore())                           // or RedisDuplicateStore.connect(uri)
    .build();

SlipVerificationResult r = verifier.verify(new SlipRequest(
    base64FromFrontend,            // raw base64 or data URL; or null and pass the QR text as `payload`
    null,
    new BigDecimal("150.00"),      // expectedAmount (optional)
    new ReceiverRule("1234", "สมชาย"),  // expectedReceiver (optional)
    Duration.ofMinutes(30)));      // maxAge (optional)

if (r.getStatus() == VerificationStatus.VALID) { /* credit the order */ }
```

See [examples/](examples/) for runnable versions. For crediting orders safely, follow
[transactional payment acceptance](docs/PAYMENT_ACCEPTANCE.md).

### Capping spend and checking your own records first

Providers bill per lookup, so two optional hooks keep a busy till from burning quota:

```java
SlipVerifier verifier = SlipVerifier.builder()
    .provider(new SlipOkProvider(slipOkConfig))
    // 1. Free check against your own database BEFORE any provider is asked (INVALID + DUPLICATE on a hit).
    .knownSlips((type, sendingBank, transRef) -> slipRepository.exists(sendingBank, transRef))
    // 2. A hard cap: reserve before each provider call, settle with what the provider reported.
    .quotaGuard(new QuotaGuard() {
      public boolean tryReserve(String provider) { return quota.tryReserve(); }          // false = provider not asked
      public void settle(String provider, Charge charge) { if (charge == Charge.NO) quota.release(); }
    })
    .build();
```

`Charge.NO` means the provider documents that answer as free, so the reservation can be returned; `YES` and `UNKNOWN`
(for example a timeout) keep it. A guard that throws is treated as "cap reached" because failing open would spend money.
Make `tryReserve` atomic (one conditional `UPDATE`, or `INCR` with a limit) so concurrent requests cannot overshoot.

### Provider URL, request limits and billing round

Each account has its own endpoint and its own billing round, so both are settings, not code:

```yaml
slipverify:
  bill-zone: Asia/Bangkok              # billing days are calendar days in this zone (default)
  slipok:
    api-key: ${SLIPOK_API_KEY:}
    url: https://api.slipok.com/api/line/apikey/<YOUR_BRANCH_ID>   # branch id included; replaces base-url + branch-id
    bill-cutoff: 13/11/2026            # next billing date (or just 13): the quota resets on the 13th of every month
    limit:
      max-per-cycle: 500               # provider calls per billing round; needs bill-cutoff
      max-per-minute: 30
  easyslip:
    api-key: ${EASYSLIP_API_KEY:}
    bill-cutoff: 1                     # each provider can bill on its own day
    limit:
      max-per-cycle: 1000
```

- `bill-cutoff` takes a day of the month (`13`) or the next billing date (`13/11/2026`, `2026-11-13`), which means "resets
  every 13th" at 00:00 in `bill-zone`. A cutoff past the end of a short month (31 in April) falls on the last day. Use
  the Gregorian year, not the Buddhist-era year.
- Once a provider reaches a limit it is not asked; the verifier moves to the next provider in `provider-order`, or
  reports `QUOTA_CAPPED` when none is left (the provider is not asked, so no money is spent). Answers the provider documents as free give the unit back.
- Counts are kept per JVM. With several instances give each its share, or define your own `QuotaGuard` bean (it takes
  priority). A per-cycle limit without `bill-cutoff`, or an unreadable cutoff, fails startup.
- Plain Java: `new ConfiguredQuotaGuard(Map.of("slipok", new ProviderLimit(500L, 30L)), Map.of("slipok", BillingCycle.parse("13")))`.
- `SlipVerifier` settles each `ConfiguredQuotaGuard` reservation with its original minute and billing cycle, so a
  late free response cannot refund another period. Existing custom `QuotaGuard` implementations keep their two-method
  contract. Direct callers of the built-in guard should use `QuotaReservation reservation = guard.reserve("slipok")`
  (`null` means capped), then `reservation.settle(charge)`. Its legacy `tryReserve` / `settle(provider, charge)` path
  conservatively counts attempts, including free answers, because the provider name alone cannot identify a refund.
- Receiver `accountSuffix` is an untyped identifier check. EasySlip uses the bank account when present, otherwise
  the PromptPay proxy account (such as a phone number); TrueMoney uses the wallet phone. A matching proxy does not
  override a conflicting bank account. Configure the expected suffix for the identifier actually returned.

### Frontend snippet (JavaScript)

HEIC (iPhone) is not supported: converting through a canvas yields JPEG and also shrinks big photos.

```js
async function sendSlip(file) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 2000 / Math.max(bitmap.width, bitmap.height));
  const canvas = new OffscreenCanvas(bitmap.width * scale, bitmap.height * scale);
  canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const jpeg = await canvas.convertToBlob({ type: "image/jpeg", quality: 0.9 });
  const dataUrl = await new Promise((resolve) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);        // "data:image/jpeg;base64,...."
    r.readAsDataURL(jpeg);
  });
  const res = await fetch("/slips/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image: dataUrl, expectedAmount: 150.0 }),
  });
  return res.json();   // { status, reasons, amount, ... }
}
```

### Results and reason codes

`status` is `VALID`, `INVALID`, `UNVERIFIED` or `ERROR`. `VALID` needs a provider confirmation **and** every requested
check to pass. Reasons are an enum list; `CRC_AUTOFIXED`, `NO_PROVIDER_CONFIGURED` are informational.

| Group | Codes |
|---|---|
| Input / image | `EMPTY_INPUT`, `INVALID_BASE64`, `UNSUPPORTED_IMAGE_FORMAT` (also HEIC / WebP), `IMAGE_TOO_LARGE`, `IMAGE_DIMENSIONS_TOO_LARGE`, `IMAGE_DECODE_TIMEOUT`, `IMAGE_PROCESSING_BUSY` |
| QR | `NO_QR_FOUND`, `NOT_A_SLIP_QR`, `CRC_INVALID`, `CRC_AUTOFIXED` (info) |
| Provider | `NO_PROVIDER_CONFIGURED` (info), `PROVIDER_NOT_FOUND`, `PROVIDER_PENDING`, `PROVIDER_AUTH_ERROR`, `PROVIDER_QUOTA_EXCEEDED`, `PROVIDER_RATE_LIMITED`, `PROVIDER_TIMEOUT`, `PROVIDER_ERROR`, `PROVIDER_UNSUPPORTED_SLIP_TYPE` |
| Business | `AMOUNT_MISMATCH`, `RECEIVER_MISMATCH`, `TRANSACTION_MISMATCH`, `TOO_OLD`, `TIME_UNAVAILABLE`, `TIME_IN_FUTURE`, `DUPLICATE`, `DUPLICATE_STORE_ERROR` |

Fallback rules: timeout / network / 5xx → next provider; any 4xx (including 429), "not found" or "pending" → stop.
Each slip type is only sent to providers that support it. Missing data fails closed (for example `maxAge` without a
transfer time gives `TIME_UNAVAILABLE`). Provider confirmations must include a transaction reference matching the
submitted QR and a positive confirmed amount; an absent reference or nonpositive amount gives `ERROR` + `PROVIDER_ERROR`, and a differing reference or sending bank gives
`INVALID` + `TRANSACTION_MISMATCH`. Future transfer times beyond two minutes of clock skew give `TIME_IN_FUTURE`,
even when `maxAge` is omitted.

### Slip type × provider support

| Slip type | promptparse-jvm | EasySlip | SlipOK | RDCW |
|---|---|---|---|---|
| Standard BOT slip | ✓ | ✓ (payload) | ✓ (payload) | planned |
| TrueMoney wallet slip | ✓ (offline) | ✓ (**needs the image**, not the payload) | not documented | planned |

Sources and open questions: [docs/RESEARCH.md](docs/RESEARCH.md).

### Security notes

- Slip data is personal data (PDPA). Images are never persisted; names and accounts are masked in results, logs and
  `toString()`. Do not log requests or provider responses yourself.
- API keys come from configuration or the environment. They are never printed, and exceptions carry no message from
  the remote side.
- Limits before decoding: 5 MB encoded (default), PNG/JPEG magic bytes, pixel and dimension caps read from the
  header (decompression bombs), and a decode timeout. Generated variants obey the same dimension/pixel limits.
  Image scans share four worker threads and a queue of eight jobs per JVM; saturation returns
  `ERROR` + `IMAGE_PROCESSING_BUSY`. Cancellation is cooperative, so workers remain bounded even if decoding does
  not stop immediately. Provider responses are limited to 2,000,000 bytes during download.
- The duplicate store fails closed: if Redis is down the slip is not accepted. `slipverify.duplicate.store` accepts
  only `memory` or `redis`; an unknown value fails startup instead of silently selecting memory.
- Metrics are best effort: callback exceptions cannot discard a result or trigger another paid provider call.
- The example controller has **no authentication or rate limiting**. It enforces a body size limit and returns generic
  errors; details are logged at DEBUG on the server only.
- Receiver matching works on masked provider data, so it narrows but does not identify an account. Use the
  provider's own account linking for strong guarantees.

### Build and contribute

```
./gradlew check        # format, detekt, tests, API check, 90% coverage
```

Gradle verifies downloaded dependencies against the committed SHA-256 metadata and pins the wrapper distribution
checksum. See [CONTRIBUTING.md](CONTRIBUTING.md) for reviewing checksum updates. Security reports: [SECURITY.md](SECURITY.md).

### License

This project is licensed under the [Apache License 2.0](LICENSE). See [NOTICE](NOTICE).

## ภาษาไทย

### ติดตั้ง

เวอร์ชันล่าสุด **0.1.2** บน Maven Central (เช่น `io.github.sunjirapath.slipverify:slipverify-core:0.1.2`; รายชื่อ artifact ดูที่ [Modules](#modules))
รองรับผู้ให้บริการ EasySlip และ SlipOK ส่วน RDCW จะเพิ่มเมื่อมีเอกสารรูปแบบผลลัพธ์ที่สำเร็จ

> **ข้อสงวนสิทธิ์:** โปรเจกต์นี้ไม่มีส่วนเกี่ยวข้องหรือได้รับการรับรองจากธนาคารหรือผู้ให้บริการตรวจสลิปรายใด
> **การอ่าน QR บนสลิปเพียงอย่างเดียวไม่ใช่หลักฐานการชำระเงิน** ใครก็สร้าง QR บนสลิปปลอมได้
> ต้องให้ผู้ให้บริการยืนยันเท่านั้น หากไม่ตั้งค่าผู้ให้บริการ ผลสูงสุดคือ `UNVERIFIED`

### ทำงานอย่างไร

รับรูปสลิปเป็น base64 จาก frontend → ตรวจขนาด/ชนิดไฟล์/ขนาดพิกเซล → ค้นหา QR ด้วย ZXing (ลองย่อ ขยาย ปรับคอนทราสต์
ตัด หมุน) → แปลงด้วย promptparse-jvm (ซ่อม CRC ที่ถูกตัดเลข 0 นำหน้าอัตโนมัติ) → ส่งให้ผู้ให้บริการยืนยัน
(สลับไปรายถัดไปเมื่อ timeout หรือ 5xx) → ตรวจยอดเงิน ผู้รับ อายุสลิป และสลิปซ้ำ → ได้ผลลัพธ์เดียวพร้อมรหัสเหตุผล

### เริ่มต้นใช้งานกับ Spring Boot

```yaml
slipverify:
  provider-order: easyslip,slipok
  easyslip:
    api-key: ${EASYSLIP_API_KEY:}   # ใส่ผ่าน environment ห้ามเขียนในโค้ด
  duplicate:
    store: memory                    # หรือ redis
```

```java
SlipVerificationResult r = slips.verify(new SlipRequest(
    body.image(), null, new BigDecimal("150.00"),
    new ReceiverRule("1234", "สมชาย"), Duration.ofMinutes(30)));
if (r.getStatus() == VerificationStatus.VALID) { /* ยืนยันออเดอร์ */ }
```

### เริ่มต้นใช้งานกับ Java ธรรมดา

ดูตัวอย่างที่รันได้ใน [examples/java](examples/java) และโค้ดเต็มในหัวข้อ English ด้านบน
สตาร์เตอร์รองรับ Spring Boot 4 / Java 17 ส่วน core และ provider ใช้ Java 11 ได้ หากใช้ Spring Boot 3 ให้ประกอบ core กับ provider เอง
การบันทึกว่าชำระเงินแล้วต้องทำพร้อมบันทึกรหัสธุรกรรมที่ไม่ซ้ำใน transaction เดียวกัน ดู [แนวทางรับชำระเงิน](docs/PAYMENT_ACCEPTANCE.md)

### URL ผู้ให้บริการ จำกัดจำนวนเรียก และรอบบิล

แต่ละบัญชีมี URL และรอบบิลของตัวเอง จึงตั้งค่าได้ใน config:

```yaml
slipverify:
  bill-zone: Asia/Bangkok              # วันตัดรอบบิลนับตามเขตเวลานี้ (ค่าเริ่มต้น)
  slipok:
    api-key: ${SLIPOK_API_KEY:}
    url: https://api.slipok.com/api/line/apikey/<YOUR_BRANCH_ID>   # ใส่ branch id ใน URL ได้เลย
    bill-cutoff: 13/11/2026            # วันที่ตัดรอบบิลหน้า (หรือใส่แค่ 13) = โควตารีเซ็ตทุกวันที่ 13
    limit:
      max-per-cycle: 500               # จำนวนครั้งที่เรียกต่อรอบบิล (ต้องตั้ง bill-cutoff)
      max-per-minute: 30
```

- `bill-cutoff` ใส่วันที่ในเดือน (`13`) หรือวันที่ตัดรอบหน้า (`13/11/2026`, `2026-11-13`) แปลว่ารีเซ็ตทุกวันที่ 13 เวลา 00:00
  ตาม `bill-zone` ถ้าวันตัดรอบเกินจำนวนวันของเดือน (เช่น 31 ในเดือนเมษายน) จะใช้วันสุดท้ายของเดือน และใช้ปี ค.ศ.
- เมื่อผู้ให้บริการถึงลิมิตจะไม่ถูกเรียก ระบบสลับไปรายถัดไปใน `provider-order` หรือคืน `QUOTA_CAPPED` (ไม่เรียกผู้ให้บริการ จึงไม่เสียเงิน)
- ตัวนับอยู่ในแต่ละ JVM หากรันหลายเครื่องให้แบ่งโควตา หรือประกาศ bean `QuotaGuard` เอง (มีลำดับก่อน)
  ตั้ง `max-per-cycle` โดยไม่มี `bill-cutoff` หรือใส่วันที่ผิดรูปแบบ แอปจะไม่สตาร์ท
- `SlipVerifier` คืนโควตาฟรีตามรอบบิลและนาทีที่จองไว้ แม้คำตอบกลับมาข้ามรอบ ผู้เรียก `ConfiguredQuotaGuard` โดยตรง
  ควรใช้ `reserve(provider)` แล้วเรียก `settle(charge)` บน receipt ที่ได้ (`null` คือเต็ม) เมธอดเดิม `tryReserve` /
  `settle(provider, charge)` จะนับทุกครั้งรวมคำตอบฟรี เพราะชื่อ provider อย่างเดียวระบุการจองเดิมไม่ได้
- `accountSuffix` เทียบรหัสผู้รับโดยไม่แยกชนิด EasySlip ใช้บัญชีธนาคารก่อน หากไม่มีจึงใช้ proxy PromptPay เช่น เบอร์โทร
  ถ้ามีบัญชีธนาคารที่ไม่ตรง proxy ที่ตรงจะไม่ทำให้ผ่าน ต้องตั้ง suffix ให้ตรงกับรหัสที่ provider ส่งกลับ

### โค้ดฝั่ง frontend

ใช้ตัวอย่าง JavaScript ด้านบน: แปลงรูปผ่าน canvas เป็น JPEG ก่อนส่ง เพราะ **ไม่รองรับ HEIC ของ iPhone**
(จะได้ `UNSUPPORTED_IMAGE_FORMAT`) และช่วยลดขนาดรูปใหญ่ด้วย

### สถานะผลลัพธ์

| สถานะ | ความหมาย |
|---|---|
| `VALID` | ผู้ให้บริการยืนยันการโอน และผ่านทุกเงื่อนไขที่ร้องขอ (ยอด ผู้รับ อายุ สลิปซ้ำ) |
| `INVALID` | อ่านไม่ได้ ไม่พบในระบบ หรือไม่ผ่านเงื่อนไข ดูรหัสเหตุผล |
| `UNVERIFIED` | อ่าน QR ได้แต่ไม่มีผู้ให้บริการยืนยัน (ไม่ใช่หลักฐานการชำระเงิน) |
| `ERROR` | ระบบภายนอกขัดข้องหรือ timeout |

### ตารางประเภทสลิป × ผู้ให้บริการ

| ประเภทสลิป | promptparse-jvm | EasySlip | SlipOK | RDCW |
|---|---|---|---|---|
| สลิปมาตรฐาน ธปท. | ✓ | ✓ (payload) | ✓ (payload) | วางแผนไว้ |
| สลิป TrueMoney | ✓ (offline) | ✓ (**ต้องส่งรูป** ไม่รับ payload) | ไม่มีในเอกสาร | วางแผนไว้ |

### หมายเหตุด้านความปลอดภัยและ PDPA

- ข้อมูลบนสลิปเป็นข้อมูลส่วนบุคคล ไลบรารีไม่เก็บรูปภาพ และปิดบังชื่อ/เลขบัญชีในผลลัพธ์และ `toString()`
- API key ต้องมาจาก config หรือ environment เท่านั้น ไม่ปรากฏใน log หรือข้อความ exception
- ตรวจขนาดไฟล์ ชนิดไฟล์ และขนาดพิกเซลก่อนถอดรหัสรูป เพื่อกัน decompression bomb และมี timeout
- ถ้า Redis ล่ม สลิปจะไม่ถูกยอมรับ (fail closed)
- รหัสธุรกรรมจาก provider ต้องตรงกับ QR; ไม่ตรงจะได้ `TRANSACTION_MISMATCH` และเวลาที่ล่วงหน้าเกิน 2 นาทีจะได้ `TIME_IN_FUTURE`
- งานอ่านรูปใช้ worker 4 threads และคิว 8 งานต่อ JVM; คิวเต็มจะได้ `ERROR` + `IMAGE_PROCESSING_BUSY`
- controller ตัวอย่าง **ไม่มีระบบยืนยันตัวตนและ rate limit** ต้องเพิ่มเองก่อนเปิดใช้งานจริง

### สัญญาอนุญาต

โปรเจกต์นี้อยู่ภายใต้ [Apache License 2.0](LICENSE) ดู [NOTICE](NOTICE)
