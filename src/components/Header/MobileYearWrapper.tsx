import React from "react";

import { Box, Typography } from "@mui/material";

import { places } from "../../consts";
import { AppContextType, useAppContext } from "../AppContext";

type Place = [string, string, string];

const MobileYearWrapper: React.FC = () => {
  const { year, text, setIsOpenMenu } = useAppContext() as AppContextType;

  const toggleMenu = (): void => {
    setIsOpenMenu(true);
  };

  if (text) {
    return (
      <Box onClick={toggleMenu} component="div">
        <Typography variant="h4" component="h4">{text}</Typography>
      </Box>
    );
  }

  const place = places.find((p): p is Place => p[0] === year);

  return (
    <Box onClick={toggleMenu} mt={1} mb={1} component="div">
      <Typography variant="h4" component="h4">
        {place?.[2]} {place?.[0]}
      </Typography>
      <Typography variant="h5" component="h5">{place?.[1]}</Typography>
    </Box>
  );
};

export default MobileYearWrapper;
