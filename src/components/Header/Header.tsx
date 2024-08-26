import React from "react";

import CloseIcon from "@mui/icons-material/Close";
import MenuIcon from "@mui/icons-material/Menu";
import { Collapse, IconButton, Stack } from "@mui/material";

import { useAppContext } from "../AppContext";
import { MobileLogo } from "../Logo";

import Filters from "./Filters";
import MobileYearWrapper from "./MobileYearWrapper";

const Header: React.FC = () => {
  const { isOpenMenu, setIsOpenMenu, mobile } = useAppContext();

  const toggleMenu = (): void => {
    setIsOpenMenu(!isOpenMenu);
  };

  return (
    <Stack sx={{ flexGrow: 1 }} justifyContent="center">
      {mobile && (
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <MobileLogo />
          <IconButton onClick={toggleMenu}>
            {!isOpenMenu ? (
              <MenuIcon fontSize="large" />
            ) : (
              <CloseIcon fontSize="large" />
            )}
          </IconButton>
        </Stack>
      )}
      <Collapse in={isOpenMenu}>
        <Filters />
      </Collapse>
      {mobile && <MobileYearWrapper />}
    </Stack>
  );
};

export default Header;
