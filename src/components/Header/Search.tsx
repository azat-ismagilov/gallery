import SearchIcon from "@mui/icons-material/Search";
import { IconButton, Paper, TextField } from "@mui/material";
import { type FormEvent, useState } from "react";

import { useAppContext } from "@/context/AppContext";

const Search = () => {
  const { setText, setIsOpenMenu, mobile } = useAppContext();

  const [inputText, setInputText] = useState("");
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (inputText !== "") {
      setText(inputText);
      setInputText("");

      if (mobile) {
        setIsOpenMenu(false);
      }
    }
  };

  return (
    <Paper>
      <form onSubmit={handleSubmit} style={{ width: "100%" }}>
        <TextField
          fullWidth
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Global search..."
          slotProps={{
            input: {
              endAdornment: (
                <IconButton type="submit" aria-label="Search">
                  <SearchIcon />
                </IconButton>
              ),
            },
          }}
        />
      </form>
    </Paper>
  );
};

export default Search;
