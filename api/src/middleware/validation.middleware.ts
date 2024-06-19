import { NextFunction, Request, Response } from "express";
import { Schema } from "zod";

export const validate =
  (schema: Schema) => (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json(result.error.errors);
    }
    next();
  };
