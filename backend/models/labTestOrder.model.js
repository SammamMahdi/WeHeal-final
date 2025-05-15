import mongoose from 'mongoose';

const labTestOrderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    orderNumber: { type: String, required: true, unique: true },
    patientInfo: {
      name: { type: String, required: true },
      age: { type: Number, required: true },
      gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
      email: { type: String },
      phone: { type: String, required: true },
      address: { type: String }
    },
    selectedTests: [
      {
        test: { type: mongoose.Schema.Types.ObjectId, ref: 'LabTest', required: true },
        price: { type: Number, required: true }
      }
    ],
    selectedLab: {
      labName: { type: String, required: true },
      location: { type: String, required: true }
    },
    appointmentDetails: {
      date: { type: Date, required: true },
      slot: {
        startTime: { type: String, required: true },
        endTime: { type: String, required: true }
      },
      isHomeCollection: { type: Boolean, default: false }
    },
    status: { type: String, enum: ['Pending', 'Approved', 'Sample Collected', 'Processing', 'Completed', 'Cancelled'], default: 'Pending' },
    totalAmount: { type: Number, required: true },
    paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Failed', 'Refunded'], default: 'Pending' },
    paymentDetails: {
      transactionId: String,
      paymentMethod: String,
      paymentDate: Date
    },
    reports: [
      {
        reportName: String,
        fileUrl: String,
        uploadDate: { type: Date, default: Date.now },
        isVerified: { type: Boolean, default: false }
      }
    ],
    adminNotes: { type: String },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewDate: { type: Date }
  },
  { timestamps: true }
);

labTestOrderSchema.pre('save', async function(next) {
  if (!this.isNew) return next();
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = ('0' + (date.getMonth() + 1)).slice(-2);
  const day = ('0' + date.getDate()).slice(-2);
  const baseOrderNumber = `LTO-${year}${month}${day}-`;
  try {
    const lastOrder = await this.constructor.findOne({ orderNumber: { $regex: baseOrderNumber } }).sort({ orderNumber: -1 });
    let newOrderNumber;
    if (lastOrder) {
      const lastNumber = parseInt(lastOrder.orderNumber.split('-')[2]);
      newOrderNumber = `${baseOrderNumber}${(lastNumber + 1).toString().padStart(4, '0')}`;
    } else {
      newOrderNumber = `${baseOrderNumber}0001`;
    }
    this.orderNumber = newOrderNumber;
    next();
  } catch (error) {
    next(error);
  }
});

const LabTestOrder = mongoose.model('LabTestOrder', labTestOrderSchema);
export default LabTestOrder; 