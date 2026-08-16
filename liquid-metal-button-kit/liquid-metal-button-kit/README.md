# Liquid Metal Button Kit

ชุดไฟล์นี้แยกมาจากโปรเจค Better Trade 2026 เพื่อให้ AI หรือนักพัฒนานำปุ่ม Liquid metal ไปใช้กับโปรเจคอื่นได้ใกล้ต้นฉบับที่สุด

## โครงสร้างไฟล์

```text
liquid-metal-button-kit/
  README.md
  js/
    liquid-metal-button.js
    liquid-metal-cta.js
  vendor/
    paper-shaders/
      shader-sizing.js
      shader-mount.js
      shader-utils.js
      vertex-shader.js
      shaders/
        liquid-metal.js
```

## ไฟล์ที่จำเป็น

ต้องคัดลอกทั้งหมดนี้ไปยังโปรเจคใหม่:

```text
js/liquid-metal-button.js
vendor/paper-shaders/shader-sizing.js
vendor/paper-shaders/shader-mount.js
vendor/paper-shaders/shader-utils.js
vendor/paper-shaders/vertex-shader.js
vendor/paper-shaders/shaders/liquid-metal.js
```

ไฟล์ตัวอย่างการ mount:

```text
js/liquid-metal-cta.js
```

## Import path

ไฟล์ `js/liquid-metal-button.js` import dependency แบบนี้:

```js
import { ShaderMount } from '../vendor/paper-shaders/shader-mount.js';
import { liquidMetalFragmentShader } from '../vendor/paper-shaders/shaders/liquid-metal.js';
```

ถ้าโปรเจคใหม่เปลี่ยนโครงสร้างโฟลเดอร์ ต้องแก้ path สองบรรทัดนี้ให้ตรง

## HTML ขั้นต่ำ

เพิ่ม target element:

```html
<div id="cta-slot"></div>
```

แล้ว import script แบบ module:

```html
<script type="module" src="js/liquid-metal-cta.js"></script>
```

## CSS ที่ควรมี

`liquid-metal-button.js` inject CSS หลักเองแล้ว แต่ควรเพิ่ม focus state ใน CSS ของโปรเจค:

```css
.lmb button:focus-visible {
  outline: 2px solid #2b6cff;
  outline-offset: 3px;
}
```

## Config ต้นฉบับ Better Trade

ใช้ config นี้ถ้าต้องการหน้าตาเหมือนปุ่มหลักใน hero:

```js
const desktopOptions = {
  label: 'ลงทะเบียน',
  height: 56,
  fontSize: 20,
  fontWeight: 400,
  fontFamily: "'FC Minimal'",
  textColor: '#111318',
  textShadow: 'none',
  pillBackground: 'linear-gradient(180deg, #ffffff 0%, #f3f4f8 55%, #e4e7ee 100%)',
  rimPalette: 'linear-gradient(90deg, #00d4fe, #1f87e6, #113cf3, #722df4, #e63bd8, #f79319)',
  paddingX: 48,
  rim: 3,
  metalShiftRed: 0.2,
  metalShiftBlue: 0.2,
};
```

Responsive ที่ `max-width: 575px`:

```js
const compactOptions = {
  height: 49,
  fontSize: 18,
  paddingX: 42,
};
```

## Font

ปุ่มต้นฉบับใช้ `FC Minimal`

ถ้าโปรเจคใหม่ไม่มีฟอนต์นี้:

1. ติดตั้ง/โหลดฟอนต์ `FC Minimal` ในโปรเจคใหม่
2. หรือเปลี่ยน `fontFamily` ให้ตรงกับฟอนต์ของโปรเจคใหม่

เพื่อให้ width คำนวณจาก glyph จริง ควรรอ font โหลดก่อน mount:

```js
(document.fonts ? document.fonts.ready : Promise.resolve()).then(() => {
  // mount button here
});
```

## Behavior ที่ต้องเหมือนต้นฉบับ

ปุ่มต้องมี behavior เหล่านี้:

- Liquid metal rim เป็น shader canvas รอบปุ่ม
- ด้านในเป็น pill gradient ขาว
- Hover แล้ว shader ขยับเร็วขึ้น
- Mouse leave แล้ว shader กลับความเร็วปกติ
- Press แล้วปุ่มยุบเล็กน้อย
- Click แล้วมี ripple
- WebGL fail แล้วมี fallback rim gradient
- Focus visible มี outline
- Mobile `575px` ลงมา ปุ่มเล็กลงประมาณ 10-15% และ font เป็น `18px`

## คำสั่งสำหรับให้ AI ย้ายไปโปรเจคอื่น

ใช้ prompt นี้ได้:

```text
ช่วยนำ Liquid Metal Button Kit นี้ไปใช้ในโปรเจคปัจจุบันให้เหมือน Better Trade 2026

ให้ทำตามนี้:
1. คัดลอกไฟล์ js/liquid-metal-button.js
2. คัดลอก vendor/paper-shaders/shader-mount.js
3. คัดลอก vendor/paper-shaders/shader-sizing.js
4. คัดลอก vendor/paper-shaders/shader-utils.js
5. คัดลอก vendor/paper-shaders/vertex-shader.js
6. คัดลอก vendor/paper-shaders/shaders/liquid-metal.js
7. เพิ่มหรือปรับ js/liquid-metal-cta.js เพื่อ mount ปุ่มลง #cta-slot
8. ตรวจ import path ใน liquid-metal-button.js ให้ถูกกับโครงสร้างโปรเจคใหม่
9. ใช้ config desktopOptions และ compactOptions จาก README นี้
10. รอ document.fonts.ready ก่อน mount
11. เพิ่ม CSS focus-visible สำหรับ .lmb button
12. ตรวจด้วย browser ว่า hover, press, ripple, fallback, และ responsive ทำงาน
13. ห้ามเปลี่ยน shader parameters ถ้าไม่ได้รับคำสั่ง เพราะต้องการให้เหมือนต้นฉบับ
```

## Checklist สำหรับ QA

หลังติดตั้งในโปรเจคใหม่ ให้ตรวจ:

- ปุ่ม render ใน `#cta-slot`
- ข้อความไม่ล้น pill
- ขนาด desktop ใกล้ `179 x 56px` สำหรับข้อความ `ลงทะเบียน`
- ขนาด `575px` ลงมาใกล้ `158 x 49px`
- Font desktop `20px`
- Font mobile `18px`
- Hover แล้ว rim เคลื่อนไหวและลูกเล่นยังลื่น
- Click แล้ว ripple แสดง
- ไม่มี horizontal overflow
- Console ไม่มี error จาก shader import path
