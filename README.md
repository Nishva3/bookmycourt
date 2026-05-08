# 🏸 BookMyCourt

A full-stack **Sports Court Booking Platform** built with **React (TypeScript)** and **Spring Boot (Java)**. Users can browse sports, select venues, pick courts, choose time slots with dynamic pricing, and confirm bookings — all in real time. Admins get a full management dashboard.

---

## 🚀 Features

### 👤 User Side
- **Sign Up / Login** with email and password
- **Browse 6 Sports** — Cricket, Badminton, Basketball, Volleyball, Pickleball, Go-Karting
- **Select Venue** — 3 pre-seeded venues across Ahmedabad
- **Pick a Court** — Real-time court availability per venue and sport
- **Choose Time Slot** — Color-coded slots (green = available, red = booked)
- **Dynamic Pricing** — Weekday vs weekend pricing, fetched from backend
- **Booking Confirmation** — Receipt with all details + print option

### 🔐 Admin Dashboard
- **Dashboard Overview** — Metrics for Users, Sports, Courts, and Bookings
- **User Management** — Search, filter, and export user list
- **Sports Management** — Add/delete sports with court count tracking
- **Venue & Court Management** — Add venues and assign courts with price plans
- **Price Plan Management** — Create/delete time-slot-based pricing (weekday/weekend)
- **Booking Management** — View all bookings with sport/status filters
- **Print/Export** — Print-optimized views for reports

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, TypeScript, Tailwind CSS |
| **Backend** | Spring Boot 3.2, Java 17 |
| **Database** | H2 (In-Memory) with JPA/Hibernate |
| **Icons** | Font Awesome 6 |
| **Auth** | JWT (configured), plain-text login for demo |

---

## 📁 Project Structure

```
bookmycourt/
├── bookmycourt_backend/          # Spring Boot Backend
│   ├── src/main/java/com/example/bookmycourt/
│   │   └── UserAuthApp.java      # All entities, repos, controllers & seed data
│   ├── src/main/resources/
│   │   └── application.properties
│   └── pom.xml
│
├── my-dashboard/                  # React Frontend
│   ├── src/
│   │   ├── App.tsx               # Main application (all components)
│   │   ├── index.tsx             # Entry point
│   │   └── index.css             # Global styles + Tailwind
│   ├── package.json
│   └── tailwind.config.js
│
└── README.md
```

---

## ⚙️ Getting Started

### Prerequisites
- **Java 17+** — [Download](https://adoptium.net/)
- **Node.js 16+** & npm — [Download](https://nodejs.org/)

### 1. Start the Backend

```bash
cd bookmycourt_backend
./mvnw spring-boot:run        # Linux/Mac
.\mvnw.cmd spring-boot:run    # Windows
```

> Backend runs on **http://localhost:8080**
> H2 Console: **http://localhost:8080/h2-console** (JDBC URL: `jdbc:h2:mem:bookmycourt_db`)

### 2. Start the Frontend

```bash
cd my-dashboard
npm install
npm start
```

> Frontend runs on **http://localhost:3000**

---

## 🔑 Default Credentials

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@bookmycourt.com` | `admin123` |
| **User** | Sign up to create one | — |

---

## 📊 Seeded Data (Auto-loaded on Backend Start)

| Entity | Count | Examples |
|---|---|---|
| **Sports** | 6 | Cricket, Badminton, Basketball, Volleyball, Pickleball, Go-Karting |
| **Venues** | 3 | Sports Arena - Satellite, PlayZone - SG Highway, GameOn Sports Complex |
| **Courts** | 21 | Distributed across all venues and sports |
| **Price Plans** | 4 | 09:00 AM (₹400/₹500), 10:00 AM (₹450/₹550), 07:00 PM (₹600/₹700), 09:00 PM (₹800/₹900) |

---

## 🔌 API Endpoints

### User APIs
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/users/signup` | Register new user |
| POST | `/api/users/login` | Login user |
| GET | `/api/users/all` | Get all users (admin) |

### Booking APIs
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/bookings/{userId}` | Create a booking |
| GET | `/api/bookings/admin` | Get all bookings |
| GET | `/api/bookings/price` | Get dynamic price for court+date+time |
| GET | `/api/bookings/courts/by-venue-sport` | Get courts by venue & sport |
| GET | `/api/bookings/booked-slots-by-court` | Get booked slots for a court on a date |
| PUT | `/api/bookings/{id}/status` | Update booking status |

### Admin APIs
| Method | Endpoint | Description |
|---|---|---|
| GET/POST/DELETE | `/api/admin/sports` | CRUD for sports |
| GET/POST | `/api/admin/venues` | CRUD for venues |
| GET/POST | `/api/admin/courts` | CRUD for courts |
| GET/POST/DELETE | `/api/admin/prices` | CRUD for price plans |

---

## 📸 Screenshots

<img width="1920" height="912" alt="01_login_page" src="https://github.com/user-attachments/assets/e26a05d8-ed2e-448d-93e9-10bf0fff5fb4" />

<img width="1920" height="912" alt="02_sport_selection" src="https://github.com/user-attachments/assets/958e3590-65e5-4840-abcd-2f6fdb977662" />

<img width="1920" height="912" alt="03_booking_page" src="https://github.com/user-attachments/assets/c90887e8-cdf3-414c-bb41-348aad3138ab" />

<img width="1920" height="912" alt="04_court_selection" src="https://github.com/user-attachments/assets/0086f021-fd0b-45e8-be16-900fed471810" />

<img width="1920" height="912" alt="05_admin_dashboard" src="https://github.com/user-attachments/assets/d2911654-2b24-445a-a6c8-bff9109d0ad2" />

<img width="1920" height="912" alt="06_admin_users" src="https://github.com/user-attachments/assets/12a48f37-ca50-4c85-9d0d-572981158f13" />

<img width="1920" height="912" alt="07_admin_venues" src="https://github.com/user-attachments/assets/d674e65b-0fcd-4518-8a2d-933c8c694168" />

---

## 📄 License

This project is for educational and portfolio purposes.
