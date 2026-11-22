import { styled } from "@mui/material/styles";

import type { FaceDiffStatus, PersonTag } from "@/types/gallery";

interface RectangleProps {
  top: number;
  bottom: number;
  left: number;
  right: number;
  hiddenBox: boolean;
  diffStatus: FaceDiffStatus;
}

const Rectangle = styled("fieldset", {
  shouldForwardProp: (prop) =>
    prop !== "top" &&
    prop !== "bottom" &&
    prop !== "left" &&
    prop !== "right" &&
    prop !== "hiddenBox" &&
    prop !== "diffStatus",
})<RectangleProps>(
  ({ top, bottom, left, right, hiddenBox, diffStatus, theme }) => {
    const color =
      diffStatus === "added"
        ? theme.palette.success.light
        : diffStatus === "removed"
          ? theme.palette.error.light
          : theme.palette.warning.light;

    return {
      top: `${top * 100}%`,
      bottom: `${100 - bottom * 100 - 3}%`,
      left: `${left * 100}%`,
      right: `${100 - right * 100}%`,
      position: "absolute",
      margin: 0,
      color,
      padding: "2px 6px",
      border: `2px ${diffStatus === "removed" ? "dashed" : "solid"} ${color}`,
      borderRadius: theme.shape.borderRadius,
      transform: "rotateX(180deg)",
      opacity: hiddenBox ? 0 : 1,
      transition: theme.transitions.create("opacity", { duration: 150 }),
      pointerEvents: "auto",
    };
  },
);

interface FaceBoxProps {
  person: PersonTag;
  hidden: boolean;
  status?: FaceDiffStatus;
  setFace: (person: PersonTag | null) => void;
}

const FaceBox = ({
  person,
  hidden,
  status = "unchanged",
  setFace,
}: FaceBoxProps) => {
  if (!person.position) {
    return null;
  }

  const prefix = status === "added" ? "+ " : status === "removed" ? "- " : "";

  return (
    <Rectangle
      top={person.position.top}
      bottom={person.position.bottom}
      left={person.position.left}
      right={person.position.right}
      hiddenBox={hidden}
      diffStatus={status}
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
        {prefix}
        {person.name}
      </legend>
    </Rectangle>
  );
};

export default FaceBox;
