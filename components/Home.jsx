import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

const Home = ({ youtubeVideoID, videoStart, videoEnd, sectionTitle }) => {
  // const [isVisible, setIsVisible] = useState(false);
console.log("youtubeVideoID",youtubeVideoID)
console.log("sectionTitle",sectionTitle)

// useEffect(()=>{
//   console.log("useEffect",youtubeVideoID)
//   loadYoutubeIframeAPI()
// if(youtubeVideoID){
//   setIsVisible(true)
//   console.log("isVisible",isVisible)

// }
// },[isVisible])

// const videoUrl = `https://www.youtube.com/embed/xjpQRTNhbwk?start=5&end=10&autoplay=1`;

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
        style={{ pointerEvents: 'none', width: '133vh', height: '75vh' }}
        allow="autoplay; fullscreen"
        src={`https://www.youtube.com/embed/${youtubeVideoID}?${videoStart}=5&${videoEnd}=10&autoplay=1&controls=0&showinfo=0&disablekb=1&modestbranding=1&rel=0&mute=1&playsinline=1&enablejsapi=1&origin=https://ns-blue-weberealty.thrivebrokers.com`}
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
