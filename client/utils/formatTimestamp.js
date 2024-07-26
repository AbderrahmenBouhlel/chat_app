// utils/formatTimestamp.js
import { format, parseISO, isToday, isYesterday, startOfWeek, isWithinInterval, formatRelative } from 'date-fns';

export default function formatMessageTimestamp(timestamp){
    try {
        const date = parseISO(timestamp);
        const now = new Date();
        const startOfCurrentWeek = startOfWeek(now, { weekStartsOn: 1 }); // Assume week starts on Monday

        if (isToday(date)) {
            // Show time only if the message is within the same day
            return format(date, 'HH:mm'); // Example: 14:45
        } else if (isYesterday(date)) {
            // Show "Yesterday" and time if the message was sent yesterday
            return `Yesterday ${format(date, 'HH:mm')}`; // Example: Yesterday 14:45
        } else if (isWithinInterval(date, { start: startOfCurrentWeek, end: now })) {
            // Show day and time if the message is within the same week
            return format(date, 'EEEE HH:mm'); // Example: Monday 14:45
        } else {
            // Show full date and time for older messages
            return format(date, 'MMM d, yyyy HH:mm'); // Example: Jul 22, 2024 01:24
        }
    } catch (error) {
        console.error('Error parsing date:', error);
        return 'Invalid date';
    }
};
