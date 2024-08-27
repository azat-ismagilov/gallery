import React from "react";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Autocomplete,
  AutocompleteProps,
  Paper,
  PaperProps,
  TextField,
  TextFieldProps,
  createFilterOptions,
} from "@mui/material";
import { styled } from "@mui/material/styles";

interface Option {
  data: string;
  label: string;
}

export interface SelectorProps {
  leftIcon: React.FC<React.SVGProps<SVGSVGElement>>;
  onChange: (value: Option | null) => void;
  name: string;
  value: string;
  options: Option[];
  disableClearable?: boolean;
}

const TextFieldWithIcon = styled(TextField)<TextFieldProps>(() => ({
  "& .MuiInputBase-input.MuiAutocomplete-input": {
    marginLeft: "25px",
  },
  "& .MuiInputLabel-root": {
    marginLeft: "25px",
  },
}));

const filterOptions = createFilterOptions<Option>({ limit: 200 });

const Selector: React.FC<SelectorProps> = ({
  leftIcon: LeftIcon,
  onChange,
  name,
  value,
  options,
  disableClearable = false,
}) => {
  return (
    <Paper component="div">
      <Autocomplete<Option, false, boolean, false>
        filterOptions={filterOptions}
        fullWidth
        disablePortal
        value={options.find((option) => option.data === value) || null}
        options={options}
        isOptionEqualToValue={(option, value) => option.data === value.data}
        onChange={(event, newValue, reason) => {
          if (reason === "selectOption") {
            onChange(newValue);
          } else {
            onChange(null);
          }
        }}
        renderInput={(params) => (
          <TextFieldWithIcon
            {...params}
            placeholder={name}
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <LeftIcon style={{ marginRight: 8, width: 20, height: 20 }} />
              ),
            }}
          />
        )}
        popupIcon={<ExpandMoreIcon />}
        disableClearable={disableClearable}
      />
    </Paper>
  );
};

export default Selector;
