import React from "react";

const AppCard = ({ name, url }) => {
  const handleClick = () => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      onClick={handleClick}
      className="cursor-pointer p-6 bg-white rounded-xl shadow hover:shadow-lg transition"
    >
      <h3 className="text-xl font-semibold mb-2">{name}</h3>
      <p className="text-gray-600">Click to open {name}</p>
    </div>
  );
};

export default AppCard;
