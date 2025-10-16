import * as yup from 'yup';

export const registerSchema = yup.object({
  email: yup.string()
    .email('Invalid email format')
    .required('Email is required'),
  password: yup.string()
    .min(3, 'Password must be at least 3 characters')
    .required('Password is required'),
  username: yup.string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username cannot exceed 50 characters')
    .required('Username is required'),
});

export const loginSchema = yup.object({
  identifier: yup.string()
    .required('Email or username is required'),
  password: yup.string()
    .required('Password is required'),
});

export const updateUserSchema = yup.object({
    username: yup
        .string()
        .min(3, "Username must be at least 3 characters")
        .max(50, "Username cannot exceed 50 characters")
        .required("Username is required"),
    email: yup
        .string()
        .email("Invalid email format")
        .required("Email is required"),
    password: yup
        .string()
        .min(3, "Password must be at least 3 characters")
        .required("Password is required"),
    role: yup
        .string()
        .oneOf(["USER", "ADMIN"], "Role must be either USER or ADMIN")
        .optional(),
});

export const userIdSchema = yup.object({
  id: yup.string()
    .required('User ID is required')
    .transform(value => String(value)),
});

export const createCategorySchema = yup.object({
  name: yup.string()
    .min(2, 'Category name must be at least 2 characters')
    .required('Category name is required'),
  parentId: yup.number()
    .integer('Parent category ID must be an integer')
    .positive('Parent category ID must be positive')
    .nullable()
    .optional(),
});

export const updateCategorySchema = yup.object({
  name: yup.string()
    .min(2, 'Category name must be at least 2 characters')
    .optional(),
  parentId: yup.number()
    .integer('Parent category ID must be an integer')
    .positive('Parent category ID must be positive')
    .nullable()
    .optional(),
});

export const categoryIdSchema = yup.object({
  id: yup.string()
    .required('Category ID is required')
    .transform(value => String(value)),
});

export const createProductSchema = yup.object({
  name: yup.string()
    .min(2, 'Product name must be at least 2 characters')
    .required('Product name is required'),
  description: yup.string()
    .required('Product description is required'),
  price: yup.number()
    .positive('Price must be a positive number')
    .required('Price is required'),
  categoryId: yup.number()
    .integer('Category ID must be an integer')
    .positive('Category ID must be positive')
    .required('Category ID is required'),
  stock: yup.number()
    .integer('Stock must be an integer')
    .min(0, 'Stock cannot be negative')
    .default(0)
    .optional(),
  imageUrl: yup.string()
    .url('Invalid URL format')
    .optional(),
});

export const updateProductSchema = yup.object({
  name: yup.string()
    .min(2, 'Product name must be at least 2 characters')
    .optional(),
  description: yup.string()
    .optional(),
  price: yup.number()
    .positive('Price must be a positive number')
    .optional(),
  categoryId: yup.number()
    .integer('Category ID must be an integer')
    .positive('Category ID must be positive')
    .optional(),
  stock: yup.number()
    .integer('Stock must be an integer')
    .min(0, 'Stock cannot be negative')
    .optional(),
  imageUrl: yup.string()
    .url('Invalid URL format')
    .optional(),
});

export const productIdSchema = yup.object({
  id: yup.string()
    .required('Product ID is required')
    .transform(value => String(value)),
});

export const paginationSchema = yup.object({
  page: yup.number()
    .integer('Page must be an integer')
    .positive('Page must be positive')
    .default(1),
  limit: yup.number()
    .integer('Limit must be an integer')
    .positive('Limit must be positive')
    .max(100, 'Limit cannot exceed 100')
    .default(10),
  search: yup.string()
    .optional(),
});

export const productQuerySchema = yup.object({
  page: yup.number()
    .integer('Page must be an integer')
    .positive('Page must be positive')
    .default(1),
  limit: yup.number()
    .integer('Limit must be an integer')
    .positive('Limit must be positive')
    .max(100, 'Limit cannot exceed 100')
    .default(10),
  search: yup.string()
    .optional(),
  categoryId: yup.number()
    .integer('Category ID must be an integer')
    .positive('Category ID must be positive')
    .optional(),
  minPrice: yup.number()
    .positive('Minimum price must be positive')
    .optional(),
  maxPrice: yup.number()
    .positive('Maximum price must be positive')
    .optional(),
});
  