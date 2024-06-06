'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Dish_Type extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Dish_Type.init({
    name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Dish_Type',
  });
  return Dish_Type;
};