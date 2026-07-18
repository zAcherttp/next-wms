/**
 * Shared constants for E2E tests
 */

/** Default timeout for waiting on navigation */
export const NAV_TIMEOUT = 15_000;

/** Default timeout for waiting on toast notifications */
export const TOAST_TIMEOUT = 10_000;

/** Sonner toast selector */
export const TOAST_SELECTOR = "[data-sonner-toast]";

/** Dialog selectors */
export const DIALOG_SELECTOR = '[role="dialog"]';
export const ALERT_DIALOG_SELECTOR = '[role="alertdialog"]';

/** Test data for products */
export const TEST_PRODUCT = {
  name: "Test Product E2E",
  skuCode: "SKU-E2E-001",
  storageRequirement: "Normal",
  trackingMethod: "Batch",
};

/** Test data for categories */
export const TEST_CATEGORY = {
  name: "Test Category E2E",
};

/** Test data for brands */
export const TEST_BRAND = {
  name: "Test Brand E2E",
};

/** Test data for suppliers */
export const TEST_SUPPLIER = {
  name: "Test Supplier E2E",
  contactPerson: "John Test",
  email: "supplier-e2e@test.com",
  phone: "0123456789",
  defaultLeadTimeDays: 7,
};

/** PO code regex */
export const PO_CODE_REGEX = /^PO-\d{4}-\d{2}-\d{3}$/;

/** RS code regex */
export const RS_CODE_REGEX = /^RS-\d{4}-\d{2}-\d{3}$/;

/** OUT code regex */
export const OUT_CODE_REGEX = /^OUT-\d{4}-\d{4}$/;

/** PS code regex */
export const PS_CODE_REGEX = /^PS-\d{8}-\d{4}$/;
