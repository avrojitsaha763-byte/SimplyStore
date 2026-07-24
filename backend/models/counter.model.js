import mongoose from 'mongoose';

const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // The sequence name, e.g., 'invoiceId'
  seq: { type: Number, default: 1 }
});

const Counter = mongoose.model('Counter', counterSchema);
export default Counter;
