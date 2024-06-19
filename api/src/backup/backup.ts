import { Device, Prisma, PrismaClient } from "@prisma/client";
import { connectToDevice, executeCommand } from "../ssh/ssh";
import { ConnectConfig, Client } from "ssh2";
import schedule, { Job } from "node-schedule";

export const jobs = new Map<number, Job>();

export async function initialSchredule(prisma: PrismaClient) {
  const devices = await prisma.device.findMany();
  devices.forEach(async (device) => {
    const { config, frecuecy, deviceInfo } = getDeviceInfo(device);
    await makeBackupSchedule(config, deviceInfo, frecuecy, prisma);
  });
}

export function getDeviceInfo(device: Device) {
  const config = {
    host: device.host,
    port: 22,
    username: device.username,
    password: device.password,
  };

  const frecuecy = {
    days: device.frequency_days,
    hours: device.frequency_hours,
    minutes: device.frequency_minutes,
  };

  const deviceInfo = {
    id: device.id,
    name: device.name,
    limit: device.max_backup_limit,
  };

  return { config, frecuecy, deviceInfo };
}

export async function makeBackupSchedule(
  config: ConnectConfig,
  device: { id: number; name: string; limit: number },
  frecuecy: { days: number; hours: number; minutes: number },
  prisma: PrismaClient
) {
  let cronSchedule =
    `${frecuecy.minutes === 0 ? "*" : `*/${frecuecy.minutes}`} ` +
    `${frecuecy.hours === 0 ? "*" : `*/${frecuecy.hours}`} ` +
    `${frecuecy.days === 0 ? "*" : `*/${frecuecy.days}`} * *`;

  const job = schedule.scheduleJob(cronSchedule, async () => {
    console.log("Making backup");
    try {
      const conn = await connectToDevice(config);

      const backupCount = await getBackupCount(prisma, device.id);
      let countBackuptoDelete = backupCount - device.limit + 1;
      if (countBackuptoDelete < 0) countBackuptoDelete = 0;

      if (backupCount >= device.limit) {
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
  });

  jobs.set(device.id, job);

  console.log(`Scheduled job for ${device.name} every '${cronSchedule}'`);
}

export async function deleteJob(deviceId: number) {
  const job = jobs.get(deviceId);
  if (job) {
    job.cancel();
    jobs.delete(deviceId);
    console.log(`Deleted job for ${deviceId}`);
  }
}

export async function updateJob(device: Device, prisma: PrismaClient) {
  deleteJob(device.id);
  const { config, frecuecy, deviceInfo } = getDeviceInfo(device);
  await makeBackupSchedule(config, deviceInfo, frecuecy, prisma);
}

export async function makeBackUp(
  conn: Client,
  nameDevice: string
): Promise<{ backupName: string; backupDate: string }> {
  const backupDate = new Date().toISOString();
  const backupName = `${nameDevice}-${backupDate}.backup`;
  try {
    await executeCommand(conn, `/system backup save name="${backupName}"`);
    console.log(`Backup made at ${backupDate}. Filename: ${backupName}`);
  } catch (err) {
    console.error(err);
  }
  return { backupName, backupDate };
}

export async function removeBackup(conn: Client, backupName: string) {
  try {
    const output = await executeCommand(conn, `/file remove "${backupName}"`);
    if (output.length > 0) console.error(output);
  } catch (err) {
    console.error(err, "Filename:", backupName);
  }
}

export async function getBackupCount(prisma: PrismaClient, deviceId: number) {
  return prisma.backup.count({ where: { deviceId } });
}

export async function getLatestBackups(
  prisma: PrismaClient,
  deviceId: number,
  count: number
) {
  return prisma.backup.findMany({
    where: { deviceId },
    take: count,
    orderBy: { date: "asc" },
  });
}
