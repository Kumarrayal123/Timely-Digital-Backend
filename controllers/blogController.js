import Blog from '../models/Blog.js';

// Auto-seed default blog if none exist
export const initDefaultBlogs = async () => {
  try {
    const slug = 'healthcare-digital-marketing-packages-india';
    const existing = await Blog.findOne({ slug });
    if (!existing) {
      await Blog.create({
        title: 'Healthcare Digital Marketing Packages in India: Pricing, Features & Guide',
        slug,
        excerpt:
          'Explore comprehensive healthcare digital marketing packages in India — features, pricing breakdown, and how to choose the right plan for hospitals, clinics, diagnostic labs, and doctors. Learn how strategic SEO, ads, and content drive qualified patient enquiries and measurable ROI.',
        content: `Explore comprehensive healthcare digital marketing packages in India — features, pricing breakdown, and how to choose the right plan for hospitals, clinics, diagnostic labs, and doctors. Learn how strategic SEO, ads, and content drive qualified patient enquiries and measurable ROI.

Key pillars of modern healthcare marketing:
1. Local Medical SEO (Google Business Profile & Map Pack)
2. High-Intent Patient Search Ads (Google Ads for treatments)
3. Social Proof & Patient Testimonials
4. Educational Medical Content & Video Marketing
5. Seamless Lead Capture and Follow-up CRM systems

At Timely Digital, our packages are tailored specifically for doctors, clinics, diagnostics, and multi-specialty hospitals to ensure sustainable patient influx.`,
        category: 'Healthcare Marketing',
        author: 'Timely Health Team',
        readTime: '15 min read',
        isPublished: true,
        coverImage: '',
        tags: ['Healthcare Marketing', 'SEO & Ads', 'Pricing Guide', 'Hospital Growth'],
      });
      console.log('📚 Default blog post seeded: Healthcare Digital Marketing Packages in India');
    }
  } catch (error) {
    console.error('Error seeding default blog:', error.message);
  }
};

/**
 * @desc    Get all blogs
 * @route   GET /api/blogs
 * @access  Public
 */
export const getAllBlogs = async (req, res) => {
  try {
    const { category, search, all } = req.query;

    const query = {};
    // Only return published blogs to public unless 'all' is requested (for admin)
    if (all !== 'true') {
      query.isPublished = true;
    }

    if (category) {
      query.category = category;
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [{ title: searchRegex }, { excerpt: searchRegex }, { content: searchRegex }];
    }

    const blogs = await Blog.find(query).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: blogs.length,
      data: blogs,
    });
  } catch (error) {
    console.error('Error getting blogs:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving blogs.',
    });
  }
};

/**
 * @desc    Get blog by slug or ID
 * @route   GET /api/blogs/:slug
 * @access  Public
 */
export const getBlogBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    let blog;

    if (slug.match(/^[0-9a-fA-F]{24}$/)) {
      blog = await Blog.findById(slug);
    } else {
      blog = await Blog.findOne({ slug });
    }

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found.',
      });
    }

    // Increment views
    blog.views = (blog.views || 0) + 1;
    await blog.save();

    return res.status(200).json({
      success: true,
      data: blog,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving blog.',
    });
  }
};

/**
 * @desc    Create a new blog
 * @route   POST /api/blogs
 * @access  Protected (Admin)
 */
export const createBlog = async (req, res) => {
  try {
    const { title, slug, excerpt, content, coverImage, author, category, tags, isPublished, readTime } = req.body;

    if (!title || !excerpt || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title, excerpt, and content are required.',
      });
    }

    const finalSlug = (slug || title)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const existingSlug = await Blog.findOne({ slug: finalSlug });
    if (existingSlug) {
      return res.status(400).json({
        success: false,
        message: 'A blog with this title or slug already exists. Please choose a different title/slug.',
      });
    }

    const blog = await Blog.create({
      title,
      slug: finalSlug,
      excerpt,
      content,
      coverImage: coverImage || '',
      author: author || 'Timely Digital Team',
      category: category || 'Healthcare Marketing',
      tags: Array.isArray(tags) ? tags : typeof tags === 'string' ? tags.split(',').map((t) => t.trim()) : [],
      isPublished: isPublished !== undefined ? isPublished : true,
      readTime: readTime || '5 min read',
    });

    return res.status(201).json({
      success: true,
      message: 'Blog created successfully!',
      data: blog,
    });
  } catch (error) {
    console.error('Error creating blog:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error creating blog.',
      error: error.message,
    });
  }
};

/**
 * @desc    Update a blog
 * @route   PUT /api/blogs/:id
 * @access  Protected (Admin)
 */
export const updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found.',
      });
    }

    const { title, slug, excerpt, content, coverImage, author, category, tags, isPublished, readTime } = req.body;

    if (title) blog.title = title;
    if (slug) blog.slug = slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    if (excerpt) blog.excerpt = excerpt;
    if (content) blog.content = content;
    if (coverImage !== undefined) blog.coverImage = coverImage;
    if (author) blog.author = author;
    if (category) blog.category = category;
    if (tags !== undefined) {
      blog.tags = Array.isArray(tags) ? tags : typeof tags === 'string' ? tags.split(',').map((t) => t.trim()) : [];
    }
    if (isPublished !== undefined) blog.isPublished = isPublished;
    if (readTime) blog.readTime = readTime;

    const updatedBlog = await blog.save();

    return res.status(200).json({
      success: true,
      message: 'Blog updated successfully!',
      data: updatedBlog,
    });
  } catch (error) {
    console.error('Error updating blog:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error updating blog.',
    });
  }
};

/**
 * @desc    Delete a blog
 * @route   DELETE /api/blogs/:id
 * @access  Protected (Admin)
 */
export const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Blog deleted successfully.',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error deleting blog.',
    });
  }
};
