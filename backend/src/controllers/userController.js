const bcrypt  = require('bcrypt');
const User    = require('../models/User');
const Group   = require('../models/Group');
const Subject = require('../models/Subject');

const SALT_ROUNDS = 12;

/** GET /api/users — all users (admin) */
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().populate('group', 'name').sort('name').lean();
    res.json(users.map(u => ({
      id:        u._id,
      name:      u.name,
      groupId:   u.group?._id,
      groupName: u.group?.name || '',
      isAdmin:   u.isAdmin,
      createdAt: u.createdAt,
    })));
  } catch (err) {
    console.error('GetAllUsers error:', err);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
};

/** PUT /api/users/me — update own profile */
const updateProfile = async (req, res) => {
  try {
    const { name, password } = req.body;
    if (!name && !password)
      return res.status(400).json({ error: 'Укажите данные для обновления' });
    if (name && !name.trim())
      return res.status(400).json({ error: 'Имя не может быть пустым' });
    if (password && password.length < 6)
      return res.status(400).json({ error: 'Пароль должен содержать не менее 6 символов' });

    const updates = {};
    if (name)     updates.name = name.trim();
    if (password) updates.passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true }).populate('group', 'name');
    res.json({
      message: 'Профиль обновлён',
      user: { id: user._id, name: user.name, groupName: user.group?.name, isAdmin: user.isAdmin },
    });
  } catch (err) {
    console.error('UpdateProfile error:', err);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
};

/** PUT /api/users/:id/admin — toggle admin (admin only) */
const toggleAdmin = async (req, res) => {
  try {
    if (req.params.id === String(req.user.id))
      return res.status(400).json({ error: 'Нельзя изменить свои права администратора' });
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
    user.isAdmin = !user.isAdmin;
    await user.save();
    res.json({ message: 'Права обновлены', user: { id: user._id, name: user.name, isAdmin: user.isAdmin } });
  } catch (err) {
    console.error('ToggleAdmin error:', err);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
};

/** DELETE /api/users/:id (admin) */
const deleteUser = async (req, res) => {
  try {
    if (req.params.id === String(req.user.id))
      return res.status(400).json({ error: 'Нельзя удалить себя' });
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Пользователь удалён' });
  } catch (err) {
    console.error('DeleteUser error:', err);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
};

/** GET /api/users/groups */
const getGroups = async (_req, res) => {
  try {
    const groups = await Group.find().sort('name').lean();
    res.json(groups.map(g => ({ id: g._id, name: g.name })));
  } catch (err) {
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
};

/** POST /api/users/groups (admin) */
const createGroup = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: 'Название группы обязательно' });
    const group = await Group.create({ name: name.trim() });
    res.status(201).json({ id: group._id, name: group.name });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: 'Группа с таким названием уже существует' });
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
};

/** GET /api/users/subjects */
const getSubjects = async (_req, res) => {
  try {
    const subjects = await Subject.find().sort('name').lean();
    res.json(subjects.map(s => ({ id: s._id, name: s.name })));
  } catch (err) {
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
};

/** POST /api/users/subjects (admin) */
const createSubject = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: 'Название предмета обязательно' });
    const subject = await Subject.create({ name: name.trim() });
    res.status(201).json({ id: subject._id, name: subject.name });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: 'Предмет с таким названием уже существует' });
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
};

module.exports = { getAllUsers, updateProfile, toggleAdmin, deleteUser, getGroups, createGroup, getSubjects, createSubject };
