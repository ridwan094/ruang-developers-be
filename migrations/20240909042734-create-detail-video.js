'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('detail_videos', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name_publisher: {
        type: Sequelize.STRING,
        allowNull: false
      },
      url_minio_video: {
        type: Sequelize.STRING,
        allowNull: false
      },
      url_minio_thumbnail: {
        type: Sequelize.STRING,
        allowNull: true
      },
      description: {
        type: Sequelize.STRING,
        allowNull: false
      },
      views: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      status: {
        type: Sequelize.ENUM('published', 'not_published', 'deleted'),
        allowNull: false,
        defaultValue: 'not_published'
      },
      masterDataVideoId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'masterdatavideos',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('detail_videos');
  }
};
