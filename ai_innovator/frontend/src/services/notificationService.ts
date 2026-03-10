import api from './api';

export interface Notification {
    id: string;
    user_id: string;
    title: string;
    body: string;
    type: 'health_tip' | 'system' | 'reminder' | 'alert' | 'new_feature';
    action_url?: string;
    read: boolean;
    read_at?: string;
    created_at: string;
    metadata?: any;
}

export const getNotifications = async (): Promise<Notification[]> => {
    const response = await api.get('/notifications');
    return response.data.data;
};

export const markAsRead = async (id: string): Promise<Notification> => {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data.data;
};

export const markAllNotificationsAsRead = async (): Promise<void> => {
    await api.patch('/notifications/read-all');
};
