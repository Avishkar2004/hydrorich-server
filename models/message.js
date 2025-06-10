import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import { User } from './index.js';

export const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  sender_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  receiver_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'messages',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

// Define associations
Message.belongsTo(User, {
  foreignKey: 'sender_id',
  as: 'sender'
});

Message.belongsTo(User, {
  foreignKey: 'receiver_id',
  as: 'receiver'
});

export default Message; 