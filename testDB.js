// testDB.js
const { Sequelize, DataTypes } = require("sequelize");
const config = require("./config/config.json").development;

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    dialect: config.dialect,
  }
);

const City = sequelize.define(
  "City",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  },
  { timestamps: false }
);

const Brand = sequelize.define(
  "Brand",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  },
  { timestamps: false }
);

const Dish_Type = sequelize.define(
  "Dish_Type",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  },
  { timestamps: false }
);

const Diet = sequelize.define(
  "Diet",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  },
  { timestamps: false }
);

async function checkTablesAndCountRows() {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");

    const tables = {
      City: City,
      Brand: Brand,
      Dish_Type: Dish_Type,
      Diet: Diet,
    };

    for (const [name, model] of Object.entries(tables)) {
      const exists = await model.findOne();
      if (exists) {
        const count = await model.count();
        console.log(`${name} table exists with ${count} rows.`);
      } else {
        console.log(`${name} table does not exist.`);
      }
    }
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  } finally {
    await sequelize.close();
  }
}

checkTablesAndCountRows();
