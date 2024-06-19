import { z } from "zod";

export const DeviceSchema = z
  .object({
    name: z.string(),
    host: z.string().ip({ message: "Debe de ser una dirección ip válida" }),
    username: z.string(),
    password: z.string(),
    frequency_days: z
      .number()
      .min(1, { message: "Debe de ser mayor que 1" })
      .optional(),
    frequency_hours: z
      .number()
      .min(1, { message: "Debe de ser mayor que 1" })
      .optional(),
    frequency_minutes: z
      .number()
      .min(1, { message: "Debe de ser mayor que 1" })
      .optional(),
    max_backup_limit: z.number().min(1, { message: "Debe de ser mayor que 1" }),
  })
  .refine(
    (data) => {
      // Comprueba si al menos uno de los campos está presente
      return (
        data.frequency_days || data.frequency_hours || data.frequency_minutes
      );
    },
    {
      message:
        "Debes proporcionar al menos una periodicidad: frequency_days, frequency_minutes o frequency_minutes.",
    }
  );
