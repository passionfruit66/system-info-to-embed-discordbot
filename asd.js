import { Client, GatewayIntentBits, EmbedBuilder } from 'discord.js';
import { readFileSync } from 'fs';
import os from 'os';
import checkDiskSpace from 'check-disk-space'; // Usar la importación correcta
import fetch from 'node-fetch'; // Para obtener la IP pública

// Leer el token y el ID del canal desde los archivos .txt
const token = readFileSync('token.txt', 'utf8').trim();
const channelId = readFileSync('channelid.txt', 'utf8').trim();

// Crear un cliente de Discord
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent],
});

const prefix = "!";  // Prefijo configurable

client.once('ready', async () => {
  console.log('Bot listo!');

  // Obtener información del sistema
  const uptime = os.uptime(); // Tiempo que lleva el sistema en ejecución
  const cpuInfo = os.cpus(); // Información de la CPU
  const platform = os.platform(); // Sistema operativo
  const arch = os.arch(); // Arquitectura (32-bit o 64-bit)
  const cpuCores = os.cpus().length; // Número de núcleos
  const hostName = os.hostname(); // Nombre del host
  const userName = os.userInfo().username; // Nombre de usuario de Windows
  
  // Obtener el espacio en disco en C: usando check-disk-space
  const diskSpace = await checkDiskSpace('C:');
  
  // Obtener la IP local (privada)
  const networkInterfaces = os.networkInterfaces();
  let localIP = '';
  for (const iface in networkInterfaces) {
    for (const ifaceDetails of networkInterfaces[iface]) {
      if (ifaceDetails.family === 'IPv4' && !ifaceDetails.internal) {
        localIP = ifaceDetails.address;
        break;
      }
    }
  }

  // Obtener la IP pública usando node-fetch
  let publicIP = '';
  try {
    const res = await fetch('https://api.ipify.org?format=json');
    const data = await res.json();
    publicIP = data.ip;
  } catch (err) {
    publicIP = 'No disponible';
  }

  // Obtener más información sobre la memoria del sistema
  const totalMemory = (os.totalmem() / (1024 * 1024 * 1024)).toFixed(2); // Total de memoria RAM (en GB)
  const freeMemory = (os.freemem() / (1024 * 1024 * 1024)).toFixed(2); // Memoria libre (en GB)

  // Crear un Embed con la información del sistema
  const embed = new EmbedBuilder()
    .setColor('#ff6600')
    .setTitle('Información del Sistema')
    .setDescription('Aquí está la información del sistema al arrancar:')
    .addFields(
      { name: 'Sistema Operativo', value: `${platform} ${arch}`, inline: true },
      { name: 'Tiempo de actividad', value: `${Math.floor(uptime / 3600)} horas`, inline: true },
      { name: 'CPU', value: `${cpuInfo[0].model} - ${cpuInfo[0].speed} MHz - ${cpuCores} núcleos`, inline: true },
      { name: 'Host', value: hostName, inline: true },
      { name: 'Usuario de Windows', value: userName, inline: true },
      { name: 'IP Local', value: localIP, inline: true },
      { name: 'IP Pública', value: publicIP, inline: true },
      { name: 'Memoria Total', value: `${totalMemory} GB`, inline: true },
      { name: 'Memoria Libre', value: `${freeMemory} GB`, inline: true },
      { name: 'Espacio en Disco C:', value: `${(diskSpace.free / (1024 * 1024 * 1024)).toFixed(2)} GB libres`, inline: true }
    )
    .setFooter({ text: 'Información de inicio del bot', iconURL: 'https://i.imgur.com/X9kJ6w8.png' })
    .setTimestamp();

  // Enviar el embed al canal
  const channel = await client.channels.fetch(channelId);
  channel.send({ embeds: [embed] });
});

// Comando para obtener la versión del bot
client.on('messageCreate', async (message) => {
  if (message.author.bot) return; // Ignorar mensajes de otros bots

  // Verifica si el mensaje es en el canal correcto
  if (message.channel.id !== channelId) return;

  // Verifica si el mensaje comienza con el prefijo
  if (message.content.startsWith(prefix)) {
    const command = message.content.slice(prefix.length).trim().toLowerCase(); // Obtener el comando sin el prefijo

    if (command === 'version') {
      const embedVersion = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('Versión del Bot')
        .setDescription('La versión actual del bot es: **0.1 Beta**')
        .setFooter({ text: 'Desarrollado por tu bot' })
        .setTimestamp();

      message.channel.send({ embeds: [embedVersion] });
    }

    if (command === 'invite') {
      const embedInvite = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('Invitación al servidor')
        .setDescription('Únete a nuestro servidor de Discord: [Invitación](https://discord.gg/Ct3NGygb7k)')
        .setFooter({ text: '¡Esperamos verte ahí!' })
        .setTimestamp();

      message.channel.send({ embeds: [embedInvite] });
    }
  }
});

// Iniciar sesión con el token
client.login(token);
