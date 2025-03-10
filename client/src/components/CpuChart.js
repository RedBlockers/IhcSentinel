import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

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
        <YAxis type="number" domain={[0, 100]} />
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

export default CpuChart;
