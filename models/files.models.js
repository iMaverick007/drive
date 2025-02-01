import mongoose from 'mongoose';

const fileSchema = new mongoose.Schema({
    path: {
        type: String,
        required: [true, 'Path is required']
    },
    originalName: {
        type: String,
        required: [true, 'Original name is required']
    },
    cloudinaryUrl: {
        type: String,
        required: [true, 'Cloudinary URL is required']
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User is required']
    },

}, {
    timestamps: true
});

export default mongoose.model('file', fileSchema);