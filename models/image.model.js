const db  =  require('./index');
const { DataTypes } = require('sequelize');
const Image = db.sequelize.define('Image', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        readOnly: true
    },
    file_name: {
        type: DataTypes.STRING,
        allowNull: false,
        readOnly: true
    },
    url: {
        type: DataTypes.STRING,
        allowNull: false,
        readOnly: true
    },
    upload_date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        readOnly: true
    },
    user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        readOnly: true,
        references: {
            model: 'user',
            key: 'id'
        },
    }
}, {
    timestamps: false, // Disable automatic timestamps (createdAt, updatedAt)
    tableName: 'images', // Specify the table name
});

module.exports = Image;
