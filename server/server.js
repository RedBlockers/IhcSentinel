const http = require("http");
const express = require("express");
const path = require("path");
const socketIo = require("socket.io");
const WebSocket = require("ws");
const url = require("url");

const wss = new WebSocket.Server({ port: 5000 });

// Stocker les connexions des agents de monitoring
const clients = new Set();
let agents = [];

wss.on("connection", (ws, req) => {
  console.log("Nouvelle connexion d'un agent de monitoring");
  const machineId = url.parse(req.url, true).query.machine_id || null;

  if (!agents[machineId]) {
    agents[machineId] = [];
  }

  clients.add({ ws: ws, machineId: machineId });

  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message);
      console.log(`Données reçues :`, data);
      agents[machineId].push(data);
      if (agents[machineId].length > 20) {
        agents[machineId].shift();
      }
      // Diffuser les données à tous les clients WebSocket connectés
      clients.forEach((client) => {
        if (client.ws.readyState === WebSocket.OPEN) {
          if (client.machineId && client.machineId !== data.machine_id) {
            return;
          }
          client.ws.send(JSON.stringify(agents[machineId]));
        }
      });
    } catch (err) {
      console.error("Erreur lors du traitement des données reçues :", err);
    }
  });

  ws.on("close", () => {
    console.log("Connexion fermée");
    clients.forEach((client) => {
      if (client.ws === ws) {
        clients.delete(client);
      }
    });
  });
});
