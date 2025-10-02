/**
 * Modal stack manager to handle body scroll locking when multiple modals are open.
 * Prevents the issue where closing one modal removes scroll lock while another is still open.
 */

let modalCount = 0;

/**
 * Call this when a modal opens
 */
export function pushModal() {
  modalCount++;
  if (modalCount === 1) {
    document.body.style.overflow = 'hidden';
  }
}

/**
 * Call this when a modal closes
 */
export function popModal() {
  modalCount--;
  if (modalCount === 0) {
    document.body.style.overflow = 'unset';
  }
  // Safety: prevent negative counts
  if (modalCount < 0) {
    modalCount = 0;
  }
}
