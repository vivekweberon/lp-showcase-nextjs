import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

const Home = ({ youtubeVideoID, videoStart, videoEnd, menu, sectionTitle }) => {
  const [isVisible, setIsVisible] = useState(false);
console.log("youtubeVideoID",youtubeVideoID)

useEffect(()=>{
  console.log("useEffect",youtubeVideoID)
if(youtubeVideoID){
  setIsVisible(true)
  console.log("isVisible",isVisible)
  loadYoutubeIframeAPI()
}
},[isVisible])



 

  const videoUrl = `https://www.youtube.com/embed/xjpQRTNhbwk?start=5&end=10&autoplay=1`;

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
        style={{ pointerEvents: 'none', width: '80%', height: '400px' }}
        allow="autoplay; fullscreen"
        src="https://www.youtube.com/embed/xjpQRTNhbwk?start=5&end=10&autoplay=1"
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
         Play Video
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
