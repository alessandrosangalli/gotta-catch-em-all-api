import * as mongoose from 'mongoose';

export const UserSchema = new mongoose.Schema({
  name: { type: String, unique: false, required: true },
  email: { type: String, unique: true, required: true, dropDups: true },
  password: { type: String, unique: false, required: true },
});
