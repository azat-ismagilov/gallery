import { places } from "@/config/gallery";
import { useAppContext } from "@/context/AppContext";

import "@/styles/TableOfContents.css";

const YearNav = () => {
  const { data, setYear } = useAppContext();

  return (
    <nav aria-label="Years">
      {places.map(({ year, place, contestName }) => {
        const isSelected = year === data.year;
        return (
          <button
            type="button"
            className="year-wrapper"
            key={year}
            aria-current={isSelected ? "page" : undefined}
            title={isSelected ? "Back to top" : undefined}
            onClick={() => setYear(year)}
            style={{
              background: "none",
              border: "none",
              textAlign: "left",
              width: "100%",
              font: "inherit",
            }}
          >
            <div className={isSelected ? "year big-year" : "year"}>
              {isSelected ? `${contestName} ${year}` : year}
            </div>
            <div className={isSelected ? "place big-place" : "place"}>
              {place}
            </div>
          </button>
        );
      })}
    </nav>
  );
};

export default YearNav;
