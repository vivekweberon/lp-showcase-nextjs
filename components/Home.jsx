import React, { useEffect } from 'react';

const Home = ({ home }) => {
  const {youtubeVideoID, videoStart, videoEnd, sectionTitle, menu } = home;

  useEffect(() => {
    console.log("useEffect home");
    addBGVideo(youtubeVideoID, videoStart, videoEnd);
  })

  return (
    <div
      id={menu ? menu.replace(/\s/g, '').toLowerCase() : 'home'}
      className='container-fluid'
      style={{
        backgroundColor: '#fafafa',
        textAlign: 'center',
        paddingTop: '50px',
        paddingBottom: '50px',
      }}
    >
      <div className='row'>
        <div className="col-12" style={{textAlign: 'center'}}>
          <h1>{sectionTitle}</h1>
        </div>
      </div>

      <div className="row">
			  <div className="col-12">
				  <iframe id='video1' frameborder="0" style={{pointerEvents:"none"}} allow="autoplay; fullscreen" src="">
				  </iframe>
          <div style={{textAlign:'center', cursor:'pointer', fontWeight:'bold', textDecoration:'underline'}}>
            <a id='playSound'>Play Sound</a>
          </div>
			  </div>
		  </div>
    </div>
  );
};

export default Home;