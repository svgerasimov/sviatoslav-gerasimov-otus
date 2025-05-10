const { User } = require('../models');

class UserRepository {
  #users = [];
  #nextId = 1;
  getAll() {
    return this.#users;
  }
  getById(id) {
    return this.#users.find((u) => u.id === id);
  }
  create(dto) {
    const u = new User({ id: this.#nextId++, ...dto });
    this.#users.push(u);
    return u;
  }
  update(id, dto) {
    const u = this.getById(id);
    if (!u) return null;
    Object.assign(u, dto);
    return u;
  }
  remove(id) {
    const i = this.#users.findIndex((u) => u.id === id);
    if (i === -1) return false;
    this.#users.splice(i, 1);
    return true;
  }
}
module.exports = new UserRepository();
