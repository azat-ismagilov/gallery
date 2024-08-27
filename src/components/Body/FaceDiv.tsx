import React from "react";

import styled from "styled-components";

import "../../styles/FaceDiv.css";
import "../../styles/theme-variables.css";

interface PersonPosition {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

interface Person {
  name: string;
  position?: PersonPosition;
}

interface FaceDivProps {
  person: Person;
  hidden: boolean;
  setFace: (person: Person | null) => void;
}

const Rectangle = styled.fieldset<PersonPosition>`
  top: ${(props) => props.top * 100 + "%"};
  bottom: ${(props) => 100 - props.bottom * 100 - 3 + "%"};
  left: ${(props) => props.left * 100 + "%"};
  right: ${(props) => 100 - props.right * 100 + "%"};
  position: absolute;
  color: var(--colorRectangle);
  padding: 3px 6px;
  border: var(--borderRectangle) solid 3px;
  transform: rotatex(180deg);
`;

const FaceDiv: React.FC<FaceDivProps> = ({ person, hidden, setFace }) => {
  return (
    <Rectangle
      top={person?.position?.top ?? 0}
      bottom={person?.position?.bottom ?? 0}
      left={person?.position?.left ?? 0}
      right={person?.position?.right ?? 0}
      className={hidden ? "hidden" : ""}
      onMouseLeave={() => setFace(null)}
      onMouseEnter={() => setFace(person)}
    >
      <legend style={{ transform: "rotatex(180deg)" }}>{person.name}</legend>
    </Rectangle>
  );
};

export default FaceDiv;
