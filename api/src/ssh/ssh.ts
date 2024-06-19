import { Client, ConnectConfig } from "ssh2";

export async function connectToDevice(config: ConnectConfig): Promise<Client> {
  return new Promise((resolve, reject) => {
    const conn = new Client();
    conn
      .on("ready", () => {
        resolve(conn);
      })
      .on("error", (err) => {
        console.log(
          `Error connecting the device ${config.host}. ${err.message}`
        );
        reject(err);
      })
      .connect(config);
  });
}

export async function executeCommand(
  conn: Client,
  command: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    conn.exec(command, (err, stream) => {
      if (err) return reject(err);
      let output: string = "";
      stream
        .on("close", (code: any, signal: any) => {
          resolve(output);
        })
        .on("data", (data: any) => {
          output += data;
        })
        .stderr.on("data", (data: any) => {
          reject(data);
        });
    });
  });
}
