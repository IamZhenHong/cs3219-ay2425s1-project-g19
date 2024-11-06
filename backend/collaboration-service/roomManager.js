class Room {
  constructor(id, users, difficulty, category) {
    this.id = id;
    this.users = users;
    this.difficulty = difficulty;
    this.category = category;
    this.connectedUsers = new Set(users);
    this.code = "";
    this.createdAt = Date.now();
  }

  addUser(userId) {
    console.log("Adding user to room");
    console.log(`Adding user ${userId} to room ${this.id}`);
    if (!this.connectedUsers.has(userId)) {
      this.connectedUsers.add(userId);
      console.log(Array.from(this.connectedUsers));
    }
  }

  removeUser(userId) {
    this.connectedUsers.delete(userId);
  }

  updateCode(code) {
    this.code = code;
  }

  isUserAuthorized(userId) {
    return this.users.includes(userId);
  }

  toJSON() {
    return {
      id: this.id,
      users: this.users,
      difficulty: this.difficulty,
      category: this.category,
      connectedUsers: Array.from(this.connectedUsers),
      code: this.code,
      createdAt: this.createdAt,
    };
  }
}

class RoomManager {
  constructor() {
    this.rooms = new Map();
  }

  createRoom(id, users, difficulty, category) {
    const room = new Room(id, users, difficulty, category);
    this.rooms.set(id, room);
    return room;
  }

  getRoom(roomId) {
    return this.rooms.get(roomId);
  }

  deleteRoom(roomId) {
    return this.rooms.delete(roomId);
  }

  getAllRooms() {
    return Array.from(this.rooms.values());
  }
}

module.exports = {
  Room,
  RoomManager,
};
