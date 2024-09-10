'use strict';
module.exports = (sequelize, DataTypes) => {
  const DetailVideo = sequelize.define('DetailVideo', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name_publisher: {
      type: DataTypes.STRING,
      allowNull: false
    },
    url_minio_video: {
      type: DataTypes.STRING,
      allowNull: false
    },
    url_minio_thumbnail: {
      type: DataTypes.STRING,
      allowNull: true
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false
    },
    views: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    status: {
      type: DataTypes.ENUM('published', 'not_published', 'deleted'),
      allowNull: false,
      defaultValue: 'not_published'
    }
  }, {
    tableName: 'detail_videos',
    timestamps: true,
  });

  DetailVideo.associate = function(models) {
    DetailVideo.belongsTo(models.MasterDataVideo, {
      foreignKey: 'masterDataVideoId',
      as: 'master'
    });
  };

  return DetailVideo;
};
