import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Autocomplete,
  createFilterOptions,
  Paper,
  TextField,
} from "@mui/material";
import { styled } from "@mui/material/styles";

export interface SelectorOption {
  data: string;
  label: string;
}

const TextFieldWithIcon = styled(TextField)(() => ({
  "& .MuiInputBase-input.MuiAutocomplete-input": {
    marginLeft: "25px",
  },
  "& .MuiInputLabel-root": {
    marginLeft: "25px",
  },
}));

const filterOptions = createFilterOptions<SelectorOption>({ limit: 200 });

interface SelectorProps {
  leftIcon: string;
  onChange: (value: SelectorOption | "clear" | null) => void;
  name: string;
  value: SelectorOption | null;
  options: SelectorOption[];
  disableClearable?: boolean;
}

const Selector = ({
  leftIcon,
  onChange,
  name,
  value,
  options,
  disableClearable = false,
}: SelectorProps) => {
  return (
    <Paper>
      <Autocomplete<SelectorOption, false, boolean, false>
        filterOptions={filterOptions}
        fullWidth
        disablePortal
        value={value ?? (disableClearable ? options[0] : null)}
        options={options}
        isOptionEqualToValue={(option, selected) =>
          option.data === selected.data
        }
        onChange={(_event, newValue, reason) => {
          if (reason === "selectOption" && newValue) {
            onChange(newValue);
          } else {
            onChange("clear");
          }
        }}
        renderInput={(params) => (
          <TextFieldWithIcon
            {...params}
            placeholder={name}
            style={{
              backgroundImage: `url(${leftIcon})`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "left 10px center",
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
