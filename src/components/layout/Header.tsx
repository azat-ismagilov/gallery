import CloseIcon from "@mui/icons-material/Close";
import MenuIcon from "@mui/icons-material/Menu";
import { Collapse, IconButton, Stack } from "@mui/material";

import { useAppContext } from "@/context/AppContext";
import Filters from "./Filters";
import { MobileLogo } from "./Logo";
import MobileYearHeader from "./MobileYearHeader";

const Header = () => {
  const { isOpenMenu, setIsOpenMenu, mobile } = useAppContext();

  const toggleMenu = () => {
    setIsOpenMenu(!isOpenMenu);
  };

  return (
    <Stack sx={{ flexGrow: 1, justifyContent: "center" }}>
      {mobile && (
        <Stack
          direction="row"
          sx={{ justifyContent: "space-between", alignItems: "center" }}
        >
          <MobileLogo />
          <IconButton onClick={toggleMenu} aria-label="Toggle filter menu">
            {!isOpenMenu ? (
              <MenuIcon fontSize="large" />
            ) : (
              <CloseIcon fontSize="large" />
            )}
          </IconButton>
        </Stack>
      )}
      <Collapse in={isOpenMenu} sx={{ width: 1 }}>
        <Filters />
      </Collapse>
      {mobile && <MobileYearHeader />}
    </Stack>
  );
};

export default Header;
