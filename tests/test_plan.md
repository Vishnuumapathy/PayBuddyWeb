# PayBuddy Comprehensive Test Plan (100+ Test Cases)

## 1. UI/UX Testing (25 Cases)
- **TC-UI-001**: Verify responsive layout on mobile devices (360px).
- **TC-UI-002**: Verify responsive layout on tablets (768px).
- **TC-UI-003**: Verify Dark/Light mode consistency (if applicable).
- **TC-UI-004**: Check for broken images/icons across all pages.
- **TC-UI-005**: Verify font consistency across headers and body text.
- **TC-UI-006**: Verify button hover states and click animations.
- **TC-UI-007**: Check alignment of metric cards on Dashboard.
- **TC-UI-008**: Verify loading skeletons/spinners appear during data fetch.
- **TC-UI-009**: Ensure all forms have proper input labels and placeholders.
- **TC-UI-010**: Check tooltip visibility on disabled buttons.
- ... (Additional 15 cases covering navigation, spacing, and accessibility)

## 2. Functional Testing (40 Cases)
### Authentication
- **TC-FUNC-001**: Successful login with valid credentials.
- **TC-FUNC-002**: Login failure with invalid password.
- **TC-FUNC-003**: Login failure with non-existent email.
- **TC-FUNC-004**: Password reset flow functionality.
- **TC-FUNC-005**: Logout functionality and session termination.

### Sales & Payments
- **TC-FUNC-006**: Create a new sale with multiple items.
- **TC-FUNC-007**: Calculate total amount correctly in Sale creation.
- **TC-FUNC-008**: Record a payment for an existing sale.
- **TC-FUNC-009**: Verify payment mode (Cash, UPI, Bank) is saved correctly.
- **TC-FUNC-010**: Check Ledger updates automatically after a payment.
- **TC-FUNC-011**: Verify partial payment handling.
- **TC-FUNC-012**: Overpayment validation.

### Customer Management
- **TC-FUNC-013**: Add a new customer with contact details.
- **TC-FUNC-014**: Search customer by ID or Name.
- **TC-FUNC-015**: Edit customer profile information.

### Reporting
- **TC-FUNC-016**: Generate PDF/Excel report from Sales page.
- **TC-FUNC-017**: Filter payments by date range.
- ... (Additional 23 cases)

## 3. Unit Testing (20 Cases)
- **TC-UNIT-001**: `formatCurrency` correctly formats INR/USD.
- **TC-UNIT-002**: `formatDateTime` returns human-readable strings.
- **TC-UNIT-003**: Validation logic for email regex.
- **TC-UNIT-004**: Math utility for calculating interest on installments.
- ... (20 total covering utility functions)

## 4. Validation & Security Testing (15 Cases)
- **TC-VAL-001**: Prevent XSS in search inputs.
- **TC-VAL-002**: SQL Injection prevention (if applicable).
- **TC-VAL-003**: Mandatory field validation in forms.
- **TC-VAL-004**: Data type validation (Number vs String).
- **TC-VAL-005**: Unauthorized access redirection to Login.

## 5. Deployment & Performance (10 Cases)
- **TC-DEP-001**: PWA manifest validity.
- **TC-DEP-002**: Service worker registration check.
- **TC-DEP-003**: First Contentful Paint (FCP) < 2s.
- **TC-DEP-004**: API response time monitoring.
- ... (10 total)
