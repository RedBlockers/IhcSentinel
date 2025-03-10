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
import { formatBytes } from "./utils";

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
      <YAxis
        tickFormatter={(value) => formatBytes(value)}
        tick={{
          style: {
            whiteSpace: "nowrap", // Empêche les retours à la ligne
            overflow: "hidden", // Cache le texte qui dépasse
            textOverflow: "ellipsis", // Affiche '...' si le texte déborde
            fontFamily: "monospace", // Optionnel: assure une police uniforme et facilite le rendu des valeurs
          },
        }}
        letterSpacing={-0.7}
        width={90}
      />{" "}
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

export default NetworkChart;
