import React from 'react';
import PropTypes from 'prop-types';

const Home = ({ home }) => {
  const {youtubeVideoID, videoStart, videoEnd, sectionTitle, menu } = home;
console.log("youtubeVideoID",youtubeVideoID)

  return (
 <div
       id={menu ? menu.replace(/\s/g, '').toLowerCase() : 'home'}
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
        style={{ pointerEvents: 'none' }}
        allow="autoplay; fullscreen"
        src={`https://www.youtube.com/embed/${youtubeVideoID}?start=${videoStart}&end=${videoEnd}&autoplay=1&controls=0&showinfo=0&disablekb=1&modestbranding=1&rel=0&mute=1&playsinline=1&enablejsapi=1&origin=https://ns-blue-weberealty.thrivebrokers.com/`}
      />
      <div
        style={{
          textAlign: 'center',
          cursor: 'pointer',
          fontWeight: 'bold',
          textDecoration: 'underline',
        }}
      >
        <a id="playSound" onClick={(e)=>{handlePlaySoundButtonClick(e)}}>
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
  menu: PropTypes.string.isRequired,
  sectionTitle: PropTypes.string.isRequired,
};

export default Home;