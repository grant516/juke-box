import React, { useEffect, useState } from 'react'
import {setDoc, collection, doc} from 'firebase/firestore'
import {db} from "../firebase-config"
import config from "../config.json";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button } from 'react-bootstrap';

function Host() {
  const [hostCode, setHostCode] = useState("");

  const codesCollectionRef = collection(db, "code");
  const [tokenRetrieved, setTokenRetrieved] = useState(false);

  // TODO: May not need these since I could just save the information straight
  // into the database. But it could be nice to have these variables.
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
  }, []);

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
                queueRefreshToken: queueR});

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

  /*
  * Generate Random Code
  * This code generates a random 6 character code that will allow me to 
  * access the information in the database when others join the host's
  * session.
  */
  const generateRandomCode = async () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let generatedCode = '';
  
    for (let i = 0; i < 6; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      generatedCode += characters.charAt(randomIndex);
    }
  
    setHostCode(generatedCode);
  };



  if(!tokenRetrieved) {
    return (
      <div>
        <Button onClick={event => {
              getAccessToken();
            }}>
              Create Shared Playlist
            </Button>
      </div>
    )
  }
  else {
    return (
      <div>
        <h2>Here is Your Host Code: {hostCode}</h2>
        <Button onClick={event => {
            }}>
              This Button does nothing :D
            </Button>
      </div>
    )
  }
}

export default Host