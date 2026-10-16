# Engine Light Laws — one photometric chain (research, 2026-09-27)

Scope: primary sources only (engine docs, engine source code, SIGGRAPH course notes, CIE/ANSI-derived tables).
Every number is followed by its URL. "DERIVED" = arithmetic I did from a cited formula (shown). "GAP" = asked
for, not found in a primary source — not filled in.

Source keys used below:
- [FB] Lagarde & de Rousiers, *Moving Frostbite to PBR* v3.2, SIGGRAPH 2014 course notes —
  https://seblagarde.wordpress.com/wp-content/uploads/2015/07/course_notes_moving_frostbite_to_pbr_v32.pdf
  (page numbers = printed page numbers in the PDF)
- [FIL] Google Filament, *Physically Based Rendering in Filament* — https://google.github.io/filament/Filament.md.html
- [FIL-SRC] Filament headers: https://github.com/google/filament/blob/main/filament/include/filament/ (IndirectLight.h, LightManager.h, Camera.h, ColorGrading.h)
- [UE-PLU] https://dev.epicgames.com/documentation/en-us/unreal-engine/using-physical-lighting-units-in-unreal-engine
- [UE-AE] https://dev.epicgames.com/documentation/en-us/unreal-engine/auto-exposure-in-unreal-engine (UE 5.8)
- [UE-AE427] https://dev.epicgames.com/documentation/en-us/unreal-engine/auto-exposure-eye-adaptation?application_version=4.27
- [UE-PPS] https://dev.epicgames.com/documentation/en-us/unreal-engine/python-api/class/PostProcessSettings?application_version=5.4
- [UE-CES] https://dev.epicgames.com/documentation/en-us/unreal-engine/python-api/class/CameraExposureSettings?application_version=4.27
- [UE-SKYATM] https://dev.epicgames.com/documentation/en-us/unreal-engine/sky-atmosphere-component-in-unreal-engine
- [UE-SKYL] https://dev.epicgames.com/documentation/en-us/unreal-engine/sky-lights-in-unreal-engine
- [UE-TM] https://dev.epicgames.com/documentation/en-us/unreal-engine/color-grading-and-the-filmic-tonemapper-in-unreal-engine
- [HDRP-PLU] https://docs.unity3d.com/Packages/com.unity.render-pipelines.high-definition@17.0/manual/Physical-Light-Units.html
- [HDRP-EXP] https://github.com/Unity-Technologies/Graphics/blob/master/Packages/com.unity.render-pipelines.high-definition/Runtime/PostProcessing/Components/Exposure.cs
- [HDRP-CU] https://github.com/Unity-Technologies/Graphics/blob/master/Packages/com.unity.render-pipelines.core/Runtime/Utilities/ColorUtils.cs
- [KD] Kittler & Darula, *CIE General Sky Standard Defining Luminance Distributions*, eSim 2002 —
  https://publications.ibpsa.org/proceedings/esim/2002/papers/esim2002_o2.pdf
- [EV-WP] https://en.wikipedia.org/wiki/Exposure_value (table sourced to ANSI PH2.7-1973 / PH2.7-1986)
- [CAM02] https://en.wikipedia.org/wiki/CIECAM02 (primary: CIE 159:2004)
- [KPN] Khronos PBR Neutral — https://github.com/KhronosGroup/ToneMapping/blob/main/PBR_Neutral/README.md
- [THREE] three.js source (dev branch): https://github.com/mrdoob/three.js/tree/dev/src (lights/*.js, renderers/shaders/ShaderChunk/*)

---

## 1. Unreal Engine

**Light units** [UE-PLU]
- Directional light: **lux** — "Direct Normal Illuminance … falls on a surface perpendicular to the Sun's rays".
- Sky light: **cd/m²** (pixel luminance).
- Point / spot / rect: **candela, lumen, or unitless** (with inverse-squared falloff). `1 cd = 1 lm/sr`, `1 cd = 625 unitless`.
  Point: 1 cd ≈ 12.6 × 1 lm (4π sr). Spot (default 44° cone, ~1.76 sr): 1 cd ≈ 1.76 × 1 lm. Rect (2π sr): 1 cd ≈ 3.14 × 1 lm.
- Guidance: "If after placing a light the image goes white, … Consider increasing the Auto Exposure Max EV100."

