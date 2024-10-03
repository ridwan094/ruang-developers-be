'use strict';
module.exports = (sequelize, DataTypes) => {
  const Template = sequelize.define('Template', {
    template_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    publisher: {
      type: DataTypes.STRING,
      allowNull: false
    },
    url_minio_preview: {
      type: DataTypes.STRING,
      allowNull: false
    },
    id_template: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
  }, {
    tableName: 'templates',
    timestamps: true
  });
  return Template;
};
