# Reliability Lab – ระบบแนะนำห้องแลป

เว็บสำหรับแสดงข้อมูลห้อง Reliability Lab แยกโครงสร้าง Frontend และ Backend พร้อม Web Server ในตัว

---

## โครงสร้างโปรเจกต์ (Frontend & Backend)

```text
Line_Official/
├── frontend/                     # ส่วนหน้าเว็บ (Client)
│   ├── assets/                   # รูปภาพและเอกสารคู่มือ
│   ├── css/
│   │   └── style.css             # สไตล์ทั้งหมด
│   ├── js/
│   │   ├── app.js                # จัดการหน้าเว็บและการดึงข้อมูลจาก API
│   │   └── data.js               # ข้อมูลสำรอง (Offline fallback)
│   └── index.html                # โครงสร้างหน้าเว็บหลัก
├── backend/                      # ส่วนเซิร์ฟเวอร์ (API & Web Server)
│   ├── data/
│   │   └── equipments.json       # ฐานข้อมูลเครื่องมือ (JSON)
│   ├── package.json              # Backend dependencies (Express, CORS)
│   └── server.js                 # Web Server & REST API
├── package.json                  # Root runner scripts
├── .gitignore
└── README.md
```

---

## วิธีรันระบบ

### 1. รัน Backend Web Server (แนะนำ)
เปิด Terminal ที่โฟลเดอร์โปรเจกต์ แล้วรันคำสั่ง:
```bash
npm start
```
*(หรือ `node backend/server.js`)*

เปิดเบราว์เซอร์ไปที่: **http://localhost:3000**

> เซิร์ฟเวอร์นี้จะทำหน้าที่เสิร์ฟทั้งหน้าเว็บ Frontend และ REST API พร้อมกัน สามารถรันได้ทันทีโดยไม่ต้องติดตั้งไลบรารีเพิ่ม (มี Built-in HTTP Server) หรือหากต้องการติดตั้ง Express ให้รัน `cd backend && npm install`

### 2. เปิด Frontend ผ่าน VS Code Live Server
1. คลิกขวาที่ไฟล์ `frontend/index.html`
2. เลือก **Open with Live Server**

---

## Backend REST API Endpoints

| Method | Endpoint | รายละเอียด |
|---|---|---|
| `GET` | `/api/health` | ตรวจสอบสถานะการทำงานของเซิร์ฟเวอร์ |
| `GET` | `/api/equipments` | ดึงรายการเครื่องมือทั้งหมด |
| `GET` | `/api/equipments?place=LPN1` | กรองเครื่องมือตามสถานที่ (`LPN1` / `LPN2`) |
| `GET` | `/api/equipments?category=อุณหภูมิ` | กรองตามหมวดหมู่ |
| `GET` | `/api/equipments?search=...` | ค้นหาชื่อเครื่องมือ |
| `GET` | `/api/categories?place=LPN1` | ดึงรายชื่อหมวดหมู่ของสถานที่ |
| `GET` | `/api/equipments/:id` | ดึงข้อมูลเครื่องมือตาม ID |
| `POST` | `/api/equipments` | เพิ่มข้อมูลเครื่องมือใหม่ (บันทึกลง `equipments.json`) |
| `PUT` | `/api/equipments/:id` | แก้ไขข้อมูลเครื่องมือ |
| `DELETE` | `/api/equipments/:id` | ลบข้อมูลเครื่องมือ |
