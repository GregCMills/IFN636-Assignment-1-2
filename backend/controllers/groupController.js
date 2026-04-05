const ProductGroup = require('../models/ProductGroup');
const AssetType    = require('../models/AssetType');
const Asset        = require('../models/Asset');

const listGroups = async (req, res) => {
  try {
    const groups = await ProductGroup.find().sort({ name: 1 });
    res.json(groups);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createGroup = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name?.trim()) return res.status(400).json({ message: 'Name is required' });
    const group = await ProductGroup.create({ name: name.trim() });
    res.status(201).json(group);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteGroup = async (req, res) => {
  try {
    const types   = await AssetType.find({ groupId: req.params.id });
    const typeIds = types.map(t => t._id);
    await Asset.deleteMany({ typeId: { $in: typeIds } });
    await AssetType.deleteMany({ groupId: req.params.id });
    await ProductGroup.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { listGroups, createGroup, deleteGroup };
