const http = require("http");
const express = require("express");
const path = require("path");
const socketIo = require("socket.io");
const WebSocket = require("ws");
const url = require("url");

const wss = new WebSocket.Server({ port: 5000 });

// Stocker les connexions des agents de monitoring
const clients = new Set();

wss.on("connection", (ws, req) => {
  console.log("Nouvelle connexion d'un agent de monitoring");
  const machineId = url.parse(req.url, true).query.machine_id || null;

  clients.add({ ws: ws, machineId: machineId });

  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message);
      console.log(`Données reçues :`, data);

      // Diffuser les données à tous les clients WebSocket connectés
      clients.forEach((client) => {
        if (client.ws.readyState === WebSocket.OPEN) {
          if (client.machineId && client.machineId !== data.machine_id) {
            return;
          }
          client.ws.send(JSON.stringify(data));
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
