import React from "react";

import { places } from "../consts";

import { useAppContext } from "./AppContext";

import "../styles/TableOfContents.css";

type Place = [string, string, string];

const TableOfContents: React.FC = () => {
  const { year, setYear } = useAppContext();

  const handleClick = (
    _: React.MouseEvent<HTMLDivElement>,
    selectedYear: string,
  ) => {
    setYear(selectedYear);
    document.querySelector(".body")?.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <nav aria-label="Table of contents">
      {places.map(([placeYear, place, contestName]: Place) => {
        if (placeYear !== year) {
          return (
            <div
              className="year-wrapper"
              key={placeYear}
              onClick={(event) => handleClick(event, placeYear)}
            >
              <div className="year">{placeYear}</div>
              <div className="place">{place}</div>
            </div>
          );
        } else {
          return (
            <div
              className="year-wrapper"
              key={placeYear}
              title="to top"
              onClick={(event) => handleClick(event, placeYear)}
            >
              <div className="year big-year">
                {contestName} {placeYear}
              </div>
              <div className="place big-place">{place}</div>
            </div>
          );
        }
      })}
    </nav>
  );
};

export default TableOfContents;
