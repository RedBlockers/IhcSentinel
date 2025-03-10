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
import PropTypes from "prop-types";
import { formatData } from "./utils";

const MemoryChart = ({ title, data, dataKey, color }) => {
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
        <YAxis type="number" domain={[0, 100]} />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey="memory.ram"
          stroke="green"
          dot={false}
          isAnimationActive={false}
          name="RAM"
        />
        <Line
          type="monotone"
          dataKey="memory.swap"
          stroke="blue"
          dot={false}
          isAnimationActive={false}
          name="Swap"
        />
      </LineChart>
    </div>
  );
};

MemoryChart.propTypes = {
  title: PropTypes.string.isRequired,
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  dataKey: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
};

export default MemoryChart;
