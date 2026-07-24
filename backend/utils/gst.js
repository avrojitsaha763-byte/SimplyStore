// Legally-compliant GST utility matching Indian tax standards
import Counter from '../models/counter.model.js';

const TAX_RATE = 0.18; // Standard 18% GST rate

export function calculateGST(amount, buyerState, sellerState = "Maharashtra") {
  const tax = amount * TAX_RATE;
  
  // Normalize states
  const bState = (buyerState || "").trim().toLowerCase();
  const sState = (sellerState || "").trim().toLowerCase();

  if (bState === sState) {
    // Intrastate: CGST + SGST (half and half)
    return {
      rate: TAX_RATE * 100,
      cgst: parseFloat((tax / 2).toFixed(2)),
      sgst: parseFloat((tax / 2).toFixed(2)),
      igst: 0,
      totalTax: parseFloat(tax.toFixed(2))
    };
  } else {
    // Interstate: IGST (full rate)
    return {
      rate: TAX_RATE * 100,
      cgst: 0,
      sgst: 0,
      igst: parseFloat(tax.toFixed(2)),
      totalTax: parseFloat(tax.toFixed(2))
    };
  }
}

export async function generateInvoiceNumber() {
  const counter = await Counter.findOneAndUpdate(
    { _id: 'invoiceId' },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  const serial = String(counter.seq).padStart(5, '0');
  return `INV-${new Date().getFullYear()}-${serial}`;
}
