import mongoose from 'mongoose';

const protocolFieldSchema = new mongoose.Schema({
    fieldKey: { type: String, required: true },
    label: { type: String, required: true },
    type: { type: String, enum: ["text", "textarea", "radio", "datetime-local", "date", "time", "hearing_test_table", "heading"], required: true },
    required: { type: Boolean, default: false },
    includeInReport: { type: Boolean, default: true },
    options: [String],
    tests: [{
        key: { type: String },
        name: { type: String },
        fullName: { type: String }
    }],
}, { _id: false });

const protocolStepSchema = new mongoose.Schema({
    stepKey: { type: String, required: true },
    stepLabel: { type: String, required: true },
    order: { type: Number, required: true },
    fields: [protocolFieldSchema],
}, { _id: false });

const protocolSchema = new mongoose.Schema(
    {
        institutionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Institution",
            required: false,
            index: true,
        },
        accountId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Customer",
            required: [true, "Account ID is required"],
            index: true,
        },
        name: {
            type: String,
            required: [true, "Protocol name is required"],
            trim: true,
        },
        categoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: [true, "Category ID is required"],
            index: true,
        },
        formStructure: [protocolStepSchema],
        version: {
            type: Number,
            default: 1,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        sex: {
            type: String,
            enum: ["Male", "Female", "Other", "Any"],
            default: "Any",
        },
        minAge: {
            type: Number,
            default: 0,
        },
        maxAge: {
            type: Number,
            default: 100,
        },
        reportTemplateId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ReportTemplate",
        },
    },
    { timestamps: true }
);

protocolSchema.index({ accountId: 1, categoryId: 1, name: 1 });

const Protocol = mongoose.model("Protocol", protocolSchema);
export default Protocol;
