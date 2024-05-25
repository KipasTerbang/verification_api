"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.hasOne(models.Auth, {
        foreignKey: "id_user",
        as: "auth",
        allowNull: false,
      });
    }
  }
  User.init(
    {
      name: { type: DataTypes.STRING, allowNull: false },
      hobi: { type: DataTypes.STRING, allowNull: false },
    },
    {
      sequelize,
      modelName: "User",
      hooks: {
        beforeCreate: async (user, options) => {
          const maxId = await User.max("id");
          user.id = maxId + 1;
        },
      },
    }
  );
  return User;
};
