// components/Card/DashboardCard.jsx
import "./DashboardCard.css";

export default function DashboardCard({ title, children }) {
    return (
        <div className="card">
            <h3>{title}</h3>
            {children}
        </div>
    );
}
