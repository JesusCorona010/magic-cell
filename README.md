# Magic Star — Sistema de Inventario y Punto de Venta

> Sistema web de inventario y punto de venta desarrollado para una tienda de accesorios para celular. Permite registrar ventas, gestionar productos, categorías e historial semanal de ventas.

![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![Railway](https://img.shields.io/badge/Railway-0B0D0E?style=for-the-badge&logo=railway&logoColor=white)

---

## 📌 About the Project

**Magic Star** is a full stack web application built as a real-world inventory and point-of-sale (POS) system for a small accessories store. It was designed to replace manual tracking and give the business owner a simple, fast, and reliable way to manage sales and stock from any device.

The app was developed, deployed, and put into production — a complete end-to-end project from idea to live URL.

---

## ✨ Features

- 📦 **Product Management** — Add, edit, and delete products with categories and stock
- 🛒 **Point of Sale** — Register sales quickly with product selection and quantity
- 💳 **Payment Method** — Track whether each sale was paid in cash or card
- 📊 **Weekly Sales History** — View and review sales records by week
- 🏷️ **Category Editor** — Create and manage product categories
- 🔔 **Notifications** — Real-time feedback on actions
- 📱 **Responsive Design** — Works on desktop and mobile

---

## 🛠️ Built With

- **Frontend** — HTML, CSS, JavaScript (Vanilla)
- **Backend** — Node.js + Express.js
- **Database** — MySQL
- **ORM/Driver** — mysql2
- **Dev tools** — nodemon, dotenv
- **Deployment** — Railway (backend + MySQL database)

---

## 🗄️ Database Structure

```
categorias       — Product categories
productos        — Products with stock and category
ventas           — Sales records with payment method
detalle_ventas   — Line items per sale
```

---

## 🚀 Getting Started (Local)

### Prerequisites
- Node.js v18+
- MySQL running locally (XAMPP or similar)

### Installation

```bash
# Clone the repository
git clone https://github.com/JesusCorona010/magic-cell.git
cd magic-cell

# Install dependencies
npm install

# Create your .env file
cp .env.example .env
```

### Environment Variables

Create a `.env` file in the root of the project:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=inventario_accesorios
DB_PORT=3306
```

### Run the app

```bash
npm run dev
```

Open your browser at `http://localhost:3000`
---

## 👨‍💻 Author

**Jesus Corona**
Full Stack Web Developer
[GitHub](https://github.com/JesusCorona010) · [Fiverr](https://www.fiverr.com/jesusc10)
