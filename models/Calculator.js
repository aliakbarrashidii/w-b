
const mongoose = require('mongoose');

const choiceSchema = new mongoose.Schema({
  label: String,
  price: Number,
}, { _id: false });

const optionSchema = new mongoose.Schema({
  id: String,
  label: String,
  type: { type: String, enum: ['select', 'toggle', 'range'] },
  hint: String,
  required: Boolean,
  defaultVal: mongoose.Schema.Types.Mixed,
  freeLabel: String,
  price: Number,           // برای toggle
  pricePerUnit: Number,    // برای range
  min: Number,             // برای range
  max: Number,             // برای range
  choices: [choiceSchema], // برای select
}, { _id: false });

const calculatorSchema = new mongoose.Schema({
  serviceId: { type: String, required: true, unique: true }, // مثل web-design
  title: String,
  basePrice: Number,
  basePriceLabel: String,
  options: [optionSchema],
});

module.exports = mongoose.model('Calculator', calculatorSchema);
