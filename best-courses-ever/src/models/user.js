class User {
  constructor({
    id,
    name,
    email,
    role = 'USER',
    createdAt = new Date(),
  }) {
    Object.assign(this, { id, name, email, role, createdAt });
  }
}
module.exports = User;
