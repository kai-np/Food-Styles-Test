"use strict";
const fs = require("fs");
const path = require("path");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const data = fs.readFileSync(
      path.join(__dirname, "..", "data", "cities.csv"),
      "utf-8"
    );
    const lines = data.split("\n").slice(1);
    const cities = lines.map((line) => {
      const [id, name] = line.split(",");
      return { id: parseInt(id, 10), name };
    });

    return queryInterface.bulkInsert("Cities", cities, {});
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("Cities", null, {});
  },
};
