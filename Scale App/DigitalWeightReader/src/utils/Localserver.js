// src/utils/LocalServer.js
import StaticServer from 'react-native-static-server';
import RNFS from 'react-native-fs';

let server = null;

export const startLocalServer = async () => {
  const directory = RNFS.DownloadDirectoryPath; // or your app cache dir
  server = new StaticServer(8080, directory, { localOnly: true });
  const url = await server.start();
  console.log('📡 Local server running at:', url);
  return url; // e.g. http://127.0.0.1:8080
};

export const stopLocalServer = async () => {
  if (server) await server.stop();
};
