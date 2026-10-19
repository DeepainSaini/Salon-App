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
- Caching: Redis (local server or Redis Cloud), node-redis client
- Logging: Winston
- Security: Helmet, express-rate-limit, request validation
- Response compression: compression
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
- Staff reservations are stored separately in `BookedSlots`, including start and end times
- Availability and booking checks exclude overlapping reservations, including bookings for other services assigned to the same staff member
- A database unique constraint prevents duplicate staff/date/start-time reservations; another permits only one reservation per appointment
- Arbitrary concurrent overlaps with different start times still need stronger database concurrency protection (see Future Improvements)

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

### Performance and Caching

- Paginated salon search, service listings, and appointment lists limit response sizes
- Database indexes support appointment filters and reservation lookups
- Redis caches salon search results and salon service listings for 300 seconds
- Cache keys include search terms, salon IDs, and pagination parameters as applicable
- On a cache miss, the controller queries MySQL and stores the response in Redis
- Salon and service changes trigger cache invalidation
- Cache helpers catch Redis command errors and allow database reads to continue; the current application startup still requires Redis to connect
- Winston records cache hits, misses, and lookup durations for performance investigation

### Security and Error Handling

- Role authorization and ownership checks restrict access to salon, customer, and staff resources
- Request validation checks required fields and password strength
- Helmet sets security headers and a Content Security Policy configured for Cashfree checkout
- Rate limits protect API and authentication endpoints
- JSON request bodies are limited to 100 KB
- Central error handling and response helpers keep API errors consistent
- Winston writes JSON logs to `logs/combined.log` and `logs/error.log`, with console output during development

## Database Overview

- `Users`: customer and admin accounts
- `Salons`: salon details owned by an admin
- `Services`: salon services
- `Staffs`: staff profiles and login details
- `StaffServices`: many-to-many relation between staff and services
- `Appointments`: bookings, status, payment data, and booking price snapshot
- `BookedSlots`: staff reservations with appointment date, start time, and end time
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
slot_conflict
```

Main appointment lists exclude unpaid bookings and display paid appointments grouped by status.
`slot_conflict` records a successful payment whose requested slot was already reserved when payment was verified; automated refund handling is not implemented.

## Environment Variables

Copy `.env.example` to `.env` in the project root and replace the placeholder values. Configuration is read through `config/appConfig.js`; Sequelize CLI keeps its own database configuration entry point.

```env
NODE_ENV=development
PORT=3000
APP_BASE_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000
COOKIE_SECURE=false

DB_USERNAME=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=salon_db
DB_HOST=127.0.0.1
DB_DIALECT=mysql

JWT_SECRET_KEY=your_jwt_secret

CASHFREE_APP_ID=your_cashfree_app_id
CASHFREE_SECRET_KEY=your_cashfree_secret_key

SENDINBLUE_API_KEY=your_brevo_api_key
EMAIL_SENDER_EMAIL=your_verified_sender@example.com
EMAIL_SENDER_NAME=Salon Appointment App
CASHFREE_ENVIRONMENT=sandbox

REDIS_URL=redis://localhost:6379
```

For Redis Cloud, use the connection URL provided by your database, including credentials and the appropriate `redis://` or `rediss://` scheme. Installing the npm `redis` package installs the client only; a running Redis server is also required.

Do not commit `.env`, credentials, or generated logs. Use your deployed frontend origin and secure cookies when configuring HTTPS deployment.

## Installation and Setup

Prerequisites: Node.js and npm, a MySQL database, a reachable Redis server, Cashfree sandbox credentials, and a Brevo API key with a verified sender.

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

The backend connects to MySQL and Redis before starting the HTTP server and reminder cron job. For a direct run without nodemon, use `node app.js`.

## Tests

Run the existing regression tests:

```bash
npm test
```

These cover time helpers, configuration, pagination, availability calculations, error helpers, request validation, and response helpers. They do not replace integration tests against MySQL, Redis, or Cashfree.

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
util/               Logging, Redis client, pagination, and shared helpers
middlewares/        Authentication, authorization, validation, and error handling
tests/              Automated regression tests
config/             Application and Sequelize database configuration
```

## Future Improvements

- Add Cashfree webhook support for more reliable payment status updates
- Add SMS notifications
- Add integration tests for payment callbacks, cache invalidation, and concurrent bookings
- Serialize reservations per staff member or use another database strategy to prevent concurrent overlapping bookings with different start times
- Add Docker packaging and a reproducible container setup
- Add background queues for email and other external service work
- Add log rotation and deployment log collection
- Deploy the application on AWS
- Improve UI responsiveness and accessibility

Docker, Kubernetes, and capacity for 100,000 users have not been implemented or verified. Load testing and deployment measurements are needed before making capacity claims.
