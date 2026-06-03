/**
 * PayBuddy Web Models
 * Compatible with Android PayBuddy Firestore Schema
 */

// Constants
export const SALE_STATUS = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
} as const;

export const INSTALLMENT_STATUS = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  OVERDUE: 'OVERDUE',
} as const;

export const REMINDER_STATUS = {
  NOT_SENT: 'NOT_SENT',
  SENT: 'SENT',
} as const;

export const PAYMENT_TYPE = {
  FULL: 'Full Payment',
  PARTIAL: 'Partial Payment',
} as const;

export const LEDGER_TYPE = {
  SALE: 'sale',
  PAYMENT: 'payment',
} as const;

// Types derived from constants for strict typing
export type SaleStatus = typeof SALE_STATUS[keyof typeof SALE_STATUS];
export type InstallmentStatus = typeof INSTALLMENT_STATUS[keyof typeof INSTALLMENT_STATUS];
export type ReminderStatus = typeof REMINDER_STATUS[keyof typeof REMINDER_STATUS];
export type PaymentType = typeof PAYMENT_TYPE[keyof typeof PAYMENT_TYPE];
export type LedgerType = typeof LEDGER_TYPE[keyof typeof LEDGER_TYPE];

// Interfaces

/**
 * vendorId must always equal Firebase UID.
 */
export interface Vendor {
  vendorId: string;
  name: string;
  shopName: string;
  phone: string;
  email: string;
  upiId: string;
  createdAt: number;
}

export interface Customer {
  customerId: string;
  vendorId: string;
  name: string;
  phone: string;
  totalAmount: number;
  paidAmount: number;
  isArchived: boolean;
  archivedAt?: number | null;
  createdAt: number;
}

/**
 * status strings are case-sensitive and must never be renamed.
 * Fully paid sale creates no pending installments.
 * Partial unpaid sale creates at least one installment.
 */
export interface Sale {
  saleId: string;
  vendorId: string;
  customerId: string;
  customerName: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  interestRate: number;
  installmentCount: number;
  paymentType: "Full Payment" | "Partial Payment";
  amountPaid: number;
  status: "PENDING" | "COMPLETED";
  isArchived: boolean;
  archivedAt?: number | null;
  createdAt: number;
}

/**
 * Web must use latest Android due-date logic:
 * firstDueDate + (index * selectedInterval)
 *
 * Allowed intervals:
 * - Weekly = 7 days
 * - Bi-weekly = 14 days
 * - Monthly = 30 days
 *
 * Reminder metadata must not be wiped during edits.
 */
export interface Installment {
  installmentId: string;
  saleId: string;
  customerId: string;
  vendorId: string;
  dueDate: number;
  amount: number;
  amountPaid: number;
  status: "PENDING" | "PAID" | "OVERDUE";
  reminderCount: number;
  lastReminderSentAt: number;
  reminderStatus: "NOT_SENT" | "SENT";
  createdAt: number;
}

/**
 * payments collection is the financial source of truth.
 */
export interface Payment {
  paymentId: string;
  saleId?: string | null;
  installmentId?: string | null;
  customerId: string;
  vendorId: string;
  amount: number;
  paymentMode: string;
  createdAt: number;
}

export interface LedgerEntry {
  entryId: string;
  vendorId: string;
  customerId: string;
  customerName: string;
  itemName: string;
  saleId?: string | null;
  type: "sale" | "payment";
  amount: number;
  balanceAfter: number;
  createdAt: number;
}
