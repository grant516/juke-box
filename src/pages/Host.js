import './Host.css';
import React, { useEffect, useState } from 'react'
import QRCode from 'qrcode.react';
import {setDoc, collection, doc} from 'firebase/firestore'
import {db} from "../firebase-config"
import config from "../config.json";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button } from 'react-bootstrap';

function Host() {
  const [hostCode, setHostCode] = useState("");

  const codesCollectionRef = collection(db, "code");
  const [tokenRetrieved, setTokenRetrieved] = useState(false);
  const [product, setProduct] = useState("");

  // TODO: May not need these since I could just save the information straight
  // into the database. But it could be nice to have these variables.
  const [accessToken, setAccessToken] = useState("");
  const [accessGetToken, setAccessGetToken] = useState("");
  const [queueAccessToken, setQueueAccessToken] = useState("");
  const [queueRefreshToken, setQueueRefreshToken] = useState("");

  /*******************************************
  * Use Effect 
  * Runs once on render.
  ********************************************/
  useEffect(() => {
    setTimeout(() => {
      const genCode = async () => {
        await generateRandomCode();
      };

      genCode();
    }, 0);

    /*
    * This code gets the access token for the api request. 
    */


    var authParameters = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        //'Authorization': 'Basic ' + base64AuthString
      },
      body: 'grant_type=client_credentials&client_id=' + 
      //body: 'grant_type=authorization_code&client_id=' +
      config.CLIENT_ID + '&client_secret=' + config.CLIENT_SECRET + '&scope=user-read-private user-read-email user-modify-playback-state user-read-playback-position user-library-read streaming user-read-playback-state user-read-recently-played playlist-read-private'
    }
    fetch('https://accounts.spotify.com/api/token', authParameters)
      .then(result => result.json())
      .then(data => {
        setAccessToken(data.access_token);
      })

  }, []);

  /****************************************************************************
  * Get Product Information
  * This function grabs the Membership information from the user so we can 
  * determine if they can host the shared playlist.
  ****************************************************************************/
  const getProductInfo = async () => {

    var searchParameters = {
      methods: 'GET',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Bearer ' + accessGetToken
      }
    }
  
    var returnedSongs = await fetch('https://api.spotify.com/v1/me' , searchParameters)
    .then(response => response.json())
    .then(data => {
      console.log(data);
    })
  }


  /****************************************************************************
  * Generate Random Code
  * This code generates a random 6 character code that will allow me to 
  * access the information in the database when others join the host's
  * session.
  ****************************************************************************/
  const generateRandomCode = async () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let generatedCode = '';
  
    for (let i = 0; i < 6; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      generatedCode += characters.charAt(randomIndex);
    }
  
    setHostCode(generatedCode);
  };

  /********************************************
  * Start of getAccessToken
  *********************************************/
  const getAccessToken = async () =>
  {
    if (queueAccessToken.length <= 0 && queueRefreshToken.length <= 0)
    {
      let fullURL = window.location.href;
      let startIndex = fullURL.indexOf("code=");
      if(startIndex >= 0)
      {
        let code = fullURL.substring(startIndex + "code=".length);
        let scope = "user-read-private user-read-email user-modify-playback-state";

        var authOptions = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: 'grant_type=authorization_code'+ 
          '&client_id=' + config.CLIENT_ID + 
          '&client_secret=' + config.CLIENT_SECRET + 
          '&code=' + code + 
          '&redirect_uri=' + config.REDIRECT_URI + 
          '&scope=' + scope
        }

        let queue = "";
        let queueR = "";
        fetch('https://accounts.spotify.com/api/token', authOptions)
            .then(result => result.json())
            .then(result => {
              queueR = result.refresh_token;
              queue = result.access_token;
              setQueueRefreshToken(result.refresh_token); 
              setQueueAccessToken(result.access_token);

              // The code below saves the queueAccessTokens inside the firebase
              if(queue !== "" && queueR !== "")
              {
                setDoc(doc(codesCollectionRef, hostCode), 
                {queueAccessToken: queue, 
                queueRefreshToken: queueR,
                accessToken: accessToken});

                setTokenRetrieved(true);
              }
            })
            .catch(error => {
              // Handle any errors that occurred during the fetch or data processing
              console.error('Error:', error);
            });
      }
    }
  }
  /********************************************
  * End of getAccessToken
  *********************************************/

  /********************************************
  * QR Code datamaker 
  *********************************************/
  const generateQRcodeURL = () => {
    // Modify this URL as needed
    return `${config.JOIN_REDIRECT_URI}` + `?data=${hostCode}`;
  };

  if(!tokenRetrieved) {
    return (
      <div>
        <Button onClick={event => {
              //getProductInfo();
              getAccessToken();
            }} className='createButton'>
              Create Shared Playlist
            </Button>
      </div>
    )
  }
  else {
    return (
      <div>
        <h2 id='hostText'>Here is Your Host Code: {hostCode}</h2>
        <h3 id='hostText'>Have those who want to join scan the QR code below:</h3>
        <QRCode fgColor="#71e061" bgColor="#2c2e2c" value={generateQRcodeURL()} />
      </div>
    )
  }
}

export default Host