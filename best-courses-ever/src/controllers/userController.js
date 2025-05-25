const User = require('../models/user');
const Course = require('../models/course');

class UserController {
  // Профиль текущего пользователя
  async getProfile(req, res, next) {
    try {
      // req.user уже загружен middleware
      const user = await User.findById(req.user._id).populate(
        'enrolledCourses',
        'title slug'
      );

      res.render('users/profile', {
        title: 'Мой профиль',
        user,
      });
    } catch (error) {
      // Передаем ошибку в общий обработчик
      next(error);
    }
  }

  // Публичный профиль пользователя
  async getUser(req, res, next) {
    try {
      const { id } = req.params;

      const user = await User.findById(id);

      if (!user || !user.isActive) {
        // Создаем ошибку 404
        const error = new Error('Пользователь не найден');
        error.status = 404;
        throw error;
      }

      // Подготавливаем публичные данные
      const publicProfile = {
        id: user._id,
        name: user.name,
        avatar: user.avatar,
        bio: user.bio,
        role: user.role,
        createdAt: user.createdAt,
      };

      if (req.path.includes('/api')) {
        return res.json({
          success: true,
          data: publicProfile,
        });
      }

      // Получаем публичные курсы автора
      let authorCourses = [];
      if (user.role === 'author') {
        authorCourses = await Course.find({
          author: user._id,
          isPublished: true,
          isPublic: true,
        })
          .select('title slug description level stats')
          .sort('-createdAt')
          .limit(6);
      }

      res.render('users/show', {
        title: user.name,
        profile: publicProfile,
        authorCourses,
        isOwner: req.user?._id.toString() === id,
      });
    } catch (error) {
      next(error);
    }
  }

  // Обновление профиля
  async updateProfile(req, res, next) {
    try {
      const userId = req.user._id;
      const { name, bio } = req.body;

      // Простая валидация без внешних классов
      if (name && (name.length < 2 || name.length > 100)) {
        const error = new Error(
          'Имя должно быть от 2 до 100 символов'
        );
        error.status = 400;
        throw error;
      }

      if (bio && bio.length > 500) {
        const error = new Error(
          'Биография не может быть длиннее 500 символов'
        );
        error.status = 400;
        throw error;
      }

      // Обновляем только разрешенные поля
      const updateData = {};
      if (name) updateData.name = name;
      if (bio !== undefined) updateData.bio = bio;

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        updateData,
        { new: true, runValidators: true }
      );

      if (req.path.includes('/api')) {
        return res.json({
          success: true,
          data: {
            id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            bio: updatedUser.bio,
            avatar: updatedUser.avatar,
          },
        });
      }

      req.flash('success', 'Профиль успешно обновлен');
      res.redirect('/users/profile');
    } catch (error) {
      // Для API передаем ошибку дальше
      if (req.path.includes('/api')) {
        return next(error);
      }

      // Для веб-формы показываем сообщение и редиректим
      req.flash('error', error.message);
      res.redirect('/users/profile');
    }
  }

  // Список всех пользователей (только для админов)
  async getAllUsers(req, res, next) {
    try {
      const { page = 1, limit = 20, role, search } = req.query;

      // Строим фильтры
      const filters = {};
      if (role) filters.role = role;
      if (search) {
        filters.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ];
      }

      // Пагинация
      const skip = (page - 1) * limit;

      const [users, total] = await Promise.all([
        User.find(filters)
          .select('-password')
          .sort('-createdAt')
          .skip(skip)
          .limit(parseInt(limit)),
        User.countDocuments(filters),
      ]);

      if (req.path.includes('/api')) {
        return res.json({
          success: true,
          data: users,
          pagination: {
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
            limit: parseInt(limit),
          },
        });
      }

      res.render('admin/users', {
        title: 'Управление пользователями',
        users,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit),
          limit: parseInt(limit),
        },
        filters: { role, search },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();
