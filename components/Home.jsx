import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

const Home = ({ youtubeVideoID, videoStart, videoEnd, sectionTitle }) => {
  const [homeVideoHeight, setHomeVideoHeight] = useState();
  const [homeVideoWidth, setHomeVideoWidth] = useState();

  useEffect(() => {
    function getVideoDimensions() {
      const windowHeight = window.innerHeight;
      const windowWidth = window.innerWidth;
      let height = windowHeight * 0.5; // Default to 50% of window height
      let width = height * 1.777; // Aspect ratio 16:9

      if (width > windowWidth) {
        width = windowWidth;
        height = width / 1.777;
      }

      return { width: width + 'px', height: height + 'px' };
    }

    function setVideoDimensions() {
      const { width, height } = getVideoDimensions();
      setHomeVideoWidth(width);
      setHomeVideoHeight(height);
    }

    setVideoDimensions();
    window.addEventListener('resize', setVideoDimensions);

    return () => {
      window.removeEventListener('resize', setVideoDimensions);
    };
  }, []);

  return (
    <div
      id="home"
      style={{
        backgroundColor: '#fafafa',
        textAlign: 'center',
        paddingTop: '50px',
        paddingBottom: '50px',
      }}
    >
      <h1>{sectionTitle}</h1>
      <iframe
        id="video1"
        frameBorder="0"
        style={{
          pointerEvents: 'none',
          width: homeVideoWidth,
          height: homeVideoHeight,
          margin: 'auto',
          maxWidth: '100%',
        }}
        allow="autoplay; fullscreen"
        src={`https://www.youtube.com/embed/${youtubeVideoID}?start=${videoStart}&end=${videoEnd}&autoplay=1&controls=0&showinfo=0&disablekb=1&modestbranding=1&rel=0&mute=1&playsinline=1&enablejsapi=1&origin=https://ns-blue-weberealty.thrivebrokers.com`}
      />
      <div
        style={{
          textAlign: 'center',
          cursor: 'pointer',
          fontWeight: 'bold',
          textDecoration: 'underline',
        }}
      >
        <a
          id="playSound"
          onClick={(e) => {
            handlePlaySoundButtonClick(e);
          }}
        >
          Play Sound
        </a>
      </div>
    </div>
  );
};

Home.propTypes = {
  youtubeVideoID: PropTypes.string.isRequired,
  videoStart: PropTypes.number.isRequired,
  videoEnd: PropTypes.number.isRequired,
  sectionTitle: PropTypes.string.isRequired,
};

export default Home;
