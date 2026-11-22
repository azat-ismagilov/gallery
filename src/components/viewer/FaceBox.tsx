import { styled } from "@mui/material/styles";

import type { PersonTag } from "@/types/gallery";

interface RectangleProps {
  top: number;
  bottom: number;
  left: number;
  right: number;
  hiddenBox: boolean;
}

const Rectangle = styled("fieldset", {
  shouldForwardProp: (prop) =>
    prop !== "top" &&
    prop !== "bottom" &&
    prop !== "left" &&
    prop !== "right" &&
    prop !== "hiddenBox",
})<RectangleProps>(({ top, bottom, left, right, hiddenBox, theme }) => ({
  top: `${top * 100}%`,
  bottom: `${100 - bottom * 100 - 3}%`,
  left: `${left * 100}%`,
  right: `${100 - right * 100}%`,
  position: "absolute",
  margin: 0,
  color: theme.palette.warning.light,
  padding: "2px 6px",
  border: `2px solid ${theme.palette.warning.light}`,
  borderRadius: theme.shape.borderRadius,
  transform: "rotateX(180deg)",
  opacity: hiddenBox ? 0 : 1,
  transition: theme.transitions.create("opacity", { duration: 150 }),
  pointerEvents: "auto",
}));

interface FaceBoxProps {
  person: PersonTag;
  hidden: boolean;
  setFace: (person: PersonTag | null) => void;
}

const FaceBox = ({ person, hidden, setFace }: FaceBoxProps) => {
  if (!person.position) {
    return null;
  }

  return (
    <Rectangle
      top={person.position.top}
      bottom={person.position.bottom}
      left={person.position.left}
      right={person.position.right}
      hiddenBox={hidden}
      onMouseLeave={() => setFace(null)}
      onMouseEnter={() => setFace(person)}
    >
      <legend
        style={{
          transform: "rotateX(180deg)",
          fontSize: "0.75rem",
          fontWeight: 600,
          textShadow: "0 1px 3px rgba(0,0,0,0.9)",
        }}
      >
        {person.name}
      </legend>
    </Rectangle>
  );
};

export default FaceBox;
