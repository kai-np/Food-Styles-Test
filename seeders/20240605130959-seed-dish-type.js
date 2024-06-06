"use strict";
const fs = require("fs");
const path = require("path");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const data = fs.readFileSync(
      path.join(__dirname, "..", "data", "dish-types.csv"),
      "utf-8"
    );
    const lines = data.split("\n").slice(1);
    const dishTypes = lines.map((line) => {
      const [id, name] = line.split(",");
      return { id: parseInt(id, 10), name };
    });

    return queryInterface.bulkInsert("Dish_Types", dishTypes, {});
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("Dish_Types", null, {});
  },
};
