import './Home.css';
import logo from "../images/JukeBox_Logo.png";
import React, { useEffect, useState } from 'react'
import config from "../config.json";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

/******************************************************************************
 * Start of code for auth token.
 * Below here we are going to include all of the code that is needed to 
 * get the auth token.
******************************************************************************/
async function authorize(){
  let url = "https://accounts.spotify.com/authorize";
  url += "?client_id=" + config.CLIENT_ID;
  url += "&response_type=code";
  url += "&redirect_uri=" + encodeURI(config.REDIRECT_URI);
  url += "&show_dialog=true";
  url += "&scope=user-read-private user-read-email user-modify-playback-state user-read-playback-position user-library-read streaming user-read-playback-state user-read-recently-played playlist-read-private";
  window.location.href = url; // Show Spotify's authorization screen
}
/******************************************************************************
 * End of the code for auth token
******************************************************************************/

function Home() {

  const [accessToken, setAccessToken] = useState("");
  const navigate = useNavigate();

  /* 
  * Start On Render
  * This code belows ensures that a random generated code exist at all
  * times and there is no way to run into a firebase doc empty error.
  */
  useEffect(() => {

    // API Access Token
    var authParameters = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials&client_id=' + config.CLIENT_ID + '&client_secret=' + config.CLIENT_SECRET + '&scope=user-read-private user-read-email user-modify-playback-state user-read-playback-position user-library-read streaming user-read-playback-state user-read-recently-played playlist-read-private'
    }
    fetch('https://accounts.spotify.com/api/token', authParameters)
      .then(result => result.json())
      .then(data => setAccessToken(data.access_token))
  }, []);

  /////////////////////////////////////////////////////////////////////////
      
  return (
    <div className="page">
      <h1 className='welcome'>Welcome to JukeBox</h1>
      <img className='image' src={logo} />
      <Button onClick={authorize} id='appButtons'>
        Host
      </Button>
      <Button onClick={() => navigate("/Join")} id='appButtons'>
        Join
      </Button>
    </div>
  )
}

export default Home