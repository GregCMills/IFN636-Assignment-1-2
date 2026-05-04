import mongoose, { Schema, model, InferSchemaType, HydratedDocument } from 'mongoose';

/**
 * @module User
 * Stores supplementary profile data for authenticated users. Authentication
 * itself is managed entirely by Clerk; this collection only holds extra fields
 * (address, phone) that Clerk does not natively provide.
 *
 * `clerkId` is the unique identifier issued by Clerk and is used as the
 * lookup key in all profile read/update operations.
 */

const userSchema = new Schema({
  /** Clerk-issued user ID — used to link this document to the Clerk identity. */
  clerkId: { type: String, required: true, unique: true },
  /** Optional street / postal address provided by the user. */
  address: { type: String },
  /** Optional contact phone number provided by the user. */
  phone:   { type: String },
});

export type IUser = InferSchemaType<typeof userSchema>;
export type UserDocument = HydratedDocument<IUser>;

export default model<IUser>('User', userSchema);
