# Airbnb Predictive Booking Analytics System — Project Context

## 📌 Project Overview

A custom web-based Predictive Booking Analytics System built exclusively for a **single Traveller's Inn business**. It serves three types of users: an Admin who manages operations, an Owner who monitors performance and forecasts, and Customers who browse and book rooms.

The bookings that customers make inside the system accumulate over time and become the data that powers the machine learning prediction model — meaning the system gets smarter and more accurate the longer it is used.

---

## 👥 User Roles

### 🔴 Admin
The system operator responsible for day-to-day management of the platform.

**Account & User Management**
- View and manage all registered customer accounts
- Activate or deactivate customer accounts
- Reset customer passwords if needed

**Room Management**
- Add, edit, and deactivate room listings
- Set room type, capacity, price per night, and description
- View room availability calendar

**Booking Management**
- View all bookings across all customers
- Confirm, modify, or cancel bookings
- Track booking status: Pending, Confirmed, Cancelled, Completed
- View full audit history of all booking changes

**Reports**
- Generate and export PDF/Excel reports by date range
- Summary reports covering occupancy, revenue, and booking volume

**System Settings**
- Manage system-wide configurations
- Manage room types and categories

---

### 🟡 Traveller's Inn Owner
The business owner who monitors property performance and uses analytics to make decisions. Does not manage day-to-day operations but has full visibility into how the business is performing.

**Dashboard**
- Key metric cards: total bookings, occupancy rate, average revenue, cancellation rate
- Occupancy rate over time (line chart)
- Bookings by month and week (bar chart)
- Peak season heatmap (calendar-style view)
- Room type booking breakdown (pie/donut chart)
- Revenue trend showing actual vs. predicted side by side

**Predictive Analytics**
- Forecast future bookings for the next 7, 30, and 90 days
- View predicted occupancy rate per date range
- Confidence intervals on predictions
- Model improves automatically over time as more booking data accumulates

**Trend Analysis**
- Automatically flagged peak and low-demand periods
- Month-over-month and year-over-year performance comparisons
- Seasonal pattern highlights

**Actual vs. Predicted Comparison**
- Side-by-side view of forecasted vs. actual bookings
- Accuracy metrics in plain language (e.g. "Predictions were off by ~3 bookings on average")

**Reports**
- Generate and export PDF/Excel reports by date range
- Summary reports: occupancy, revenue, trends, top-performing periods

---

### 🟢 Customer (Guest)
The person looking to book a stay at the Traveller's Inn.

**Account**
- Register and log in to a personal account
- View and edit profile information

**Room Browsing**
- Browse available rooms by date and room type
- View room details: photos, description, capacity, price per night, amenities
- Check real-time availability

**Booking**
- Select a room and submit a booking reservation
- Choose check-in and check-out dates
- Receive booking confirmation after Admin approval

**Booking Management**
- View current and past bookings
- Track booking status: Pending, Confirmed, Cancelled, Completed
- Cancel a booking subject to cancellation policy

---

## 🛠️ Tech Stack

| Layer        | Technology                        |
|--------------|-----------------------------------|
| Frontend     | React.js + Recharts or Chart.js   |
| Backend      | Python (FastAPI or Django)        |
| ML Model     | Facebook Prophet or scikit-learn  |
| Database     | PostgreSQL                        |
| Auth         | JWT-based authentication          |
| Export       | ReportLab (PDF), openpyxl (Excel) |

---

## 📅 Development Phases

**Phase 1 — Foundation**
User authentication, role-based access, room management, database schema.

**Phase 2 — Customer Booking Flow**
Room browsing, booking creation, booking status tracking, customer dashboard.

**Phase 3 — Core Analytics**
Owner dashboard with historical charts and trend analysis.

**Phase 4 — Prediction Module**
ML model integration, forecasting view, actual vs. predicted comparison.

**Phase 5 — Reports & Polish**
Export functionality, usability testing, and UI refinements.

---

## 📦 Dependencies & requirements.txt Rules

### ⚠️ IMPORTANT — Always follow these rules:

1. A `requirements.txt` file **must exist** at the root of the project at all times.
2. **Every time a new Python dependency is added** to the project (installed via pip or referenced in code), it must be immediately added to `requirements.txt`.
3. `requirements.txt` must always reflect the **exact current state** of all dependencies used in the project.
4. Pin versions where possible (e.g. `fastapi==0.110.0`) to ensure reproducibility.
5. Group dependencies with comments for readability (e.g. `# ML`, `# Export`, `# Auth`).

### Initial requirements.txt template (update as project grows):

```
# Web Framework
fastapi==0.110.0
uvicorn==0.29.0

# Database
psycopg2-binary==2.9.9
sqlalchemy==2.0.29
alembic==1.13.1

# Authentication
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.9

# ML / Prediction
prophet==1.1.5
scikit-learn==1.4.2
pandas==2.2.2
numpy==1.26.4

# Export
reportlab==4.1.0
openpyxl==3.1.2

# Utilities
python-dotenv==1.0.1
pydantic==2.7.0
```

---

## 📁 Project Structure (Recommended)

```
travellers-inn/
├── backend/
│   ├── main.py
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── ml/
│   └── utils/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── utils/
│   └── public/
├── requirements.txt        ← always keep updated
├── CLAUDE.md               ← this file
└── .env.example
```

---

## 🔑 Key Business Rules

- This system is for **one business only** — no multi-tenant support needed.
- There is **one Owner** account, managed separately from Admin.
- Customers self-register; Admin can activate or deactivate accounts.
- Booking status flow: `Pending → Confirmed → Completed` or `Pending/Confirmed → Cancelled`.
- The ML prediction model trains on bookings stored in the system's own database.
- Predictions cover 7-day, 30-day, and 90-day horizons.
