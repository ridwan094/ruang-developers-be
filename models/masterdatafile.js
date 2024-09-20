'use strict';
module.exports = (sequelize, DataTypes) => {
  const MasterDataFile = sequelize.define('MasterDataFile', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    author: {
      type: DataTypes.STRING,
      allowNull: false
    },
    url_minio_files: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'deleted'),
      allowNull: false,
      defaultValue: 'inactive'
    }
  }, {
    tableName: 'master_data_files',
    timestamps: true
  });

  MasterDataFile.associate = function(models) {
    
  };

  return MasterDataFile;
};
