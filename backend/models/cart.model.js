import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1, default: 1 },
  price: { type: Number, required: true },
  imageUrl: { type: String, required: true }
});

const cartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [cartItemSchema],
  totalPrice: { type: Number, default: 0 },
  totalItems: { type: Number, default: 0 },
  updatedAt: { type: Date, default: Date.now }
});

cartSchema.pre('save', function(next) {
  let totalPrice = 0;
  let totalItems = 0;
  this.items.forEach(item => {
    totalPrice += item.price * item.quantity;
    totalItems += item.quantity;
  });
  this.totalPrice = totalPrice;
  this.totalItems = totalItems;
  this.updatedAt = Date.now();
  next();
});

const Cart = mongoose.model('Cart', cartSchema);
export default Cart; 