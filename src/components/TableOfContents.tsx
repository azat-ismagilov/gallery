import { places } from "@/config/gallery";
import { useAppContext } from "@/context/AppContext";

import "../styles/TableOfContents.css";

const TableOfContents = () => {
  const { data, setYear } = useAppContext();

  const handleClick = (selectedYear: string) => {
    setYear(selectedYear);
    document.querySelector(".body")?.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <nav aria-label="Table of contents">
      {places.map(({ year, place, contestName }) => {
        const isSelected = year === data.year;
        return (
          <button
            type="button"
            className="year-wrapper"
            key={year}
            title={isSelected ? "to top" : undefined}
            onClick={() => handleClick(year)}
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

export default TableOfContents;
