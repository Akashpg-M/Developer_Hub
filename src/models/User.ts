import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

// Interfaces
export interface IUser extends Document {
  email: string;
  password?: string;
  fullName: string;
  username: string;
  profilePicture?: string;
  bio?: string;
  roles: string[];
  education: {
    institution: string;
    year?: number;
  }[];
  workExperience: {
    company: string;
    role: string;
    year?: number;
  }[];
  skills: {
    name: string;
    proof?: string;
    endorsements: mongoose.Types.ObjectId[];
  }[];
  certificates: {
    title: string;
    url: string;
    date: Date;
  }[];
  profileVisibility: 'public' | 'private' | 'restricted';
  googleId?: string;
  refreshToken?: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Schema
const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: function(this: IUser) {
        return !this.googleId; // Password required only if not using Google OAuth
      },
      minlength: 8,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    profilePicture: {
      type: String,
    },
    bio: {
      type: String,
      maxlength: 500,
    },
    roles: [{
      type: String,
      trim: true,
    }],
    education: [{
      institution: {
        type: String,
        required: true,
      },
      year: Number,
    }],
    workExperience: [{
      company: {
        type: String,
        required: true,
      },
      role: {
        type: String,
        required: true,
      },
      year: Number,
    }],
    skills: [{
      name: {
        type: String,
        required: true,
      },
      proof: String,
      endorsements: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
      }],
    }],
    certificates: [{
      title: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
      date: {
        type: Date,
        required: true,
      },
    }],
    profileVisibility: {
      type: String,
      enum: ['public', 'private', 'restricted'],
      default: 'public',
    },
    googleId: {
      type: String,
      sparse: true,
    },
    refreshToken: String,
  },
  {
    timestamps: true,
  }
);

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ googleId: 1 });

// Password hashing middleware
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password!, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Password comparison method
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password!);
  } catch (error) {
    throw error;
  }
};

export const User = mongoose.model<IUser>('User', userSchema); 