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
    url_minio_thumbnail: {
      type: DataTypes.TEXT,
      allowNull: true,
      get() {
        const rawValue = this.getDataValue('url_minio_thumbnail');
        return rawValue ? JSON.parse(rawValue) : [];
      },
      set(value) {
        this.setDataValue('url_minio_thumbnail', JSON.stringify(value));
      }
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
