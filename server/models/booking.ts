import { Document, model, Schema, Types } from "mongoose";
import crypto from "crypto";

export interface IBooking extends Document {
  user: Types.ObjectId;
  restaurant: Types.ObjectId;
  date: Date;
  time: string;
  guests: number;
  occasion?: string;
  specialRequests?: string;
  status: "confirmed" | "cancelled" | "completed";
  bookingId: string;
  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema = new Schema<IBooking>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    restaurant: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    time: { type: String, required: true },
    guests: { type: Number, required: true, min: 1 },
    occasion: { type: String, trim: true },
    specialRequests: { type: String, trim: true },
    status: {
      type: String,
      enum: ["confirmed", "cancelled", "completed"],
      default: "confirmed",
    },
    bookingId: { type: String, unique: true },
  },
  { timestamps: true },
);

//Remove password from response
bookingSchema.pre("save", function () {
  if (!this.bookingId) {
    this.bookingId = `GR-${crypto.randomBytes(4).toString("hex")}`;
  }
});

export const Booking = model<IBooking>("Booking", bookingSchema);
