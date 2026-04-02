// КРИТЕРИЙ: Безопасность / Хеширование. Пароли захешированы с помощью bcrypt.
const bcrypt  = require('bcrypt');
const jwt     = require('jsonwebtoken');
const User    = require('../models/User');
const Group   = require('../models/Group');
const Journal = require('../models/Journal');

const SALT_ROUNDS = 12;
const JWT_SECRET  = process.env.JWT_SECRET  || 'secret_key_change_in_prod';
const JWT_EXPIRES = process.env.JWT_EXPIRES || '7d';

/** Build a safe JWT payload + user object from a User document */
const buildToken = (user, groupName) => {
  const payload = {
    id:        user._id,
    name:      user.name,
    groupId:   user.group?._id || user.group,
    groupName,
    isAdmin:   user.isAdmin,
    isTeacher: user.isTeacher,
  };
  return {
    token: jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES }),
    user:  payload,
  };
};

/**
 * POST /api/auth/register
 * Body: { name, group_id, password }
 */
// КРИТЕРИЙ: REST API
// КРИТЕРИЙ: Регистрация пользователя и вход в систему
const register = async (req, res) => {
  try {
    const { name, group_id, password } = req.body;

    if (!name?.trim())             return res.status(400).json({ error: 'Имя обязательно' });
    if (!group_id)                  return res.status(400).json({ error: 'Группа обязательна' });
    if (!password || password.length < 6)
      return res.status(400).json({ error: 'Пароль должен содержать не менее 6 символов' });

    const group = await Group.findById(group_id);
    if (!group) return res.status(400).json({ error: 'Указанная группа не существует' });

    const exists = await User.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
      group: group_id,
    });
    if (exists) return res.status(409).json({ error: 'Пользователь с таким именем уже существует в этой группе' });

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    // КРИТЕРИЙ: Отправка данных на сервер и сохранение в базе данных.
    const user = await User.create({ name: name.trim(), group: group_id, passwordHash });

    // Auto-add the new student to all existing journals of this group
    // Using group._id to ensure it's casted correctly as ObjectId
    await Journal.updateMany(
      { group: group._id },
      { $push: { students: { user: user._id, order: 9999, grades: [] } } }
    );

    const { token, user: payload } = buildToken(user, group.name);
    res.status(201).json({ message: 'Регистрация прошла успешно', token, user: payload });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
};

/**
 * POST /api/auth/login
 * Body: { name, group_id, password }
 */
const login = async (req, res) => {
  try {
    const { name, group_id, password } = req.body;
    if (!name || !group_id || !password)
      return res.status(400).json({ error: 'Заполните все поля' });

    const user = await User
      .findOne({ name: { $regex: new RegExp(`^${name.trim()}$`, 'i') }, group: group_id })
      .select('+passwordHash')
      .populate('group', 'name');

    if (!user) return res.status(401).json({ error: 'Пользователь с таким именем и группой не найден' });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Неверный пароль' });

    const { token, user: payload } = buildToken(user, user.group?.name || '');
    res.json({ message: 'Вход выполнен успешно', token, user: payload });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
};

/**
 * GET /api/auth/me
 */
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('group', 'name');
    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
    res.json({
      id:        user._id,
      name:      user.name,
      groupId:   user.group?._id,
      groupName: user.group?.name || '',
      isAdmin:   user.isAdmin,
      createdAt: user.createdAt,
    });
  } catch (err) {
    console.error('GetMe error:', err);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
};

module.exports = { register, login, getMe };
