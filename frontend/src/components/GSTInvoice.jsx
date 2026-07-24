import React from 'react';
import { Printer, ShieldCheck } from 'lucide-react';

export default function GSTInvoice({ order }) {
  if (!order || !order.gst) return null;

  const handlePrint = () => {
    window.print();
  };

  const isIntrastate = order.gst.cgst > 0 || order.gst.sgst > 0;

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 p-6 rounded-3xl shadow-lg print:border-0 print:shadow-none max-w-2xl mx-auto text-xs">
      
      {/* Invoice Actions */}
      <div className="flex justify-end gap-3 mb-6 print:hidden">
        <button
          onClick={handlePrint}
          className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 dark:border-gray-850 hover:bg-gray-50 dark:hover:bg-gray-850 text-gray-700 dark:text-gray-300 font-bold rounded-xl transition cursor-pointer"
        >
          <Printer size={14} /> Print Invoice
        </button>
      </div>

      {/* Invoice Content */}
      <div className="space-y-6">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b border-gray-100 dark:border-gray-850 pb-5">
          <div>
            <h2 className="text-lg font-black text-gray-950 dark:text-white uppercase tracking-wider">SimplyStore Ltd.</h2>
            <p className="text-gray-400 mt-1">12, Bandra Kurla Complex, Mumbai, MH</p>
            <p className="text-gray-400">GSTIN: 27AAAAA1111A1Z1</p>
          </div>
          <div className="text-right">
            <h3 className="text-base font-black text-violet-600 uppercase tracking-widest">Tax Invoice</h3>
            <p className="font-bold text-gray-800 dark:text-white mt-1">Invoice No: {order.gst.invoiceNumber}</p>
            <p className="text-gray-400">Date: {new Date(order.createdAt).toLocaleDateString()}</p>
            <p className="text-gray-400">Order ID: #{String(order.id || '').substring(0, 8)}</p>
          </div>
        </div>

        {/* Bill To / Bill From */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-bold text-gray-400 uppercase tracking-wider mb-1.5">Billed To:</h4>
            <p className="font-black text-gray-950 dark:text-white">{order.shippingDetails?.fullName}</p>
            <p className="text-gray-400 mt-0.5">{order.shippingDetails?.address}</p>
            <p className="text-gray-400">{order.shippingDetails?.city}, {order.shippingDetails?.state} - {order.shippingDetails?.zipCode}</p>
            <p className="text-gray-400">Phone: {order.shippingDetails?.phone}</p>
          </div>
          <div className="text-right">
            <h4 className="font-bold text-gray-400 uppercase tracking-wider mb-1.5">Payment details:</h4>
            <p className="font-bold text-gray-950 dark:text-white">Method: {order.paymentMethod}</p>
            <p className="text-gray-400 mt-0.5">Tracking ID: {order.tracking}</p>
          </div>
        </div>

        {/* Items Table */}
        <div className="border border-gray-100 dark:border-gray-850 rounded-2xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-950 font-bold border-b border-gray-100 dark:border-gray-850 text-gray-450 dark:text-gray-400">
                <th className="p-3">Item Description</th>
                <th className="p-3 text-center">Qty</th>
                <th className="p-3 text-right">Unit Price</th>
                <th className="p-3 text-right font-black">Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, idx) => (
                <tr key={idx} className="border-b border-gray-50 dark:border-gray-850 last:border-b-0 text-gray-700 dark:text-gray-300">
                  <td className="p-3 font-semibold">{item.name}</td>
                  <td className="p-3 text-center">{item.quantity}</td>
                  <td className="p-3 text-right">${item.price.toFixed(2)}</td>
                  <td className="p-3 text-right font-bold">${(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Tax Calculations */}
        <div className="flex justify-end">
          <div className="w-64 space-y-2 border-t border-gray-100 dark:border-gray-850 pt-3">
            <div className="flex justify-between font-medium text-gray-500">
              <span>Subtotal</span>
              <span>${(order.total - (order.gst.cgst + order.gst.sgst + order.gst.igst)).toFixed(2)}</span>
            </div>
            
            {isIntrastate ? (
              <>
                <div className="flex justify-between text-gray-400">
                  <span>CGST ({order.gst.rate / 2}%)</span>
                  <span>${order.gst.cgst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>SGST ({order.gst.rate / 2}%)</span>
                  <span>${order.gst.sgst.toFixed(2)}</span>
                </div>
              </>
            ) : (
              <div className="flex justify-between text-gray-400">
                <span>IGST ({order.gst.rate}%)</span>
                <span>${order.gst.igst.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between font-black text-sm text-gray-950 dark:text-white border-t border-gray-100 dark:border-gray-850 pt-2">
              <span>Grand Total</span>
              <span>${order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Declaration footer */}
        <div className="text-center pt-8 border-t border-gray-50 dark:border-gray-850/40 text-[10px] text-gray-400">
          <span className="inline-flex items-center gap-1.5 font-bold mb-1">
            <ShieldCheck size={12} className="text-emerald-500" /> Computations generated legally for tax declaration.
          </span>
          <p>This is a computer-generated tax invoice and requires no physical signature.</p>
        </div>

      </div>
    </div>
  );
}
