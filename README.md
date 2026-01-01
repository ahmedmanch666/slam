# نظام مدير المناقصات (Tender Manager System)

## 📌 Project Overview

**Tender Manager** is a comprehensive web application designed to streamline the management of tenders, contracts, companies, and related tasks. Built with a focus on usability and Arabic language support (RTL), it provides a centralized dashboard for tracking the entire lifecycle of a tender, from creation to awarding and contract signing.

## 🚀 Tech Stack

### Frontend

- **Framework:** [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Language:** JavaScript
- **Features:** Mobile-first responsive design, Dark/Light mode support (future-ready), dynamic modals.

### Backend

- **Runtime:** [Node.js](https://nodejs.org/) (Serverless Architecture via Vercel Functions).
- **API:** RESTful endpoints in `/api`.
- **Database:** SQLite (managed via **Turso** / `libSQL`).
- **ORM/Query:** Direct SQL queries via `@libsql/client`.
- **Authentication:** JWT (JSON Web Tokens).

## ✨ Key Features

### 1. 📊 Dashboard

- **Overview Stats:** Real-time counters for Companies, Tenders, Contracts, and Tasks.
- **Quick Actions:** One-click access to create new entities (auto-opening modals).
- **Recent Activity:** View the latest tenders and their status (Won, Lost, Pending).

### 2. 📋 Tenders Management

- **Full Lifecycle Logic:** Track status (Open, Pending, Closed, Won, Lost).
- **Detailed View:** Dedicated tabs for:
  - **General Info:** Dates, Values, Instructions.
  - **Items:** Specifications, Quantities, Delivery Schedules.
  - **Competitors:** Track competitor prices and winners.
  - **Attachments:** Image gallery with robust error handling (fallback placeholders).
  - **Invoices:** Financial tracking and VAT calculations.
  - **Reports:** Printable reports and Word export.

### 3. 🏢 Companies & Contracts

- **Companies Database:** Centrally manage supplier/client details.
- **Contracts Module:** Link tenders to contracts with value tracking and status (Draft, Active, Completed).

### 4. ✅ Task Management

- Simple to-do list integrated with other modules to track deadlines and responsibilities.

### 5. 🌍 Localization & Currency

- **Language:** Fully Arabic interface (RTL).
- **Currency:** Egyptian Pound (ج.م) used throughout the application.

## 🛠️ Setup & Installation

### Prerequisites

- Node.js (v18+ recommended)
- NPM

### Installation Steps

1. **Clone the repository**

    ```bash
    git clone <repository-url>
    cd slam
    ```

2. **Install Dependencies**
    - **Root/Backend:**

        ```bash
        npm install
        ```

    - **Frontend:**

        ```bash
        cd frontend
        npm install
        ```

3. **Environment Configuration**
    Create a `.env` file in the root directory with the following keys:

    ```env
    TURSO_DATABASE_URL=libsql://your-database-url.turso.io
    TURSO_AUTH_TOKEN=your-turso-auth-token
    JWT_SECRET=your-secret-key
    ```

4. **Run the Application**
    - **Frontend Only (Dev):**

        ```bash
        cd frontend
        npm run dev
        ```

    - **Full Stack (with Vercel CLI):**

        ```bash
        vercel dev
        ```

## 📸 Screenshots

*(Add screenshots here for: Dashboard, Tender Details, Mobile View)*

## 📄 License

Private / Proprietary.
