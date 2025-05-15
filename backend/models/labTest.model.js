import mongoose from 'mongoose';

const labTestSchema = new mongoose.Schema(
  {
    testName: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, required: true, enum: ['Blood Test', 'Urine Test', 'Imaging', 'Allergy', 'Hormone', 'Pathology', 'Other'] },
    price: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, min: 0 },
    testCode: { type: String, required: true, unique: true },
    preparationInstructions: { type: String },
    sampleType: { type: String },
    turnAroundTime: { type: String },
    availableLabs: [
      {
        labName: { type: String, required: true },
        location: { type: String, required: true },
        availableSlots: [
          {
            day: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
            slots: [
              {
                startTime: String,
                endTime: String,
                isBooked: { type: Boolean, default: false }
              }
            ]
          }
        ]
      }
    ],
    isHomeCollection: { type: Boolean, default: false },
    homeCollectionFee: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    requiredTests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'LabTest' }],
    imageUrl: { type: String }
  },
  { timestamps: true }
);

labTestSchema.index({ testName: 'text', description: 'text', category: 'text' });

const LabTest = mongoose.model('LabTest', labTestSchema);
export default LabTest; 