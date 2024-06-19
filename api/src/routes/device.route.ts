import { Router } from "express";
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { DeviceSchema } from "../schema/device.schema";
import { validate } from "../middleware/validation.middleware";
import {
  deleteJob,
  getDeviceInfo,
  makeBackupSchedule,
  updateJob,
} from "../backup/backup";

const prisma = new PrismaClient();

export const deviceRouter = Router();

deviceRouter.get("/", async (_, res) => {
  const devices = await prisma.device.findMany({ include: { backups: true } });
  res.json(devices);
});

deviceRouter.get("/name", async (_, res) => {
  try {
  } catch (error) {
    console.error(error);
  }
});

deviceRouter.get("/:id/backups", async (req, res) => {
  const id = parseInt(req.params.id);
  const device = await prisma.backup.findMany({
    where: { deviceId: id },
  });
  res.json(device);
});

deviceRouter.patch("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const body = req.body;

  const device = await prisma.device.findFirst({
    include: { backups: true },
    where: { id },
  });
  if (!device)
    return res.status(400).send({ message: "El dispositivo no existe" });

  const deviceUpdated = await prisma.device.update({
    where: { id: device.id },
    data: body,
  });

  updateJob(deviceUpdated, prisma);

  res.json(deviceUpdated);
});

deviceRouter.delete("/:id", async (req, res) => {
  const id = parseInt(req.params.id);

  const device = await prisma.device.findFirst({
    where: { id },
  });
  if (!device)
    return res.status(400).send({ message: "No existe el Dispositivo" });

  await prisma.device.delete({ where: { id } });
  deleteJob(id);
  res.sendStatus(204);
});

deviceRouter.post("/", validate(DeviceSchema), async (req, res) => {
  const body = req.body;

  const existsHost = await prisma.device.findFirst({
    where: { host: body.host },
  });
  if (existsHost) return res.status(400).send({ message: "Ya existe el host" });

  const newDevice = await prisma.device.create({
    data: body,
  });

  const { config, frecuecy, deviceInfo } = getDeviceInfo(newDevice);
  await makeBackupSchedule(config, deviceInfo, frecuecy, prisma);
  res.json(newDevice);
});
