import React from "react";
import { PieChart, Pie, Cell } from "recharts";
import PropTypes from "prop-types";

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

DiskChart.propTypes = {
  disk: PropTypes.object.isRequired,
};

export default DiskChart;
