# Salon Appointment Booking App

A full-stack salon appointment booking application built with Node.js, Express, MySQL, Sequelize, and plain HTML/CSS/JavaScript.

The app supports three roles: customer, salon admin, and staff. Customers can search salons, book services, pay online, reschedule appointments, receive email notifications, and leave reviews. Admins can manage salon details, services, staff, appointments, customers, and invoices. Staff members can manage their own dashboard and respond to customer reviews.

## Tech Stack

- Backend: Node.js, Express.js
- Database: MySQL
- ORM: Sequelize and Sequelize CLI
- Frontend: HTML, CSS, JavaScript, Axios
- Authentication: JWT, bcrypt
- Payments: Cashfree Payment Gateway sandbox
- Email: Brevo transactional email API
- Scheduling: node-cron
- Invoices: PDF generation with pdfkit
- Version Control: Git and GitHub

## Roles

### Customer

- Register and login
- Complete and update profile details
- Change password
- Use forgot password and reset password flow
- Search salons by name
- View salon services
- Check available appointment slots
- Book appointments and pay online
- View upcoming, completed, and cancelled appointments
- Cancel or reschedule appointments
- Leave, edit, or delete reviews before staff response
- Download invoice for completed appointments

### Admin / Salon Owner

- Register and login
- Add and update salon details
- Add, edit, activate, and deactivate services
- Manage service availability
- Add staff members
- Assign multiple services to staff members
- Activate or deactivate staff members
- View and manage salon appointments
- Edit appointment date, time, and assigned staff using available slots
- Cancel appointments
- Mark appointments as completed
- Generate invoices for completed appointments
- View salon customers and their appointment history

### Staff

- Login with staff credentials
- Change password on first login
- View today's, upcoming, and completed appointments assigned to them
- View customer reviews related to their completed appointments
- Respond to customer reviews

## Key Features

### Authentication and Profiles

- JWT-based authentication
- Password hashing with bcrypt
- Separate flows for customer/admin users and staff users
- Customer profile update
- Staff first-login password change
- Forgot password reset link using email

### Service Management

- Admin can create services with name, description, duration, price, and availability
- Services can be activated or deactivated instead of permanently deleted
- Service price is saved into the appointment as `bookingPrice` so old appointments are not affected when service price changes

### Staff Management

- Admin can add staff with name, phone, email, password, specialization, and availability
- Staff can be assigned to multiple services
- A many-to-many relation is handled through the `StaffServices` table
- Inactive staff members cannot receive new bookings

### Appointment Booking

- Customers select a salon, service, date, and available slot
- Available slots are calculated from:
  - salon working hours
  - service availability
  - staff availability
  - service duration
  - already booked appointments
  - past time slots for today's date
- The same staff member cannot be double-booked for the same date and time

### Payments

- Cashfree is used to create a payment order
- Appointment is first created with pending payment status
- After Cashfree redirects back, payment status is verified from Cashfree
- On successful payment, appointment becomes booked and a confirmation email is sent

### Reminders

- A cron job checks upcoming appointments
- Reminder emails are sent for upcoming appointments within the configured reminder window
- `reminder_sent` prevents duplicate reminder emails

### Reviews and Feedback

- Customers can review completed appointments
- Staff can respond to reviews for appointments assigned to them
- Customers can edit or delete a review only before staff has responded

### Admin Dashboard

- Admin can view salon appointments grouped by status
- Admin can mark appointments completed
- Admin can edit appointment schedule using available slots
- Admin can view salon customers and their appointment details

### Invoice Generation

- Invoice is generated when admin marks a paid appointment as completed
- Invoice data is stored in the database
- PDF invoices are saved under the public invoice folder
- Customers and admins can access invoice links from appointment details

## Database Overview

- `Users`: customer and admin accounts
- `Salons`: salon details owned by an admin
- `Services`: salon services
- `Staffs`: staff profiles and login details
- `StaffServices`: many-to-many relation between staff and services
- `Appointments`: bookings, status, payment data, and booking price snapshot
- `Reviews`: customer reviews and staff responses
- `Invoices`: invoice details linked to completed appointments
- `PasswordReqs`: forgot password reset requests

## Main User Flow

### Customer Booking Flow

1. Customer logs in.
2. Customer searches salons.
3. Customer selects a salon.
4. Customer selects a service.
5. Customer chooses a date.
6. Backend returns available slots with staff names.
7. Customer selects a slot.
8. Backend creates a Cashfree order.
9. Backend stores the appointment with pending payment status.
10. Customer completes payment on Cashfree checkout.
11. Backend verifies payment status.
12. Appointment becomes booked after successful payment.
13. Confirmation email is sent to the customer.

### Reschedule Flow

1. Customer clicks reschedule on an existing paid appointment.
2. Customer is redirected to the booking page with the appointment id.
3. Backend excludes the current appointment while checking available slots.
4. Customer selects a new slot.
5. Existing appointment is updated with the new date, time, and staff.
6. Customer does not pay again because the original appointment is reused.

### Invoice Flow

1. Customer books and pays for an appointment.
2. Admin marks the appointment as completed.
3. Backend creates an invoice using appointment, customer, salon, service, staff, and price details.
4. Invoice PDF is generated.
5. Invoice record is saved in the database.
6. Invoice link is shown in dashboard appointment details.

## Appointment Statuses

```text
pending_payment
booked
completed
cancelled
payment_failed
```

Only paid/booked appointments are shown in the main customer and admin appointment lists.

## Environment Variables

Create a `.env` file in the project root.

```env
DB_USERNAME=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=salon_db
DB_HOST=127.0.0.1
DB_DIALECT=mysql

JWT_SECRET_KEY=your_jwt_secret

CASHFREE_APP_ID=your_cashfree_app_id
CASHFREE_SECRET_KEY=your_cashfree_secret_key

SENDINBLUE_API_KEY=your_brevo_api_key
```

Do not commit the `.env` file.

## Installation and Setup

Install dependencies:

```bash
npm install
```

Create the MySQL database, then run migrations:

```bash
npx sequelize-cli db:migrate
```

Start the app:

```bash
npm start
```

Open the app:

```text
http://localhost:3000
```

## Project Structure

```text
controllers/        Request handling logic
models/             Sequelize models and associations
migrations/         Database migration files
routes/             Express route files
views/              HTML pages
public/css/         Stylesheets
public/js/          Frontend JavaScript
public/invoices/    Generated invoice PDFs
jobs/               Cron reminder job
util/services/      Email, payment, and invoice services
config/             Sequelize database config
```

## Future Improvements

- Add Cashfree webhook support for more reliable payment status updates
- Add SMS notifications
- Add automated tests
- Add centralized error-handling middleware
- Add stronger production role-based authorization
- Deploy the application on AWS
- Improve UI responsiveness and accessibility
