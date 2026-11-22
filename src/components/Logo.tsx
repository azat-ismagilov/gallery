import { Box, Link } from "@mui/material";

import logo from "@/assets/icons/white.svg";
import { LAST_YEAR } from "@/config/gallery";

const MobileLogo = () => {
  return (
    <Link href={`?album=${LAST_YEAR}`}>
      <Box component="img" src={logo} alt="go home page" width="200px" />
    </Link>
  );
};

const DesktopLogo = () => {
  return (
    <Link
      href={`?album=${LAST_YEAR}`}
      sx={{
        flexGrow: 1,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Box component="img" src={logo} alt="go home page" height="56px" />
    </Link>
  );
};

export { DesktopLogo, MobileLogo };
