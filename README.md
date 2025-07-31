# แอพจดบันทึกการเบิก

แอพพลิเคชันสำหรับบันทึกค่าใช้จ่ายรายเดือน ออกแบบสำหรับใช้งานบนมือถือ

## คุณสมบัติ

- 📱 **UI แบบมือถือ** - ออกแบบให้ใช้งานง่ายบนมือถือ
- 📊 **บันทึกค่าใช้จ่าย** - บันทึกการซื้อของและค่าบริการ
- 📷 **แนบใบเสร็จ** - อัปโหลดรูปภาพใบเสร็จได้
- 📈 **สรุปยอดรวม** - คำนวณยอดรวมรายเดือนอัตโนมัติ
- 💾 **เก็บข้อมูล** - ใช้ Firebase และ localStorage
- 🎨 **UI สวยงาม** - ใช้ Bootstrap และ gradient design

## การติดตั้ง

1. **Clone โปรเจค**
   ```bash
   git clone [repository-url]
   cd expense-tracker
   ```

2. **ตั้งค่า Firebase** (ไม่บังคับ)
   - สร้างโปรเจค Firebase ใหม่
   - เปิดใช้งาน Firestore Database
   - แก้ไขไฟล์ `app.js` และใส่ Firebase config ของคุณ

3. **รันแอพ**
   - เปิดไฟล์ `index.html` ในเบราว์เซอร์
   - หรือใช้ local server:
   ```bash
   python -m http.server 8000
   ```

## การใช้งาน

### หน้าหลัก
- **รายการ** - ดูรายการค่าใช้จ่ายทั้งหมด
- **เพิ่ม** - เพิ่มรายการค่าใช้จ่ายใหม่
- **สรุป** - ดูสรุปค่าใช้จ่ายแยกตามประเภท

### เพิ่มรายการค่าใช้จ่าย
1. เลือกประเภท: ซื้อของ หรือ ค่าบริการ
2. กรอกรายละเอียด
3. ใส่จำนวนเงิน
4. เลือกวันที่
5. แนบใบเสร็จ (ไม่บังคับ)
6. กดบันทึก

### ฟีเจอร์พิเศษ
- **คำนวณอัตโนมัติ** - ยอดรวมจะคำนวณอัตโนมัติ
- **แยกประเภท** - แสดงยอดรวมแยกตามประเภท
- **เรียงลำดับ** - รายการล่าสุดแสดงด้านบน
- **ลบรายการ** - สามารถลบรายการที่ไม่ต้องการได้

## เทคโนโลยีที่ใช้

- **Frontend**: HTML5, CSS3, JavaScript
- **Framework**: Vue.js 3
- **UI Library**: Bootstrap 5
- **Icons**: Font Awesome
- **Database**: Firebase Firestore (optional)
- **Storage**: localStorage (fallback)

## โครงสร้างไฟล์

```
expense-tracker/
├── index.html          # ไฟล์หลัก
├── app.js             # Vue.js และ Firebase logic
└── README.md          # คู่มือการใช้งาน
```

## การปรับแต่ง

### เปลี่ยน Firebase Config
แก้ไขไฟล์ `app.js`:
```javascript
const firebaseConfig = {
    apiKey: "your-api-key",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    // ... config อื่นๆ
};
```

### เปลี่ยนธีมสี
แก้ไข CSS ใน `index.html`:
```css
:root {
    --primary-color: #667eea;
    --secondary-color: #764ba2;
}
```

## หมายเหตุ

- แอพจะทำงานได้แม้ไม่มี Firebase (ใช้ localStorage)
- ข้อมูลจะถูกเก็บในเบราว์เซอร์ของผู้ใช้
- รองรับการใช้งานแบบ offline

## การพัฒนาเพิ่มเติม

- เพิ่มระบบ login
- เพิ่มการ export ข้อมูล
- เพิ่มกราฟแสดงค่าใช้จ่าย
- เพิ่มการแจ้งเตือน
- เพิ่มการแบ่งหมวดหมู่ย่อย

## License

MIT License 