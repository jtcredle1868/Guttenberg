import { Request, Response, NextFunction } from 'express';

// ─── Field Schema Types ───────────────────────────────────────────────────────

type FieldType = 'string' | 'number' | 'boolean' | 'array' | 'object';

interface FieldSchema {
  type: FieldType;
  required?: boolean;
  /** Allowed values (enum check) */
  enum?: readonly (string | number)[];
  /** Min length (string) or min value (number) */
  min?: number;
  /** Max length (string) or max value (number) */
  max?: number;
  /** Regex pattern for strings */
  pattern?: RegExp;
  /** Custom validator; return an error string or null */
  validate?: (value: unknown) => string | null;
}

export type Schema = Record<string, FieldSchema>;

interface ValidationError {
  field: string;
  message: string;
}

// ─── Core validator ───────────────────────────────────────────────────────────

function validateField(
  name: string,
  value: unknown,
  schema: FieldSchema
): ValidationError | null {
  const missing = value === undefined || value === null || value === '';

  if (missing) {
    if (schema.required) return { field: name, message: `'${name}' is required.` };
    return null; // optional and absent – skip remaining checks
  }

  // Type check
  if (schema.type === 'array') {
    if (!Array.isArray(value)) {
      return { field: name, message: `'${name}' must be an array.` };
    }
    if (schema.min !== undefined && (value as unknown[]).length < schema.min) {
      return { field: name, message: `'${name}' must contain at least ${schema.min} item(s).` };
    }
    if (schema.max !== undefined && (value as unknown[]).length > schema.max) {
      return { field: name, message: `'${name}' must contain at most ${schema.max} item(s).` };
    }
  } else if (schema.type === 'object') {
    if (typeof value !== 'object' || Array.isArray(value)) {
      return { field: name, message: `'${name}' must be an object.` };
    }
  } else if (typeof value !== schema.type) {
    return { field: name, message: `'${name}' must be of type ${schema.type}.` };
  }

  // String-specific checks
  if (schema.type === 'string' && typeof value === 'string') {
    if (schema.min !== undefined && value.length < schema.min) {
      return { field: name, message: `'${name}' must be at least ${schema.min} character(s).` };
    }
    if (schema.max !== undefined && value.length > schema.max) {
      return { field: name, message: `'${name}' must be at most ${schema.max} character(s).` };
    }
    if (schema.pattern && !schema.pattern.test(value)) {
      return { field: name, message: `'${name}' has an invalid format.` };
    }
  }

  // Number-specific checks
  if (schema.type === 'number' && typeof value === 'number') {
    if (!isFinite(value)) {
      return { field: name, message: `'${name}' must be a finite number.` };
    }
    if (schema.min !== undefined && value < schema.min) {
      return { field: name, message: `'${name}' must be at least ${schema.min}.` };
    }
    if (schema.max !== undefined && value > schema.max) {
      return { field: name, message: `'${name}' must be at most ${schema.max}.` };
    }
  }

  // Enum check
  if (schema.enum !== undefined) {
    if (!(schema.enum as (string | number)[]).includes(value as string | number)) {
      const allowed = schema.enum.join(', ');
      return { field: name, message: `'${name}' must be one of: ${allowed}.` };
    }
  }

  // Custom validator
  if (schema.validate) {
    const msg = schema.validate(value);
    if (msg) return { field: name, message: msg };
  }

  return null;
}

// ─── Middleware factory ───────────────────────────────────────────────────────

/**
 * Returns an Express middleware that validates req.body against the given schema.
 * On failure it responds with 400 / GUT-4001 listing all validation errors.
 */
export function validate(schema: Schema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const errors: ValidationError[] = [];
    const body = (req.body as Record<string, unknown>) || {};

    for (const [fieldName, fieldSchema] of Object.entries(schema)) {
      const err = validateField(fieldName, body[fieldName], fieldSchema);
      if (err) errors.push(err);
    }

    if (errors.length > 0) {
      res.status(400).json({
        success: false,
        error: {
          code:       'GUT-4001',
          message:    'Validation failed',
          detail:     errors.map((e) => e.message).join(' '),
          fields:     errors,
          resolution: 'Correct the listed field errors and resubmit.',
          docs_url:   'https://docs.guttenberg.io/errors/GUT-4001',
        },
      });
      return;
    }

    next();
  };
}

// ─── Convenience schemas for common patterns ─────────────────────────────────

export const Schemas = {
  email: (required = true): FieldSchema => ({
    type: 'string',
    required,
    min: 3,
    max: 254,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  }),

  positiveNumber: (required = true): FieldSchema => ({
    type: 'number',
    required,
    min: 0,
  }),

  shortString: (required = true): FieldSchema => ({
    type: 'string',
    required,
    min: 1,
    max: 500,
  }),
};
