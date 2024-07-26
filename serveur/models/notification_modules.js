const { getConnection } = require('../db.js');

const Notification = {
    async createNotification(requestObj) {
        console.log(requestObj)
        let connection;
        try {
            connection = await getConnection();
            const userId = requestObj.userId || null;
            const messageData = JSON.stringify(requestObj.message_data) || null;
            const status = requestObj.status || 'unread';
            const createdAt = new Date();

            if (!userId || !messageData) {
                throw new Error('Cannot create a notification without a user_id or message');
            }

            const query = `
                INSERT INTO notifications (user_id, message_data, status, created_at)
                VALUES (?, ?, ?, ?);
            `;

            const queryParams = [userId, messageData, status, createdAt];
            const [result] = await connection.execute(query, queryParams);

            return { notificationId: result.insertId, status: 'Notification created successfully' };

        } catch (error) {
            console.error('Error creating notification:', error);
            throw error;
        } 
    },

    async findNotifications(requestObj) {
        let connection;
        try {
            connection = await getConnection();
            const userId = requestObj.user_id || null;

            if (!userId) {
                throw new Error('user_id is required');
            }

            const query = `
                SELECT * FROM notifications
                WHERE user_id = ? AND status = 'unread';
            `;

            const queryParams = [userId];
            const [results] = await connection.execute(query, queryParams);

            return results;

        } catch (error) {
            console.error('Error finding notifications:', error);
            throw error;
        } 
    },

    async modifyNotificationStatus(requestObj) {
        let connection;
        try {
            connection = await getConnection();
            const notificationId = requestObj.notificationId || null;

            if (!notificationId) {
                throw new Error('notification_id is required');
            }

            const query = `
                UPDATE notifications
                SET status = 'read'
                WHERE id = ?;
            `;

            const queryParams = [notificationId];
            await connection.execute(query, queryParams);

            return { status: 'Notification status updated successfully' };

        } catch (error) {
            console.error('Error modifying notification status:', error);
            throw error;
        }
    },
};

module.exports = Notification;





