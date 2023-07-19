import { useEffect, useRef, useState } from "react";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { IconButton } from "@mui/material";
import styled from "styled-components";

import PhotoParser from "../../Util/PhotoParser";

import Control from "./Control";
import FaceDiv from "./FaceDiv";
import PhotoInfo from "./PhotoInfo";

import "../../styles/Body.css";

const Lightbox = ({
    photo,
    handleRotationLeft,
    handleRotationRight,
    leftArrow,
    rightArrow
}) => {
    const [photoInfo, setPhotoInfo] = useState(null);

    useEffect(() => {
        PhotoParser.getPhotoInfo(photo.id, setPhotoInfo);
    }, [photo.id]);

    const [face, setFace] = useState(null);
    const imgRef = useRef(null);

    const Faces = styled.div`
        width: ${imgRef?.current?.width}px;
        height: ${imgRef?.current?.height}px;
        position: absolute;
    `;

    return (
        <div className="wrapper">
            <div className="img-container">
                <img
                    ref={imgRef}
                    className="full"
                    src={photo.url}
                    alt={"fullsize"}
                />
                <Faces>
                    {photoInfo?.person?.map(person =>
                        (<FaceDiv imgRef={imgRef} person={person}
                            face={face} setFace={setFace}
                            key={person.name + "facediv" + person.position.top} />))}
                </Faces>
            </div>
            <Control />
            <PhotoInfo photo={photo} photoInfo={photoInfo} setFace={setFace} />
            {leftArrow && <div className="overlay-arrows_left">
                <IconButton onClick={handleRotationLeft}>
                    <ArrowForwardIosIcon className="icon-button" style={{ transform: "scale(-1, 1)" }} />
                </IconButton>
            </div>}
            {rightArrow && <div className="overlay-arrows_right">
                <IconButton onClick={handleRotationRight}>
                    <ArrowForwardIosIcon className="icon-button" />
                </IconButton>
            </div>}
        </div>
    );
};

export default Lightbox;
