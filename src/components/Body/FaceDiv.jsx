import { styled } from "@mui/material/styles";

import "../../styles/FaceDiv.css";
import "../../styles/theme-variables.css";

const Rectangle = styled("fieldset", {
  shouldForwardProp: (prop) =>
    !["top", "bottom", "left", "right"].includes(prop),
})(({ top, bottom, left, right }) => ({
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

const FaceDiv = ({ person, hidden, setFace }) => {
  return (
    <Rectangle
      top={person?.position?.top}
      bottom={person?.position?.bottom}
      left={person?.position?.left}
      right={person?.position?.right}
      className={hidden ? "hidden" : ""}
      onMouseLeave={() => setFace(null)}
      onMouseEnter={() => setFace(person)}
    >
      <legend style={{ transform: "rotatex(180deg)" }}>{person.name}</legend>
    </Rectangle>
  );
};

export default FaceDiv;
