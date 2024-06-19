import express from "express";
import "dotenv/config";
import { PrismaClient } from "@prisma/client";

import { initialSchredule } from "./backup/backup";
import { deviceRouter } from "./routes/device.route";

export const prisma = new PrismaClient();

const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.json());

app.use("/devices", deviceRouter);

async function initialConfiguration() {
  await initialSchredule(prisma);
}

app.listen(PORT, () => {
  console.log(`Servidor está corriendo en http://localhost:${PORT}`);
});

initialConfiguration();
