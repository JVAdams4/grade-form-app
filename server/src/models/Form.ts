import { Schema, model, Types, Document } from 'mongoose';

export interface IForm extends Document {
    userId: Types.ObjectId;
    userFullName: string;
    date: Date;
    formData: object;
    feedback: { score: string; bonus: string; comments: string; } | null;
}

const FeedbackSchema = new Schema({ score: { type: String }, bonus: { type: String }, comments: { type: String } }, { _id: false });

const FormSchema = new Schema({
    userId: { type: Types.ObjectId, ref: 'User', required: true },
    userFullName: { type: String, required: true },
    date: { type: Date, default: Date.now },
    formData: { type: Object, required: true },
    feedback: { type: FeedbackSchema, default: null }
});

export default model<IForm>('Form', FormSchema);