**Sun / sky reference** [UE-SKYATM]
- Sun at zenith: **120 000 lux**, angular diameter 0.545°.
- "Total Lux on a white diffuse surface with a perpendicular sun at its zenith should be around **150 000 Lux**", "Sky contribution would be **20%** of that total" (→ DERIVED: sky ≈ 30 000 lx).
- Moon at zenith 0.26 lux, 0.568°.

**Sky light capture** [UE-SKYL]
- Real Time Capture: "the sky will be captured and convolved to achieve dynamic diffuse and specular lighting"; captures Sky Atmosphere, Volumetric Clouds, Exponential Height Fog, and `IsSky` unlit domes. "Lower hemisphere is solid color" option zeroes lower-hemisphere light to prevent leaking.
- **GAP:** no Epic doc page found that states explicitly that the sun disk is excluded from the sky-light capture (i.e. the no-double-count rule between the directional light and the captured sky). Not asserted here.

**Auto exposure** [UE-AE], [UE-AE427], [UE-PPS], [UE-CES]
- Methods: Histogram (default, "64-bin histogram"), Basic, Manual [UE-AE].
- Low / High percent: "good values are in the range **70 .. 80**" / "**80 .. 95**" [UE-PPS]. The Python `CameraExposureSettings` constructor lists low_percent=10.0, high_percent=90.0 [UE-CES] (constructor defaults, 4.27 API; not the recommendation).
- Min/Max: "expressed in pixel luminance (cd/m²) or in **EV100 when using ExtendDefaultLuminanceRange**" [UE-PPS]. Legacy defaults min_brightness 0.03, max_brightness 8.0 cd/m² [UE-CES]. UE 5.8 doc gives no numeric EV100 defaults, only "Min EV100 typically negative, Max EV100 positive" [UE-AE].
- "Extend default luminance range" (project setting) switches Min/Max Brightness and Histogram Log Min/Max to **EV100** [UE-AE], [UE-PPS]. (Secondary, not Epic: reports it is on by default for new UE 5.1+ projects — https://forums.unrealengine.com/t/extend-default-luminance-range-for-ev100-to-unreal-engine-5/506163.)
- Speed Up / Speed Down: "In F-stops per second, should be >0" [UE-PPS]; constructor values speed_up **3.0**, speed_down **1.0** [UE-CES]. Curve transitions linear→exponential "at 1.5 f-stops from the Target value" (`r.EyeAdaptation.ExponentialTransitionDistance`) [UE-AE427].
- Exposure compensation: "0: no adjustment, -1: 2x darker, … 1: 2x brighter" [UE-PPS]. UE 4.25+ changed default to **1.0** ("original value was found to be too dark") [UE-AE427].
- Calibration: auto-exposure targets "a pixel brightness equal to the Constant Calibration value" [UE-PPS]; the (now-deprecated) constant = "Calibration constant for 18% albedo", default **18.0** [UE-CES]. **K = 12.5 is not stated in any Epic page found** (see §Disagreements).
- Manual + "Apply Physical Camera Exposure": brightness driven by ISO / shutter / aperture [UE-AE].

**AO** [UE-PPS]
- `ambient_occlusion_intensity`: "defines how much it affects the **non direct lighting** after base pass".
- `ambient_occlusion_radius`: ">0, in **unreal units**" (UE unit = 1 cm). `ambient_occlusion_radius_in_ws`: "true: AO radius is in world space units, false: … locked the view space in 400 units".
- `ambient_occlusion_static_fraction`: 0 = no effect on static (baked) lighting.

**Tone map** [UE-TM]: ACES-based filmic tonemapper by default; Slope 0.88, Toe 0.55, Shoulder 0.26, Black Clip 0, White Clip 0.04; "the last stage of post processing".

## 2. Frostbite — Lagarde & de Rousiers 2014 [FB]

**Units (Table 8, p.28):** Area lights lm / cd·m⁻² / EV; Punctual lm; Photometric (IES) cd; Emissive cd·m⁻² or EV; **Sun lx**; **Sky and image-based cd·m⁻²**.

**Punctual conversions (Eq.15–17, Table 9, p.29–30):** point `Φ = 4π I` → `I = Φ/4π`; exact spot `Φ = 2π(1−cos(θouter/2)) I`; Frostbite spot chosen as `Φ = π I` (reflector treated as absorber, no focusing). Point evaluation `Lout = f(v,l) · Φ/(4π d²) · ⟨n·l⟩` (Eq.18).

**Sun (§4.6, p.36–37):** artist sets **E⊥ in lux** (perpendicular to sun); `Lout = f(v,l) E⊥ ⟨n·l⟩` (Eq.28). Footnote 29: sun luminance ≈ 1.6×10⁹ cd/m², so sun illuminance "should be in the range **105 000 and 114 000 lux**" (no atmosphere). Sun solid angle 0.000066–0.000071 sr.

**Table 11 (p.37), measured, Stockholm July, sunny with few clouds (lux):**

| Time | 9am | 10am | 11am | 12 | 1pm | 2:30pm | 5pm | 6:30pm |
|---|---|---|---|---|---|---|---|---|
| Sky+Sun (horiz) | 85 500 | 88 000 | 101 600 | 110 000 | 113 600 | 109 300 | 77 000 | 39 800 |
| Sky (horiz) | 25 700 | 19 700 | 20 100 | 19 300 | 19 600 | 25 500 | 29 000 | 14 000 |
| Sun (horiz) | 59 800 | 68 300 | 81 500 | 90 700 | 94 000 | 83 800 | 48 000 | 25 800 |
| Sky+Sun ⊥ | | | | | 150 400 | 145 400 | 142 500 | 99 000 |
| Sky ⊥ | | | | | 27 300 | 29 000 | 36 000 | 20 000 |
| Sun ⊥ | | | | | 123 100 | 116 400 | 106 500 | 79 000 |

→ DERIVED sky/sun ratio (horizontal): 0.21–0.60 through the day; at 1pm 19 600/94 000 = **0.21**.

**Sky luminance (§4.8, p.59):** "a clear sky should have a luminance around **8000 cd·m⁻²** and an overcast around **2000 cd·m⁻²**"; moon ≈ 2500 cd·m⁻².

**EV and exposure (§4.3 p.27, §5.1 p.83–87):**
- `EV = log2(Lavg · S / K)` (Eq.11, 69); ISO 2720:1974 range K 10.6–13.4; K = 12.5 (Canon, Nikon, Sekonic), 14 (Minolta, Kenko, Pentax). "K = 12.5 … adopted". Footnote 19: 12.5 is "roughly half a stop below middle grey …: 18%/√2 = 12.7%".
- `L = 2^EV · 12.5/100 = 2^(EV−3)` cd/m² (Eq.12); Table 7: EV100 0 → 0.125, 3 → 1, 10 → 128, 13 → 1024, 16 → 8192 cd/m².
- `EV100 = log2(N²/t) − log2(S/100)` (Eq.67); exposure compensation `EV100' = EV100 − EC` (Eq.68).
- Photometric exposure `H = (q t / N²) L`, q = 0.65 (Eq.70). Saturation-based: `H_sbs = 78/S` (Eq.72); `Lmax = 78 N² / (S q t)` (Eq.75) → **`maxLuminance = 1.2 · 2^EV100`, `exposure = 1/maxLuminance`** (Listing 28: `78/(100·0.65) = 1.2`).
- Auto exposure: "average log luminance … unstable … use a histogram … In Frostbite, we have adopted the **histogram method**" (p.84). Also notes that metering pixel luminance × albedo makes an all-10%-grey and all-90%-grey scene render the same.
- After exposure: white balance, colour grading, **tone mapping**, gamma — "can be baked into a **single LUT**" (p.86).
- Sunny-16 (Table 13, p.87): f/16 sunny, f/11 slightly overcast, f/8 overcast, f/5.6 heavy overcast, f/4 open shade/sunset (at ISO 100, 1/125 s).

**Occlusion (§4.10.3, p.79–80):** "Ambient occlusion derivations assume Lambertian surfaces, i.e. it is 'valid' only for indirect diffuse lighting" (p.77). "Medium and large scale occlusion is **only applied on indirect lighting**." Summary table: Direct diffuse = micro-occlusion only; Indirect diffuse = micro-occlusion × min(bakedAO, HBAO); Direct specular = specular micro-occlusion; Indirect specular = micro-occlusion then `computeSpecularOcclusion(NdotV, min(bakedAO,HBAO), roughness)`. Min() of AO terms to avoid over-darkening; radiosity AO "should not be applied on indirect diffuse again" (fn 49).

## 3. Google Filament [FIL], [FIL-SRC]

- Output of every light function is **luminance** `Lout = f(v,l) E` (cd/m²). Directional light in **lux**, `Lout = f(v,l) E⊥ ⟨n·l⟩`. Point `I = Φ/4π`.
- Measured table (clear day, March, California, Sekonic L-478D), lux: Sky⊥+Sun⊥ 120 000 / 130 000 / 90 000 (10am / 12pm / 5:30pm); **Sky⊥ 20 000 / 25 000 / 9 000**; **Sun⊥ 100 000 / 105 000 / 81 000**. Midday sun test at **110 000 lx**. `LightManager.h`: "the sun's illuminance is about 100,000 lux".
- IBL in **cd/m²** ("the output unit of all our direct lighting equations"). `IndirectLight::intensity` "such that the result is in lux … (**default = 30000**)" (IndirectLight.h).
- EV100 from settings `EV100 = log2(N²/t · 100/S)`; K = **12.5** chosen ("Canon, Nikon and Sekonic"); `L = 2^(EV100−3)`; incident meter `E = 2.5·2^EV100` (flat, C=250) or `3.4·2^EV100` (hemispherical, C=340); `EV100' = EV100 − EC`.
- `Lmax = 2^EV100 · 78/(q·S) = 1.2 · 2^EV100`, q = 0.65 → `exposure(ev100) = 1.0 / (pow(2.0, ev100) * 1.2)`.
- Camera default exposure **f/16, 1/125 s, ISO 100** (Camera.h) → DERIVED EV100 = log2(256·125) = **14.97**.
- Pipeline diagram: scene luminance → normalized (exposed) luminance → white balance → colour grading → **tone mapping** → OETF. Default tone mapper **ACESLegacyToneMapper**; options ACES, FILMIC, (ColorGrading.h). "Pre-exposed lights": exposure multiplied into lights so shading fits fp16.
- AO: "Note how the ambient occlusion term is **only applied to indirect lighting**." Specular occlusion (Lagarde) "only applied to indirect lighting". AO derivations "only valid for indirect diffuse".

## 4. Unity HDRP [HDRP-PLU], [HDRP-EXP], [HDRP-CU]

- Units: candela, lumen, lux, nits, EV100.
- Natural light (lux): very bright sunlight **120 000**; bright sunlight **110 000**; blue sky midday **20 000**; overcast midday **1 000–2 000**; moonlight < 1; starry 0.002. Indoor: bedrooms 150–300, classrooms 300–500, kitchens 300–750, supermarkets 750–1 000.
- EV cheat sheet: −2 moonless … 1 moonlit, **4 interior**, 7 low sun, 10 cloudy, **14 sunlit**.
- Exposure volume defaults (Exposure.cs): mode Fixed; metering CenterWeighted; limitMin **−1**, limitMax **14** EV100; adaptation Progressive, speed dark→light **3**, light→dark **1**; **histogramPercentages (40, 90)**; targetMidGray **Grey125** (12.5%); compensation 0.
- ColorUtils.cs: `k_LightMeterCalibrationConstant = 12.5f`, `k_LensAttenuation = 0.65f`, `78 / (100 * q)` → same `1.2·2^EV100` saturation formula (`ConvertEV100ToExposure`).

## 5. Physical references — clear and overcast sky

**CIE General Sky / Kittler–Darula [KD]** (formulae verbatim from the paper):
- Extraterrestrial horizontal illuminance `Ev = 133.8 sin γs` klx (Eq.11).
- Beam on horizontal `Pv/Ev = exp(−av · m · Tv)` (Eq.15); Kasten–Young air mass `m = 1/(sin γs + 0.50572(γs+6.07995°)^−1.6364)` (Eq.16); `av = 1/(9.9 + 0.043 m)` (Eq.17); Tv = luminous turbidity.
- Zenith luminance for sunny skies `Lz = (A1Tv+A2) sin γs + 0.7(Tv+1) sin^C γs / cos^D γs + 0.04 Tv` kcd/m² (Eq.13); `Lz = (Dv/Ev)[B sin^C γs / cos^D γs + E sin γs]` (Eq.12). Table 2 clear types: 11 IV.4 (1.440, −0.750, 24.41, 4.60, 0.72, 20.76); 12 V.4 = "CIE Standard Clear Sky, low illuminance" (1.036, 0.710, 23.00, 4.43, 0.74, 18.52); 13 V.5 (1.244, −0.840, 27.45, 4.61, 0.76, 16.59) — columns A1 A2 B C D E.
- Overcast: `Lz/Dv = B/133.8` = 0.32–0.41 for uniform…CIE overcast (B 42.6–54.63).

**DERIVED at γs = 45° from [KD] Eq.11–17** (m = 1.413, av = 0.1004, Ev = 94.6 klx), CIE type 12:

| Tv (turbidity) | Direct normal (klx) | Direct on horizontal (klx) | Diffuse horizontal Dv (klx) | Dv / DNI |
|---|---|---|---|---|
| 2 (very clean) | 100.8 | 71.2 | 12.8 | 0.13 |
| 3 | 87.4 | 61.8 | 17.5 | 0.20 |
| 4 (hazier) | 75.9 | 53.7 | 22.2 | 0.29 |

(Types 11 and 13 give Dv 9.0–20.8 klx for the same Tv range.) Tv is a site/day input, not a constant — it is shown as a sweep, not chosen.

**Overcast values (sources disagree, see below):** HDRP overcast midday 1 000–2 000 lx [HDRP-PLU]; Frostbite overcast sky ≈ 2000 cd/m² [FB p.59] → DERIVED horizontal E of a uniform sky = π·L ≈ 6 300 lx; ANSI "heavy overcast" EV100 12 [EV-WP] (→ L = 2^9 = 512 cd/m² scene luminance).

**Eye / camera adaptation**
- CIECAM02 degree of adaptation `D = F[1 − (1/3.6) e^(−(LA+42)/92)]`, F = 1.0 average / 0.9 dim / 0.8 dark surround; `LA = LW/5` (grey world) [CAM02], primary CIE 159:2004. (Chromatic adaptation, not a temporal speed.)
- Temporal adaptation in engines: UE speed up 3 / down 1 f-stops/s [UE-CES]; HDRP dark→light 3 / light→dark 1 [HDRP-EXP]. Same numbers.

**Scene EV100 references** [EV-WP] (ANSI PH2.7): full/hazy sun, distinct shadows **EV 15** (sand/snow 16); heavy overcast 12; **offices and work areas EV 7–8**; home interiors 5–7. Luminance `L = 2^(EV−3)`, illuminance `E = 2.5·2^EV` (C=250).

## 6. Tone mapping — one operator, once, after exposure

- UE: ACES-based filmic, last post stage [UE-TM]. Filament: ACESLegacy default, after exposure + WB + grading, before OETF [FIL], [FIL-SRC]. Frostbite: single LUT on exposed light (WB+grade+tonemap+gamma) [FB p.86].
- Khronos PBR Neutral: input is scene-referred linear **after exposure**; Ks = 0.8−0.04, Kd = 0.15; reproduces base colour exactly for 0.08 ≤ RGB ≤ 0.8 under unit white light [KPN].
- three.js: `toneMappingExposure` multiplies colour inside the tone-map function (`LinearToneMapping`: `saturate(toneMappingExposure * color)`; `ACESFilmicToneMapping`: `color *= toneMappingExposure / 0.6` — "1/0.6 is subjective, see #19621"); AgX and Neutral also available [THREE tonemapping_pars_fragment.glsl.js]. So in three.js, exposure = `toneMappingExposure` and the saturation-based value `1/(1.2·2^EV100)` goes there (ACES then applies an extra 1/0.6 — see Disagreements).

## 7. Ambient occlusion — indirect only, world radius

- UE: affects "non direct lighting"; radius in unreal units (cm), world-space flag [UE-PPS].
- Frostbite: medium/large AO only on indirect; direct gets only micro-occlusion; specular AO derived via computeSpecularOcclusion [FB p.79–80].
- Filament: AO and specular occlusion "only applied to indirect lighting" [FIL].
- three.js (the target): `aomap_fragment` multiplies only `reflectedLight.indirectDiffuse` (and indirect specular via `computeSpecularOcclusion`, clearcoat/sheen indirect) — never direct [THREE aomap_fragment.glsl.js].

## three.js mapping (for the still renderer)

- PointLight intensity in **candela**, `power (lm) = intensity · 4π`; SpotLight `power = intensity · π` (Frostbite convention); RectAreaLight intensity in **nits**, `power = intensity · w · h · π`; decay default 2 [THREE lights/*.js].
- Direct: `irradiance = dotNL * directLight.color` → diffuse `irradiance * BRDF_Lambert(albedo)`, `BRDF_Lambert = RECIPROCAL_PI * diffuseColor` → **L = albedo · E / π** (so DirectionalLight intensity behaves as lux if the chain is followed). Ambient/Hemisphere lights feed `irradiance` into the indirect-diffuse path the same way [THREE lights_physical_pars_fragment, common, lights_pars_begin]. DirectionalLight doc gives no unit — GAP in three.js docs, but the maths is the Filament form.

---

## THE COMMON CHAIN

1. **Sources in photometric units, entered once.** Sun = directional **lux ⊥** (E⊥); sky / IBL = **luminance cd/m²** (or its integrated lux); punctual = **lumens → candela** (`I = Φ/4π` point, `Φ = πI` spot); area/emissive = **nits** or EV (`L = 2^(EV−3)`). [FB Table 8, FIL, UE-PLU, HDRP-PLU]
2. **Transport: each path counted once.** `Lout = f(v,l) · E`; Lambert `f = albedo/π` → `L = albedo · E⊥ · ⟨n·l⟩ / π` for direct; indirect diffuse = `albedo/π · E_indirect`. Sun and sky are separate terms (sky excludes the sun, sun excludes the sky — Table 11 measures them that way). [FB Eq.18/28, FIL]
3. **AO multiplies indirect only** (diffuse, and specular via specular-occlusion), radius in world units. [FB p.79, FIL, UE-PPS, THREE]
4. **Meter:** histogram of scene luminance, trim low/high percentiles, take log-average → `EV100 = log2(Lavg · 100 / 12.5)`; compensation `EV100' = EV100 − EC`; clamp [min,max]; adapt at ≈3 stops/s up, 1 stop/s down. [FB p.84, FIL, UE-PPS, HDRP-EXP]
5. **Expose:** `exposure = 1 / (1.2 · 2^EV100)` (saturation-based, 78/(S·q), q=0.65) applied to scene luminance once. [FB Listing 28, FIL, HDRP-CU]
6. **One tone curve** (ACES / AgX / PBR Neutral) applied once after exposure, then OETF (sRGB). [UE-TM, FIL, FB p.86, KPN]

## Reference numbers

| Quantity | Value | Source |
|---|---|---|
| Sun illuminance ⊥, zenith (engine setting) | 120 000 lx | [UE-SKYATM] |
| Sun ⊥ theoretical, no atmosphere | 105 000–114 000 lx | [FB fn29 p.37] |
| Sun ⊥ measured | 100 000–105 000 lx (CA, Mar); 106 500–123 100 lx (Stockholm, Jul) | [FIL], [FB Tab.11] |
| Sun (HDRP table) | 110 000 bright / 120 000 very bright lx | [HDRP-PLU] |
| Sky, blue, midday | 20 000 lx (HDRP); Sky⊥ 20 000–25 000 (Filament); sky horiz 19 300–29 000 (Frostbite); ≈30 000 (UE: 20% of 150 000) | [HDRP-PLU], [FIL], [FB], [UE-SKYATM] |
| Sky diffuse horizontal at 45° sun (CIE clear type 12) | 12.8 / 17.5 / 22.2 klx for Tv 2/3/4; DNI 100.8 / 87.4 / 75.9 klx | DERIVED from [KD] Eq.11–17 |
| Clear sky luminance | ≈ 8000 cd/m² | [FB p.59] |
| Overcast | 1 000–2 000 lx (HDRP); ≈2000 cd/m² sky (Frostbite → ≈6 300 lx if uniform, DERIVED) | [HDRP-PLU], [FB p.59] |
| EV100 sunny exterior | 15 (ANSI); 14 (HDRP); 14.97 = Filament default f/16 1/125 ISO100 (Sunny 16) | [EV-WP], [HDRP-PLU], [FIL-SRC] |
| EV100 office interior | 7–8 (ANSI offices); 4 (HDRP "interior") | [EV-WP], [HDRP-PLU] |
| EV100 heavy overcast | 12 | [EV-WP] |
| K (reflected-light meter) | 12.5 (range 10.6–13.4 per ISO 2720; 14 Pentax/Minolta) | [FB p.27], [FIL], [HDRP-CU] |
| Saturation constant | 78/(S·q), S=100, q=0.65 → 1.2 | [FB], [FIL], [HDRP-CU] |
| Exposure | 1/(1.2·2^EV100) | [FB Listing 28], [FIL] |
| Histogram % | UE recommend low 70–80, high 80–95 (ctor 10/90); HDRP default 40–90 | [UE-PPS], [UE-CES], [HDRP-EXP] |
| Adaptation speed | up 3, down 1 stop/s (UE and HDRP) | [UE-CES], [HDRP-EXP] |
| EV100 clamp defaults | HDRP −1..14; UE legacy 0.03..8 cd/m² | [HDRP-EXP], [UE-CES] |
| Filament IBL default | 30 000 (lux scale) | [FIL-SRC IndirectLight.h] |
| Luminous efficacy (Filament) | 683 lm/W × efficiency | [FIL-SRC LightManager.h] |

## Where engines / sources disagree

1. **Sun lux:** UE 120 000 (zenith) vs Filament 100 000–110 000 vs Frostbite 105–114k theoretical but 123 100 measured ⊥ (Stockholm). Frostbite's measured ⊥ exceeds its own "no-atmosphere" bound — measurement condition/instrument, not reconciled in the paper.
2. **Sky share:** UE "20% of 150 000" (≈30 klx, sun at zenith) vs Filament Sky⊥ 20–25 klx vs HDRP 20 klx vs CIE-derived 13–22 klx horizontal at 45°. Depends on turbidity and on sensor orientation (⊥ vs horizontal).
3. **Calibration constant:** Frostbite/Filament/HDRP K = 12.5 (12.7% target, half-stop headroom); UE's (deprecated) calibration constant is "18% albedo, default 18.0" and its doc speaks of 18% grey; HDRP offers Grey125 target (12.5%). K = 12.5 appears in no Epic page found.
4. **Histogram percentiles:** UE 70–80 / 80–95 recommended (ctor 10/90) vs HDRP 40–90 default. Frostbite states "histogram method" with no percentiles published.
5. **Metering what:** all meter pixel luminance (includes albedo); Frostbite notes this makes 10%- and 90%-grey scenes identical, and that metering pre-albedo luminance is the alternative (not adopted for cost).
6. **Interior EV:** ANSI offices EV 7–8 vs HDRP "interior 4" — HDRP's cheat-sheet label is dimmer by 3–4 stops. (DERIVED check: 500 lx desk, albedo 0.5 → L = 0.5·500/π ≈ 80 cd/m² → EV100 = log2(80·8) ≈ 9.3 — above both.)
7. **Overcast:** HDRP 1 000–2 000 lx vs Frostbite 2000 cd/m² sky (≈6 300 lx) vs ANSI heavy overcast EV 12 (scene L ≈ 512 cd/m²). A factor 3–6 spread.
8. **Exposure compensation default:** UE 4.25+ default EC = 1.0 (brighter, "original too dark"); HDRP/Frostbite/Filament 0.
9. **three.js ACES** multiplies exposure by an extra 1/0.6 ("subjective", #19621); Linear/AgX/Neutral do not — so the same `toneMappingExposure` gives different brightness per operator. Engines apply exposure before the curve, not inside it.
10. **AO on direct light:** all agree medium/large AO is indirect-only; Frostbite additionally applies baked *micro*-occlusion (from albedo/f0) to direct light too.
11. **Spot power:** exact cone `Φ = 2π(1−cos θ/2) I` vs Frostbite/three.js `Φ = π I` vs UE's per-angle table (1.76 sr at 44°).

## GAPs (asked, not found in a primary source)
- UE explicit statement that the sky-light Real Time Capture excludes the sun disk (no-double-count rule). Only secondary blogs; not asserted.
- UE 5.x shipped numeric defaults for Min/Max EV100 and histogram % (only the recommendation ranges and 4.27 Python constructor values were found; UE source is not publicly fetchable).
- An engine-published eye-adaptation *model* beyond the up/down stop-per-second rate (none cite CIECAM02 for temporal adaptation).
