import { useEffect, useRef, useState } from "react";
import InfiniteScroll from "react-infinite-scroller";
import { Box, Typography } from "@mui/material";

import "../../consts";

import usePhotoLoader from "../../Util/PhotoLoader";
import { useAppContext } from "../AppContext";

import MyModal from "./MyModal";
import PhotoGridByYear from "./PhotoGridByYear";

const Body = () => {
    const { data, setFullscreenPhotoId, setIsSlideShow, desktop } = useAppContext();
    const scrollRef = useRef(null);

    const { hasMorePhotos, loadMorePhotos, photosByEvent, photosList } = usePhotoLoader();

    const [fullscreenPhoto, setFullscreenPhoto] = useState(null);
    const [fullscreenIndex, setFullscreenIndex] = useState(null);
    const [rightArrow, setRightArrow] = useState(null);
    const [leftArrow, setLeftArrow] = useState(null);

    const handleClick = (id) => {
        setFullscreenPhotoId(id);
    };

    useEffect(() => {
        const id = data.fullscreenPhotoId;
        if (id != null) {
            const index = photosList.findIndex(photo => photo.id === id);

            if (index === -1 && hasMorePhotos()) {
                loadMorePhotos();
                return;
            }

            const photo = photosList[index];
            setFullscreenIndex(index);
            setFullscreenPhoto(photo);

            setLeftArrow(index !== 0);
            setRightArrow(index + 1 < photosList.length || hasMorePhotos());

            if (photosList.length <= index + 4 && hasMorePhotos()) {
                loadMorePhotos();
            }
        } else {
            setFullscreenIndex(null);
            setFullscreenPhoto(null);
            setLeftArrow(false);
            setRightArrow(false);
        }
    }, [data.fullscreenPhotoId, photosList, hasMorePhotos, loadMorePhotos]);

    useEffect(() => {
        if (data.fullscreenPhotoId === null) {
            setIsSlideShow(false);
        }
    }, [data.fullscreenPhotoId]);

    const handleRotationRight = () => {
        let newIndex = fullscreenIndex + 1;
        if (newIndex >= photosList.length) {
            newIndex = 0;
        }
        handleClick(photosList[newIndex].id);
    };

    const handleRotationLeft = () => {
        handleClick(photosList[fullscreenIndex - 1].id);
    };

    useEffect(() => {
        const target = document.getElementsByTagName("body")[0];
        const listener = (e) => {
            if (fullscreenPhoto) {
                switch (e.key) {
                case "ArrowLeft":
                    if (leftArrow) {
                        handleRotationLeft();
                    }
                    break;
                case "ArrowRight":
                    if (rightArrow) {
                        handleRotationRight();
                    }
                    break;
                case "Escape":
                    setFullscreenPhotoId(null);
                    break;
                default:
                    break;
                }
            }
        };
        target.onkeydown = listener;
        return () => {
            target.removeEventListener("onkeydown", listener);
        };
    }, [fullscreenPhoto]);

    return (
        <Box
            ref={scrollRef}
            sx={{
                height: 'calc(100vh - 150px)',
                gap: '2em',
                overflow: 'auto',
                borderRadius: '8px',
                '& .control': {
                    background: 'rgba(0, 0, 0, 0.5)', // Example for --opacityBGColor
                    position: 'fixed',
                    top: '40px',
                    right: '40px',
                    cursor: 'pointer',
                },
                '&::-webkit-scrollbar': {
                    width: '10px',
                    borderRadius: '3px',
                },
                '&::-webkit-scrollbar-track': {
                    backgroundColor: '#f0f0f0', // Example for --additionalBGColor
                },
                '&::-webkit-scrollbar-thumb': {
                    backgroundColor: '#c0c0c0', // Example for --mainBGColor
                    outline: '1px solid #a0a0a0', // Example for --additionalColor
                    borderRadius: '3px',
                },
                '& .masonry': {
                    display: 'flex',
                    flexFlow: 'row wrap',
                    gap: '3px',
                    width: '100%',
                },
                '& .preview': {
                    objectFit: 'cover',
                    objectPosition: 'top',
                    width: '100%',
                    borderRadius: '8px',
                    height: '100%',
                }
            }}
        >
            {desktop && data.text && <Typography variant="h1" sx={{ width: "100%" }}>{data.text}</Typography>}
            <InfiniteScroll
                loadMore={loadMorePhotos}
                hasMore={hasMorePhotos()}
                initialLoad={true}
                loader={<Typography variant="h1" key={0}>Loading ...</Typography>}
                useWindow={false}
                getScrollParent={() => scrollRef.current}
            >
                {Array.from(photosByEvent).map(([event, photos]) =>
                    <Box key={event}>
                        {event && <Typography variant="h1">{event}</Typography>}
                        <PhotoGridByYear photos={photos} handleClick={handleClick} />
                    </Box>
                )}
            </InfiniteScroll>
            {!hasMorePhotos() && photosList.length === 0 && <Typography variant="h1">No photo</Typography>}
            {fullscreenPhoto != null && <MyModal photo={fullscreenPhoto}
                handleRotationRight={handleRotationRight}
                handleRotationLeft={handleRotationLeft}
                rightArrow={rightArrow}
                leftArrow={leftArrow}
            />}
        </Box>
    );
};

export default Body;
