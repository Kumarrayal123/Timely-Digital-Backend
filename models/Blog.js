import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Blog title is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Blog slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    excerpt: {
      type: String,
      required: [true, 'Blog excerpt is required'],
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Blog content is required'],
    },
    coverImage: {
      type: String,
      default: '',
    },
    author: {
      type: String,
      default: 'Timely Digital Team',
      trim: true,
    },
    category: {
      type: String,
      default: 'Healthcare Marketing',
      trim: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    isPublished: {
      type: Boolean,
      default: true,
    },
    readTime: {
      type: String,
      default: '5 min read',
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

blogSchema.index({ createdAt: -1 });
blogSchema.index({ isPublished: 1 });

const Blog = mongoose.model('Blog', blogSchema);

export default Blog;
