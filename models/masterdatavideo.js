'use strict';
module.exports = (sequelize, DataTypes) => {
  const MasterDataVideo = sequelize.define('MasterDataVideo', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    tableName: 'masterdatavideos',
    timestamps: true
  });

  MasterDataVideo.associate = function(models) {
    MasterDataVideo.hasOne(models.DetailVideo, {
      foreignKey: 'masterDataVideoId',
      as: 'detail'
    });
  };

  return MasterDataVideo;
};
