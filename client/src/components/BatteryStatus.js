import React from "react";
import {
  MdBatteryFull,
  MdBattery90,
  MdBattery80,
  MdBattery60,
  MdBattery50,
  MdBattery30,
  MdBattery20,
  MdBatteryCharging20,
  MdBatteryCharging30,
  MdBatteryCharging50,
  MdBatteryCharging60,
  MdBatteryCharging80,
  MdBatteryCharging90,
  MdBatteryAlert,
  MdBatteryChargingFull,
} from "react-icons/md";
import PropTypes from "prop-types";
import { formatHours } from "./utils"; // Une fonction pour formater les heures restantes

const BatteryStatus = ({ battery }) => {
  // Déterminer le niveau de la batterie
  const percent = battery.percent;
  const left = battery.left;
  const plugged = battery.plugged; // Indication si la batterie est branchée
  let batteryIcon;

  const iconStyle = { fontSize: "100px" };

  switch (true) {
    case percent > 90:
      batteryIcon = plugged ? (
        <MdBatteryChargingFull style={{ ...iconStyle, color: "green" }} />
      ) : (
        <MdBatteryFull style={{ ...iconStyle, color: "green" }} />
      );
      break;
    case percent > 80:
      batteryIcon = plugged ? (
        <MdBatteryCharging90 style={{ ...iconStyle, color: "green" }} />
      ) : (
        <MdBattery90 style={{ ...iconStyle, color: "green" }} />
      );
      break;
    case percent > 60:
      batteryIcon = plugged ? (
        <MdBatteryCharging80 style={{ ...iconStyle, color: "green" }} />
      ) : (
        <MdBattery80 style={{ ...iconStyle, color: "green" }} />
      );
      break;
    case percent > 50:
      batteryIcon = plugged ? (
        <MdBatteryCharging60 style={{ ...iconStyle, color: "green" }} />
      ) : (
        <MdBattery60 style={{ ...iconStyle, color: "green" }} />
      );
      break;
    case percent > 30:
      batteryIcon = plugged ? (
        <MdBatteryCharging50 style={{ ...iconStyle, color: "orange" }} />
      ) : (
        <MdBattery50 style={{ ...iconStyle, color: "orange" }} />
      );
      break;
    case percent > 20:
      batteryIcon = plugged ? (
        <MdBatteryCharging30 style={{ ...iconStyle, color: "orange" }} />
      ) : (
        <MdBattery30 style={{ ...iconStyle, color: "orange" }} />
      );
      break;
    case percent > 10:
      batteryIcon = plugged ? (
        <MdBatteryCharging20 style={{ ...iconStyle, color: "red" }} />
      ) : (
        <MdBattery20 style={{ ...iconStyle, color: "red" }} />
      );
      break;
    default:
      batteryIcon = <MdBatteryAlert style={{ ...iconStyle, color: "red" }} />;
      break;
  }

  return (
    <div
      style={{
        width: "150px",
        height: "300px",
        border: "1px solid #ddd",
        padding: "10px",
        borderRadius: "10px",
        textAlign: "center",
        fontFamily: "Arial",
      }}
    >
      <h3>Batterie</h3>
      <div style={{ fontSize: "50px" }}>{batteryIcon}</div>
      <p style={{ fontSize: "18px", fontWeight: "bold" }}>{percent}%</p>
      <p style={{ fontSize: "14px", color: "#666" }}>
        {left ? left : "Non disponible"}
      </p>

      {/* Si la batterie est branchée, ajouter une icône ou un texte */}
      {plugged && percent === 100 ? (
        <div style={{ fontSize: "20px", color: "green" }}>
          <MdBatteryChargingFull /> Chargée
        </div>
      ) : plugged ? (
        <div style={{ fontSize: "16px", color: "#666" }}>
          <MdBatteryCharging90 /> En charge
        </div>
      ) : (
        <div style={{ fontSize: "16px", color: "#666" }}>
          <MdBatteryCharging90 /> Déchargement
        </div>
      )}
    </div>
  );
};

BatteryStatus.propTypes = {
  battery: PropTypes.shape({
    percent: PropTypes.number.isRequired,
    left: PropTypes.number, // Temps restant en secondes
    plugged: PropTypes.bool.isRequired, // Indique si la batterie est branchée
  }).isRequired,
};

export default BatteryStatus;
