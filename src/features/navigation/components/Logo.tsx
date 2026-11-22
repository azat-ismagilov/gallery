import { Box, Link } from "@mui/material";
import type { MouseEvent } from "react";

import logo from "@/assets/icons/white.svg";
import { LAST_YEAR } from "@/config/gallery";
import { useAppContext } from "@/features/gallery/state/AppContext";

function useHomeClick() {
  const { setYear } = useAppContext();

  return (event: MouseEvent<HTMLAnchorElement>) => {
    // Allow middle-click / modifier-click to open a new browser tab natively.
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }
    event.preventDefault();
    setYear(LAST_YEAR);
  };
}

const MobileLogo = () => {
  const handleHomeClick = useHomeClick();

  return (
    <Link href={`?album=${LAST_YEAR}`} onClick={handleHomeClick}>
      <Box component="img" src={logo} alt="Go to home page" width="200px" />
    </Link>
  );
};

const DesktopLogo = () => {
  const handleHomeClick = useHomeClick();

  return (
    <Link
      href={`?album=${LAST_YEAR}`}
      onClick={handleHomeClick}
      sx={{
        flexGrow: 1,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Box component="img" src={logo} alt="Go to home page" height="56px" />
    </Link>
  );
};

export { DesktopLogo, MobileLogo };
