import React, { useState } from "react";

import SearchIcon from "@mui/icons-material/Search";
import { IconButton, Paper, TextField } from "@mui/material";

import { useAppContext } from "../AppContext";

const Search: React.FC = () => {
  const { setText, setIsOpenMenu, mobile } = useAppContext();

  const [inputText, setInputText] = useState<string>("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (inputText.trim() !== "") {
      setText(inputText.trim());
      setInputText("");

      if (mobile) {
        setIsOpenMenu(false);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setInputText(e.target.value);
  };

  return (
    <Paper>
      <form onSubmit={handleSubmit} style={{ width: "100%" }}>
        <TextField
          fullWidth
          value={inputText}
          onChange={handleInputChange}
          placeholder="Global search..."
          InputProps={{
            endAdornment: (
              <IconButton type="submit">
                <SearchIcon />
              </IconButton>
            ),
          }}
        />
      </form>
    </Paper>
  );
};

export default Search;
