import type { Request, Response, NextFunction } from 'express';
import type { ObjectSchema, ValidationError as JoiValidationError } from 'joi';
import { ValidationError } from '../utils/errors';

type ValidationSource = 'body' | 'query' | 'params';

function formatValidationMessage(error: JoiValidationError): string {
  return error.details.map((detail) => detail.message).join('; ');
}

export function validate(schema: ObjectSchema, source: ValidationSource = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });

    if (error) {
      next(new ValidationError(formatValidationMessage(error)));
      return;
    }

    req.validated = {
      ...req.validated,
      [source]: value,
    };

    if (source === 'body') {
      req.body = value;
    } else {
      Object.assign(req[source], value);
    }

    next();
  };
}
