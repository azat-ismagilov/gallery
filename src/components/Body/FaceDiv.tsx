import { styled } from "@mui/material/styles";

import type { PersonTag } from "../../types";

import "../../styles/FaceDiv.css";
import "../../styles/theme-variables.css";

interface RectangleProps {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

const Rectangle = styled("fieldset", {
  shouldForwardProp: (prop) =>
    prop !== "top" && prop !== "bottom" && prop !== "left" && prop !== "right",
})<RectangleProps>(({ top, bottom, left, right }) => ({
  top: `${top * 100}%`,
  bottom: `${100 - bottom * 100 - 3}%`,
  left: `${left * 100}%`,
  right: `${100 - right * 100}%`,
  position: "absolute",
  color: "var(--colorRectangle)",
  padding: "3px 6px",
  border: "var(--borderRectangle) solid 3px",
  transform: "rotatex(180deg)",
}));

interface FaceDivProps {
  person: PersonTag;
  hidden: boolean;
  setFace: (person: PersonTag | null) => void;
}

const FaceDiv = ({ person, hidden, setFace }: FaceDivProps) => {
  if (!person.position) {
    return null;
  }

  return (
    <Rectangle
      top={person.position.top}
      bottom={person.position.bottom}
      left={person.position.left}
      right={person.position.right}
      className={hidden ? "hidden" : ""}
      onMouseLeave={() => setFace(null)}
      onMouseEnter={() => setFace(person)}
    >
      <legend style={{ transform: "rotatex(180deg)" }}>{person.name}</legend>
    </Rectangle>
  );
};

export default FaceDiv;
