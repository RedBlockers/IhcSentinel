import React, { useState, useEffect } from "react";
import CpuChart from "./components/CpuChart.js";
import MemoryChart from "./components/MemoryChart.js";
import DiskChart from "./components/DiskChart.js";
import NetworkChart from "./components/NetworkChart.js";
import DiskBandwidthChart from "./components/DiskBandwidthChart.js";
import { formatBytes } from "./components/utils.js";
import BatteryStatus from "./components/BatteryStatus.js";

const App = () => {
  const defaultData = [
    { time: "00:00", cpu: [0, 0], ram: 0, network: 0 },
    { time: "00:01", cpu: [0, 0], ram: 0, network: 0 },
    { time: "00:02", cpu: [0, 0], ram: 0, network: 0 },
    { time: "00:03", cpu: [0, 0], ram: 0, network: 0 },
    { time: "00:04", cpu: [0, 0], ram: 0, network: 0 },
  ];

  const [data, setData] = useState(defaultData);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    let uuid = "";
    try {
      uuid = JSON.parse(localStorage.getItem("currentAgent")).uuid;
    } catch (error) {
      uuid = "unknown";
    }

    let socket;
    let reconnectInterval = 2000; // Attente avant reconnexion en ms

    const connect = () => {
      socket = new WebSocket(`ws://localhost:5000?machine_id=${uuid}`);

      socket.onopen = () => {
        console.log("✅ Connecté au serveur WebSocket !");
        setIsConnected(true);
      };

      socket.onmessage = (event) => {
        const newData = JSON.parse(event.data);
        console.log("📡 Données reçues :", newData);
        setData(newData);
      };

      socket.onclose = () => {
        console.log(
          "❌ Connexion WebSocket fermée. Tentative de reconnexion..."
        );
        setIsConnected(false);
        setTimeout(connect, reconnectInterval); // Tentative de reconnexion
      };

      socket.onerror = (error) => {
        console.error("⚠️ Erreur WebSocket :", error);
        socket.close(); // Forcer la fermeture pour relancer la connexion
      };
    };

    connect(); // Démarrer la connexion

    return () => {
      socket.close(); // Fermer la connexion proprement en cas de démontage du composant
    };
  }, []);

  const getDiskData = (disk) => {
    return Object.keys(disk).map((diskKey) => {
      const totalSpace = disk[diskKey].total;
      const usedSpace = disk[diskKey].used;
      const freeSpace = disk[diskKey].free;

      return {
        name: diskKey,
        used: usedSpace,
        free: freeSpace,
        total: totalSpace,
        usedFormatted: formatBytes(usedSpace),
        freeFormatted: formatBytes(freeSpace),
      };
    });
  };

  const diskData = data[data.length - 1]?.disk
    ? getDiskData(data[data.length - 1].disk)
    : [];

  return (
    <div style={{ textAlign: "center", fontFamily: "Arial" }}>
      <div className="d-flex justify-content-between align-items-center flex-row">
        <h1 className="mx-auto">🖥️ Monitoring en temps réel</h1>
        <button className="btn btn-secondary ml-auto mx-3">Bouton</button>
      </div>
      <p style={{ color: isConnected ? "green" : "red" }}>
        {isConnected
          ? "🟢 Connecté au serveur"
          : "🔴 Déconnecté, tentative de reconnexion..."}
      </p>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          flexWrap: "wrap",
          gap: "20px",
        }}
      >
        <CpuChart data={data} />
        <MemoryChart
          title="RAM Usage (%)"
          data={data}
          dataKey="ram"
          color="blue"
        />
        <BatteryStatus
          battery={data[data.length - 1]?.battery || { percent: 0, left: 0 }}
        />
        <NetworkChart data={data} />
        <DiskBandwidthChart data={data} />
        {diskData.length > 0 &&
          diskData.map((disk, index) => <DiskChart key={index} disk={disk} />)}
      </div>
    </div>
  );
};

export default App;
