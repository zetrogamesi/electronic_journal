const Journal = require('../models/Journal');
const User    = require('../models/User');

/** GET /api/journals */
const getJournals = async (req, res) => {
  try {
    const filter = req.user.isAdmin ? {} : { group: req.user.groupId };
    const journals = await Journal.find(filter)
      .populate('subject', 'name')
      .populate('group',   'name')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .lean();

    res.json(journals.map(j => ({
      id:           j._id,
      title:        j.title,
      subjectName:  j.subject?.name  || '',
      groupName:    j.group?.name    || '',
      createdByName: j.createdBy?.name || '',
      studentCount: j.students?.length  || 0,
      columnCount:  j.columns?.length   || 0,
      createdAt:    j.createdAt,
    })));
  } catch (err) {
    console.error('GetJournals error:', err);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
};

/** GET /api/journals/:id */
const getJournalById = async (req, res) => {
  try {
    const journal = await Journal.findById(req.params.id)
      .populate('subject',   'name')
      .populate('group',     'name')
      .populate('students.user', 'name')
      .lean();

    if (!journal) return res.status(404).json({ error: 'Журнал не найден' });

    // Access check for students
    const userGroupId = typeof req.user.groupId === 'object' ? req.user.groupId._id : req.user.groupId;
    if (!req.user.isAdmin && String(journal.group._id) !== String(userGroupId)) {
      return res.status(403).json({ error: 'Нет доступа к этому журналу' });
    }

    // Sort columns by order
    const columns = [...journal.columns].sort((a, b) => a.order - b.order);

    // Build students list with grades as map
    const students = [...journal.students]
      .sort((a, b) => a.order - b.order)
      .map(st => ({
        rowId:       st._id,
        userId:      st.user?._id,
        studentName: st.user?.name || 'Неизвестный',
        grades:      st.grades || [],
      }));

    res.json({
      id:          journal._id,
      title:       journal.title,
      subjectName: journal.subject?.name || '',
      groupName:   journal.group?.name   || '',
      groupId:     journal.group?._id,
      createdAt:   journal.createdAt,
      columns,
      students,
    });
  } catch (err) {
    console.error('GetJournalById error:', err);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
};

/** POST /api/journals — create journal (admin) */
const createJournal = async (req, res) => {
  try {
    const { title, subject_id, group_id, dates } = req.body;

    if (!title?.trim())             return res.status(400).json({ error: 'Название журнала обязательно' });
    if (!group_id)                   return res.status(400).json({ error: 'Группа обязательна' });
    if (!dates || dates.length === 0) return res.status(400).json({ error: 'Добавьте хотя бы одну дату' });

    // Build columns array
    const columns = dates.map((d, i) => ({
      lessonDate: new Date(d),
      label:      '',
      order:      i,
    }));

    // Auto-enroll all non-admin students of the group
    const groupStudents = await User.find({ group: group_id, isAdmin: false }).sort('name').lean();
    const students = groupStudents.map((u, i) => ({ user: u._id, order: i, grades: [] }));

    const journal = await Journal.create({
      title:     title.trim(),
      subject:   subject_id || null,
      group:     group_id,
      createdBy: req.user.id,
      columns,
      students,
    });

    res.status(201).json({ message: 'Журнал создан', journal: { id: journal._id, title: journal.title } });
  } catch (err) {
    console.error('CreateJournal error:', err);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
};

/** DELETE /api/journals/:id (admin) */
const deleteJournal = async (req, res) => {
  try {
    await Journal.findByIdAndDelete(req.params.id);
    res.json({ message: 'Журнал удалён' });
  } catch (err) {
    console.error('DeleteJournal error:', err);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
};

/** POST /api/journals/:id/columns — add a lesson date (admin) */
const addColumn = async (req, res) => {
  try {
    const { lesson_date, label } = req.body;
    if (!lesson_date) return res.status(400).json({ error: 'Дата урока обязательна' });

    const journal = await Journal.findById(req.params.id);
    if (!journal) return res.status(404).json({ error: 'Журнал не найден' });

    const newOrder = journal.columns.length;
    journal.columns.push({ lessonDate: new Date(lesson_date), label: label || '', order: newOrder });
    await journal.save();

    const col = journal.columns[journal.columns.length - 1];
    res.status(201).json({ id: col._id, lessonDate: col.lessonDate, order: col.order });
  } catch (err) {
    console.error('AddColumn error:', err);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
};

/** GET /api/journals/stats/performance */
const getGroupStats = async (req, res) => {
  try {
    const journals = await Journal.find().populate('group', 'name').lean();
    const stats = {};

    for (const j of journals) {
      const gName = j.group?.name || 'Без группы';
      if (!stats[gName]) stats[gName] = { total: 0, count: 0 };

      for (const st of j.students) {
        for (const grade of st.grades) {
          if (!grade.value) continue;
          const v = grade.value.trim().toLowerCase();
          if (['1', '2', '3', '4', '5'].includes(v)) {
            stats[gName].total += Number(v);
            stats[gName].count++;
          } else if (v === 'н') {
            stats[gName].total += 0;
            stats[gName].count++;
          }
        }
      }
    }

    const result = Object.entries(stats)
      .filter(([_, data]) => data.count > 0)
      .map(([name, data]) => ({ name, avg: Number((data.total / data.count).toFixed(2)) }))
      .sort((a, b) => b.avg - a.avg);

    res.json(result);
  } catch (err) {
    console.error('GetGroupStats error:', err);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
};

/** GET /api/journals/force-sync (admin) */
const forceSyncStudents = async (req, res) => {
  try {
    const journals = await Journal.find();
    let updatedCount = 0;
    
    for (const journal of journals) {
      const studentsInGroup = await User.find({ group: journal.group, isAdmin: false }).lean();
      let modified = false;
      
      for (const st of studentsInGroup) {
        const exists = journal.students.find(s => String(s.user) === String(st._id));
        if (!exists) {
          journal.students.push({ user: st._id, order: 9999, grades: [] });
          modified = true;
        }
      }
      
      if (modified) {
        await journal.save();
        updatedCount++;
      }
    }
    
    res.json({ message: `Синхронизация завершена. Обновлено журналов: ${updatedCount}` });
  } catch (err) {
    console.error('ForceSync error:', err);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
};

module.exports = { 
  getJournals, getJournalById, getGroupStats, createJournal, 
  deleteJournal, addColumn, forceSyncStudents 
};
