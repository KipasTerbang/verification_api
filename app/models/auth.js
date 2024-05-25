"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Auth extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Auth.belongsTo(models.User, {
        foreignKey: "id_user",
        as: "user",
      });
    }
  }
  Auth.init(
    {
      id_user: DataTypes.INTEGER,
      email: { type: DataTypes.STRING, unique: true },
      password: DataTypes.STRING,
      verified: { type: DataTypes.BOOLEAN, defaultValue: false },
      otp: { type: DataTypes.INTEGER, allowNull: false },
    },
    {
      sequelize,
      modelName: "Auth",
      hooks: {
        beforeCreate: async (auth, options) => {
          const maxId = await Auth.max("id");
          auth.id = maxId + 1;
        },
      },
    }
  );
  return Auth;
};
