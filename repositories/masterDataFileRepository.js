const { Op, where } = require('sequelize');
const { MasterDataFile } = require('../models');

exports.createFile = async (fileData) => {
    return await MasterDataFile.create(fileData);
};

exports.getAllFiles = async (offset, limit) => {
    return await MasterDataFile.findAndCountAll({
        offset: offset,
        limit: limit,
        order: [['createdAt', 'DESC']],
        where: {
            status: {
                [Op.ne]: 'deleted'
            }
        }
    });
};

exports.getFileById = async (fileId) => {
    return await MasterDataFile.findOne({
        where: { id: fileId }
    });
};

exports.updateFile = async (id, fileData) => {
    const file = await MasterDataFile.findOne({ where: { id: id } });
    if (!file) throw new Error('File tidak ditemukan');

    return await file.update(fileData);
};

exports.deleteFile = async (id) => {
    const file = await MasterDataFile.findOne({ where: { id } });
    if (!file) throw new Error('File tidak ditemukan');

    await MasterDataFile.destroy({ where: { id } });

    return file;
};

exports.getFilesByStatus = async (status) => {
    return await MasterDataFile.findAll({
        where: {
            status: status
        },
        order: [['createdAt', 'DESC']]
    });
};

