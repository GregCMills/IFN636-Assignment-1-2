const AssetType = require('../models/AssetType');
const Asset     = require('../models/Asset');

const listTypes = async (req, res) => {
  try {
    const types = await AssetType.find().sort({ name: 1 });
    res.json(types);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createType = async (req, res) => {
  try {
    const { groupId, name } = req.body;
    if (!groupId || !name?.trim()) return res.status(400).json({ message: 'groupId and name are required' });
    const type = await AssetType.create({ groupId, name: name.trim() });
    res.status(201).json(type);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteType = async (req, res) => {
  try {
    await Asset.deleteMany({ typeId: req.params.id });
    await AssetType.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { listTypes, createType, deleteType };
