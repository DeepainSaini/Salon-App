# Salon Appointment App

A simple salon appointment booking application built with Node.js, Express, Sequelize, MySQL, and plain HTML/CSS/JavaScript.

## Features

- Customer registration, login, JWT authentication, and profile management
- Admin salon setup and dashboard
- Service creation and active/inactive management
- Staff profiles, service assignment, and working hours
- Salon and service browsing
- Available-slot calculation based on staff availability and existing appointments
- Appointment booking with Cashfree sandbox payments
- Booking confirmation and reminder emails through Brevo
- Appointment cancellation and rescheduling without duplicate payment
- Customer appointment history grouped by status
- Customer reviews and staff/admin responses
- Admin appointment management and completion status

## Tech Stack

- Node.js
- Express.js
- Sequelize ORM
- MySQL
- JWT authentication
- Cashfree Payment Gateway
- Brevo transactional email API
- Plain HTML, CSS, and JavaScript

## Requirements

- Node.js 18 or later
- MySQL
- Cashfree sandbox credentials
- Brevo API key for email notifications

## Installation

```bash
npm install
```

Create a `.env` file in the project root:

```env
DB_USERNAME=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=salon_app
DB_HOST=127.0.0.1
DB_DIALECT=mysql

JWT_SECRET_KEY=your_jwt_secret

CASHFREE_APP_ID=your_cashfree_app_id
CASHFREE_SECRET_KEY=your_cashfree_secret_key

SENDINBLUE_API_KEY=your_brevo_api_key
```

Create the database, then run the migrations:

```bash
npx sequelize-cli db:migrate
```

Start the application:

```bash
npm start
```

The application runs at:

```text
http://localhost:3000
```

## Main User Flows

### Customer

1. Register and complete the profile.
2. Browse salons and services.
3. Select a date, staff member, and available slot.
4. Pay through Cashfree sandbox checkout.
5. View appointments on the customer dashboard.
6. Cancel or reschedule a paid appointment.
7. Leave a review after the appointment is marked completed.

### Admin

1. Register an admin account and complete salon details.
2. Add services and staff members.
3. Assign services and staff availability.
4. View paid appointments on the dashboard.
5. Mark completed appointments as completed.
6. View customer reviews and respond to them.

## Appointment Statuses

```text
pending_payment
booked
completed
cancelled
payment_failed
```

Only paid appointments are shown in the customer and admin appointment lists.

## Notifications

- Booking confirmation emails are sent after successful payment verification.
- A daily cron job checks upcoming appointments and sends reminder emails within the next 24 hours.

## Security Notes

- Keep `.env` out of version control.
- Use sandbox credentials for local development.
- Admin routes should be protected with role-based authorization in production.
- Payment status should ideally also be verified through a Cashfree webhook.

## Project Structure

```text
controllers/       Request handlers
models/            Sequelize models and associations
migrations/        Database migrations
routes/            Express routes
public/            Frontend JavaScript and CSS
views/             HTML pages
jobs/              Scheduled reminder job
util/services/     Payment and email services
```
