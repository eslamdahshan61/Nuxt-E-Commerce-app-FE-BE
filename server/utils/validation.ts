import * as yup from 'yup';
import { createError } from 'h3';

export async function validateBody<T>(schema: yup.Schema<T>, data: unknown): Promise<T> {
  try {
    return await schema.validate(data, { abortEarly: false, stripUnknown: true });
  } catch (error: unknown) {
    if (error instanceof yup.ValidationError) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Validation failed',
        data: error.inner.map((err: yup.ValidationError) => ({
          field: err.path,
          message: err.message,
          value: err.value,
        })),
      });
    }
    throw error;
  }
}

export async function validateQuery<T>(schema: yup.Schema<T>, data: unknown): Promise<T> {
  try {
    return await schema.validate(data, { abortEarly: false, stripUnknown: true });
  } catch (error: unknown) {
    if (error instanceof yup.ValidationError) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Validation failed',
        data: error.inner.map((err: yup.ValidationError) => ({
          field: err.path,
          message: err.message,
          value: err.value,
        })),
      });
    }
    throw error;
  }
}

export async function validateParams<T>(schema: yup.Schema<T>, data: unknown): Promise<T> {
  try {
    return await schema.validate(data, { abortEarly: false, stripUnknown: true });
  } catch (error: unknown) {
    if (error instanceof yup.ValidationError) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid path parameters',
        data: error.inner.map((err: yup.ValidationError) => ({
          field: err.path,
          message: err.message,
          value: err.value,
        })),
      });
    }
    throw error;
  }
}
