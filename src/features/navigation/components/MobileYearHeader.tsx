import { Box, Typography } from "@mui/material";

import { places } from "@/config/gallery";
import { useAppContext } from "@/features/gallery/state/AppContext";

const MobileYearWrapper = () => {
  const { data, setIsOpenMenu } = useAppContext();

  const toggleMenu = () => {
    setIsOpenMenu(true);
  };

  if (data.text) {
    return (
      <Box onClick={toggleMenu}>
        <Typography variant="h4">{data.text}</Typography>
      </Box>
    );
  }

  const place = places.find(({ year }) => year === data.year);

  return (
    <Box onClick={toggleMenu} sx={{ mt: 1, mb: 1 }}>
      <Typography variant="h4">
        {place?.contestName} {place?.year}
      </Typography>
      <Typography variant="h5">{place?.place}</Typography>
    </Box>
  );
};

export default MobileYearWrapper;
