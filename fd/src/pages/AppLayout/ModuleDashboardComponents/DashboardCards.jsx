import "./DashboardCard.scss";
import StatCard from "./StatCard";

const DashboardCards = ({
  cards = [],
  cardsPerRow = 4,
}) => {
  return (
    <div className={`dashboard-grid cards-${cardsPerRow}`}>
      {cards.map((card, index) => (
        <StatCard
          key={index}
          {...card}
        />
      ))}
    </div>
  );
};

export default DashboardCards;