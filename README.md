# Bank Management System - DBMS Mini Project

A full-stack web application for managing a bank's database with complex queries, data analysis, and administrative functionality.

## Features

- **Database Dashboard**: Visual analytics with branch profitability, account distribution, and employee efficiency metrics
- **Query Executor**: Execute 5 complex SQL queries with nested subqueries and CTEs
- **Data Management**: Add customers, branches, and accounts with form validation
- **Real-time Analytics**: Interactive charts and data visualization
- **RESTful API**: Complete backend with Express.js and MySQL

## Tech Stack

- **Frontend**: Next.js 16, React, Tailwind CSS, Recharts
- **Backend**: Node.js, Express.js
- **Database**: MySQL 8.0+
- **APIs**: REST with JSON

## Setup Instructions

### Prerequisites

- Node.js 18+ installed
- MySQL 8.0+ running locally
- npm or yarn package manager

### 1. Database Setup

Create the MySQL database:

\`\`\`bash
mysql -u root -p < scripts/01-init-database.sql
\`\`\`

Note: Update credentials in the SQL file if needed. The script creates:
- BankManagement database
- All required tables with constraints
- Foreign key relationships

### 2. Environment Configuration

Create a `.env.local` file in the project root:

\`\`\`env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=BankManagement

# Server Configuration
PORT=5000

# Client Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000
\`\`\`

Update `DB_PASSWORD` with your actual MySQL password.

### 3. Install Dependencies

\`\`\`bash
npm install
\`\`\`

Required packages:
- next, react, react-dom
- express, cors
- mysql2/promise
- recharts (for charts)
- lucide-react (for icons)
- tailwindcss

### 4. Start the Application

**Terminal 1 - Start Backend Server:**

\`\`\`bash
npm run server:dev
\`\`\`

The API will be available at `http://localhost:5000`

**Terminal 2 - Start Frontend (in a new terminal):**

\`\`\`bash
npm run dev
\`\`\`

The frontend will be available at `http://localhost:3000`

## Project Structure

\`\`\`
.
├── app/
│   ├── layout.tsx          # Root layout
│   ├── globals.css         # Global styles
│   └── page.tsx            # Main page
├── components/
│   ├── navigation.tsx      # Navigation bar
│   ├── dashboard.tsx       # Analytics dashboard
│   ├── query-executor.tsx  # Query execution interface
│   ├── data-manager.tsx    # Data management interface
│   └── forms/              # Data entry forms
├── server/
│   ├── index.ts            # Express server
│   ├── db.ts               # Database connection
│   └── routes/             # API routes
│       ├── queries.ts      # Complex query endpoints
│       ├── analysis.ts     # Analysis query endpoints
│       └── data.ts         # Data management endpoints
└── scripts/
    └── 01-init-database.sql # Database initialization
\`\`\`

## API Endpoints

### Analytics Endpoints

- `GET /api/analysis/branch-profitability` - Branch financial metrics
- `GET /api/analysis/employee-efficiency` - Employee cost efficiency

### Query Endpoints

- `POST /api/queries/high-value-customers` - High-value loan and locker holders
- `POST /api/queries/branches-without-account-type` - Branches without recurring deposits
- `POST /api/queries/stressed-customers` - Customers with high loan-to-balance ratios
- `POST /api/queries/least-active-branch-employees` - Employees in least active branch
- `POST /api/queries/digital-adoption-gap` - Digital users without online transactions

### Data Management Endpoints

- `GET /api/data/customers` - List all customers
- `POST /api/data/customers` - Add new customer
- `GET /api/data/branches` - List all branches
- `POST /api/data/branches` - Add new branch
- `GET /api/data/accounts` - List all accounts
- `POST /api/data/accounts` - Add new account

## Database Schema

### Tables

- **Customer**: Customer information (cust_id, name, address, DOB)
- **Branch**: Branch details (branch_id, name, location)
- **Account**: Bank accounts (acc_no, type, balance, cust_id, branch_id)
- **Employee**: Branch employees (emp_id, name, position, salary, branch_id)
- **Loan**: Customer loans (loan_id, type, amount, cust_id)
- **Locker**: Safe deposit lockers (locker_id, size, rent, cust_id)
- **Service**: Banking services (service_id, name, type)
- **Transaction**: Account transactions (acc_no, trans_id, date, amount, type, mode)
- **Avails**: Services used by customers
- **Cust_Phone**: Customer phone numbers

## Features in Detail

### Dashboard Tab

- **Branch Profitability Chart**: Bar chart showing total balance and account count per branch
- **Activity Distribution**: Pie chart showing account distribution
- **Employee Efficiency Table**: Cost per customer analysis for each branch

### Queries Tab

Execute 5 complex SQL queries:

1. **High-Value Customers**: Find customers with both high loans AND large lockers
2. **Branches Without Account Type**: Identify branches lacking certain account types
3. **Financially Stressed Customers**: Analyze customers with loan-to-balance stress ratios
4. **Least Active Branch Employees**: View staff in the lowest-activity branch
5. **Digital Adoption Gap**: Find digital users who haven't transitioned to online banking

### Data Management Tab

Add new records to the system:
- Customer registration form
- Branch creation form
- Account opening form

Form validation ensures data integrity.

## Error Handling

The application includes:
- Database connection error handling
- Query execution error messages
- API response error handling
- Form validation messages
- User-friendly error displays

## Performance Considerations

- Connection pooling for database efficiency
- Indexed primary keys and foreign keys
- Efficient SQL queries with proper joins
- Frontend data caching with React state
- Responsive pagination for large result sets

## Future Enhancements

- Authentication and authorization
- Advanced filtering and search
- Export data to CSV/PDF
- Real-time data updates with WebSockets
- Mobile responsive optimization
- Stored procedures integration
- Trigger monitoring dashboard
- Transaction history tracking

## Support

For issues or questions:
1. Check that MySQL is running
2. Verify environment variables in `.env.local`
3. Ensure both backend and frontend servers are running
4. Check browser console for frontend errors
5. Check terminal logs for backend errors

---

Built with Next.js, Express, and MySQL for the DBMS Mini Project.
\`\`\`

```json file="" isHidden
