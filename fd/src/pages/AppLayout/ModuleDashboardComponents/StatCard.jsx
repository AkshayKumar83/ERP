import "./DashboardCard.scss";

const StatCard = ({ title, value, icon, color,onClick }) => {
  return (
  <div className={`card dashboard-card ${color}`}
   onClick={onClick}
      style={{
        cursor: onClick ? "pointer" : "default",
      }}>

      <div className="card-body">

        <div className="d-flex justify-content-between align-items-start">

          <div>

            <p className="card-title">
              {title}
            </p>

            <h2 className="card-value">
              {value}
            </h2>

          </div>

          <div className={`card-icon ${color}`}>
            {icon}
          </div>
          

        </div>

      </div>

    </div>
  );
};

export default StatCard;