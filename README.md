# Orvendiq

### Secure Fintech Transaction & Fraud Monitoring Platform

Orvendiq is a full-stack fintech portfolio project featuring a
Java Spring Boot backend, Oracle Database, and a React dashboard.

The project demonstrates financial transaction processing,
double-entry accounting, account-level authorization, and
rule-based fraud risk assessment.

> Portfolio simulation only. Orvendiq does not process real money
> or connect to a production banking network.

## Key Features

### Financial Transaction Processing
- REST API for account and transaction operations
- Account-to-account transfer workflow
- Balance validation before transfer execution
- Transaction history and account balance retrieval
- Database transaction management

### Double-Entry Ledger
- Debit and credit ledger entries for transfers
- Ledger-based balance calculation
- Transaction-to-ledger relationships
- Financial consistency validation

### Authentication & Authorization
- JWT-based authentication
- BCrypt password hashing
- Account ownership validation
- Protected API endpoints
- User-to-account access relationships

### Fraud Risk Assessment
- Rule-based transaction risk scoring
- Risk classification: LOW, MEDIUM, HIGH
- Transaction amount and behavioral indicators
- Asynchronous post-commit fraud assessment
- Recovery mechanism for pending assessments
- Fraud assessment history for dashboard visualization

## Technology Stack

| Layer | Technology |
|---|---|
| Backend | Java 21, Spring Boot |
| Security | Spring Security, JWT, BCrypt |
| Database | Oracle Database Free |
| Persistence | Spring Data JPA, Hibernate, JDBC |
| Build | Maven |
| Testing | JUnit 5, Mockito |
| Frontend | React, TypeScript, Vite |
| UI | Tailwind CSS, Motion, GSAP |
| Infrastructure | Docker |

## Architecture

```text
React + TypeScript Dashboard
            |
            | HTTP / REST API
            v
     Spring Boot Backend
            |
    +-------+--------+
    |       |        |
    v       v        v
   JWT   Transfer   Fraud
 Security Service   Engine
            |        |
            v        v
        Transaction Events
            |
            v
      Oracle Database
            |
    +-------+--------+
    |       |        |
 Accounts Ledger  Assessments
```

## Main API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/v1/auth/login | Authenticate user |
| POST | /api/v1/transfers | Submit transfer |
| GET | /api/v1/transactions | Retrieve transaction history |
| GET | /api/v1/accounts/{accountNumber}/balance | Retrieve account balance |
| GET | /api/v1/fraud/assessments/{id} | Retrieve fraud assessment |
| GET | /api/v1/system/status | System status |

Endpoint access may require a valid JWT and appropriate
account ownership.

## Transaction Workflow

1. Authenticate the request.
2. Validate the source account and authorization.
3. Validate the transfer amount and available balance.
4. Persist the financial transaction.
5. Record the corresponding debit and credit ledger entries.
6. Commit the database transaction.
7. Trigger post-commit fraud risk assessment.
8. Expose transaction and risk data through the API.

Fraud assessment is separate from the committed financial
transaction. A recovery mechanism handles assessments that
were not completed during the initial event processing.

## Local Development

### Requirements

- Java 21
- Oracle Database Free
- Maven or Maven Wrapper
- A configured Oracle application schema

### Environment Variables

Configure the following variables in your local environment:

```text
ORVENDIQ_DB_PASSWORD
ORVENDIQ_JWT_SECRET
```

Never commit real credentials or JWT secrets.

Additional database connection settings must match the
application configuration and your local Oracle environment.

### Start Backend

On Windows:

```powershell
.\mvnw.cmd spring-boot:run
```

### Build

```powershell
.\mvnw.cmd clean package -DskipTests
```

### Selected Unit Tests

```powershell
.\mvnw.cmd "-Dtest=FraudRiskEngineTest,FraudRiskBoundaryTest,TransferFraudListenerTest" test
```

Integration tests may require an active Oracle database.
Avoid running data-modifying tests against a database
containing information you need to preserve.

## Security Considerations

- Passwords are stored as hashes rather than plaintext.
- Financial endpoints use authentication and authorization.
- Account ownership is checked before protected operations.
- Financial writes use database transaction boundaries.
- Fraud results are informational and do not guarantee
  that a transaction is legitimate or fraudulent.
- Demo accounts and transactions contain fictional data.

## Project Scope

Orvendiq is an educational engineering project designed
to demonstrate backend architecture and financial domain
modeling.

It is not a licensed financial service, production banking
platform, or certified fraud detection system.

## Author

Dwi Nisyatul Wardah

Information Technology Graduate

GitHub: https://github.com/dnwardah-dev