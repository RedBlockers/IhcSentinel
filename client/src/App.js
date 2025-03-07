import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const formatBytes = (bytes) => {
  if (typeof bytes !== "number" || isNaN(bytes)) return "0 B/s";
  if (bytes === 0) return "0 B/s";
  const k = 1024;
  const sizes = ["B/s", "KB/s", "MB/s", "GB/s", "TB/s"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (
    new Intl.NumberFormat().format(
      parseFloat((bytes / Math.pow(k, i)).toFixed(2))
    ) +
    " " +
    sizes[i]
  );
};

const formatData = (data, dataKey) => {
  return data.map((entry) => ({
    ...entry,
    [dataKey]: entry[dataKey],
    [`${dataKey}Formatted`]:
      dataKey === "network" ? formatBytes(entry[dataKey]) : entry[dataKey],
  }));
};

const App = () => {
  const defaultData = [
    { time: "00:00", cpu: [0, 0], ram: 0, network: 0 },
    { time: "00:01", cpu: [0, 0], ram: 0, network: 0 },
    { time: "00:02", cpu: [0, 0], ram: 0, network: 0 },
    { time: "00:03", cpu: [0, 0], ram: 0, network: 0 },
    { time: "00:04", cpu: [0, 0], ram: 0, network: 0 },
  ];

  const [data, setData] = useState(defaultData); // Utilisation de valeurs par défaut pour 'data'

  useEffect(() => {
    const socket = new WebSocket(
      `ws://localhost:5000?machine_id=${
        JSON.parse(localStorage.getItem("currentAgent")).uuid
      }`
    );
    socket.onmessage = (event) => {
      const newData = JSON.parse(event.data);
      console.log("Données reçues :", newData);

      setData((prevData) => {
        const updatedData = [
          ...prevData,
          { time: new Date().toLocaleTimeString(), ...newData },
        ];
        return updatedData.slice(-20); // Garde seulement les 20 dernières valeurs
      });
    };

    return () => socket.close();
  }, []);

  // Fonction pour calculer les données du disque
  const getDiskData = (disk) => {
    return Object.keys(disk).map((diskKey) => {
      const totalSpace = disk[diskKey].total; // Espace total
      const usedSpace = disk[diskKey].used; // Espace utilisé
      const freeSpace = disk[diskKey].free; // Espace libre

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
      <h1>🖥️ Monitoring en temps réel</h1>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          flexWrap: "wrap",
          gap: "20px",
        }}
      >
        <CpuChart data={data} />
        <Chart title="RAM Usage (%)" data={data} dataKey="ram" color="blue" />
        <NetworkChart data={data} />
        {diskData.length > 0 &&
          diskData.map((disk, index) => <DiskChart key={index} disk={disk} />)}
      </div>
    </div>
  );
};

const CpuChart = ({ data }) => {
  if (data.length === 0) return null;

  const numCores = data[data.length - 1].cpu.length;

  return (
    <div
      style={{
        width: "400px",
        height: "300px",
        border: "1px solid #ddd",
        padding: "10px",
        borderRadius: "10px",
      }}
    >
      <h3>Utilisation CPU (%)</h3>
      <LineChart width={350} height={250} data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="time" />
        <YAxis />
        <Tooltip />
        {numCores <= 12 && <Legend />}
        {Array.from({ length: numCores }).map((_, index) => (
          <Line
            key={index}
            type="monotone"
            dataKey={`cpu[${index}]`}
            stroke={`hsl(${(index * 60) % 360}, 70%, 50%)`}
            dot={false}
            isAnimationActive={false} // Désactiver l'animation
          />
        ))}
      </LineChart>
    </div>
  );
};

const Chart = ({ title, data, dataKey, color }) => {
  const formattedData = formatData(data, dataKey);

  return (
    <div
      style={{
        width: "400px",
        height: "300px",
        border: "1px solid #ddd",
        padding: "10px",
        borderRadius: "10px",
      }}
    >
      <h3>{title}</h3>
      <LineChart width={350} height={250} data={formattedData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="time" />
        <YAxis />
        <Tooltip
          formatter={(value, name, props) => {
            const formattedValue =
              name === dataKey && name === "network"
                ? props.payload[`${dataKey}Formatted`]
                : value;
            return [formattedValue, name];
          }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </div>
  );
};

const DiskChart = ({ disk }) => {
  const { name, used, free, usedFormatted, freeFormatted } = disk;

  return (
    <div
      style={{
        width: "400px",
        height: "350px",
        border: "1px solid #ddd",
        padding: "10px",
        borderRadius: "10px",
      }}
    >
      <h3 style={{ marginBottom: "0px", paddingBottom: "0px" }}>
        Disque {name}
      </h3>
      <PieChart width={350} height={250}>
        <Pie
          data={[
            { name: "Used", value: used },
            { name: "Free", value: free },
          ]}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius="80%"
          fill="#8884d8"
          label
          animationDuration={500}
        >
          <Cell fill="#ff7300" />
          <Cell fill="#00C49F" />
        </Pie>
      </PieChart>
      <div style={{ textAlign: "center" }}>
        <p style={{ marginBottom: "4px", marginTop: "4px" }}>
          <strong>Espace utilisé :</strong> {usedFormatted.replace("/s", "")}
        </p>
        <p>
          <strong>Espace libre :</strong> {freeFormatted.replace("/s", "")}
        </p>
      </div>
    </div>
  );
};

const NetworkChart = ({ data }) => (
  <div
    style={{
      width: "400px",
      height: "300px",
      border: "1px solid #ddd",
      padding: "10px",
      borderRadius: "10px",
    }}
  >
    <h3>Réseau (In/Out)</h3>
    <LineChart width={350} height={250} data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="time" />
      <YAxis />
      <Tooltip formatter={(value) => formatBytes(value)} />
      <Legend />
      <Line
        type="monotone"
        dataKey="network.in"
        stroke="green"
        dot={false}
        isAnimationActive={false}
        name="Entrant"
      />
      <Line
        type="monotone"
        dataKey="network.out"
        stroke="red"
        dot={false}
        isAnimationActive={false}
        name="Sortant"
      />
    </LineChart>
  </div>
);

NetworkChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
};

DiskChart.propTypes = {
  disk: PropTypes.object.isRequired,
};

Chart.propTypes = {
  title: PropTypes.string.isRequired,
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  dataKey: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
};

export default App;
