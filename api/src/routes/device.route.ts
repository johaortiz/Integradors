import { Router } from "express";
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { DeviceSchema } from "../schema/device.schema";
import { validate } from "../middleware/validation.middleware";
import {
  deleteJob,
  getBackupCount,
  getDeviceInfo,
  getLatestBackups,
  makeBackUp,
  makeBackupSchedule,
  removeBackup,
  updateJob,
} from "../backup/backup";
import { connectToDevice } from "../ssh/ssh";

const prisma = new PrismaClient();

export const deviceRouter = Router();

deviceRouter.get("/", async (_, res) => {
  const devices = await prisma.device.findMany();
  res.json(devices);
});

deviceRouter.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const device = await prisma.device.findFirst({where:{id}, include: { backups: true } });
  res.json(device);
});

deviceRouter.post("/:id/backups", async (req, res) => {
  const id = parseInt(req.params.id);
  const device:any = await prisma.device.findFirst({
    where: { id },
  });

  if (device === null)
    return res.status(400).send({ message: "El dispositivo no existe" });

  const { config } = getDeviceInfo(device);
  try {
    const conn = await connectToDevice(config);

    const backupCount = await getBackupCount(prisma, device.id);
    
    console.log(device);

    let countBackuptoDelete = backupCount - device.max_backup_limit + 1;
    if (countBackuptoDelete < 0) countBackuptoDelete = 0;

    if (backupCount >= device.max_backup_limit) {
      const lastBackup = await getLatestBackups(
        prisma,
        device.id,
        countBackuptoDelete
      );
      if (lastBackup != null)
        lastBackup.forEach(async (backup) => {
          console.log("Removing: ", backup.name, " from device ", device.id);
          await removeBackup(conn, backup.name);
          await prisma.backup.delete({ where: { id: backup.id } });
        });
    }

    const { backupName, backupDate } = await makeBackUp(conn, device.name);
    await prisma.backup.create({
      data: { name: backupName, deviceId: device.id, date: backupDate },
    });

    conn.end();
  } catch (error) {
    console.log(`Failed to create a backup of device  ${config.host}`);
  }

  res.send(true);
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

  await prisma.backup.deleteMany({ where: { deviceId: id } });
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
