// utils/timeAgo.js
export function timeAgo(dateString) {
        const now = new Date();
        const date = new Date(dateString);
        const diffMs = now - date;
    
        const seconds = Math.floor(diffMs / 1000);
        const minutes = Math.floor(diffMs / 60000);
        const hours = Math.floor(diffMs / 3600000);
    
        if (seconds < 60) return `Il y a : ${seconds} secondes`;
        if (minutes < 60) return `Il y a : ${minutes} minutes`;
        if (hours < 24) return `Il y a : ${hours} heures`;
    
        const days = Math.floor(hours / 24);
        return `Il y a : ${days} jours`;
    }
    