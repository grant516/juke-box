import './Host.css';
import React, { useEffect, useState } from 'react'
import QRCode from 'qrcode.react';
import {setDoc, collection, doc} from 'firebase/firestore'
import {db} from "../firebase-config"
import config from "../config.json";
import 'bootstrap/dist/css/bootstrap.min.css';
//import { Button } from 'react-bootstrap';
import { Container, InputGroup, FormControl, Button, Row, Card } from 'react-bootstrap';


function Host() {
  const Buffer = require('buffer').Buffer;

  const [hostCode, setHostCode] = useState("");

  const codesCollectionRef = collection(db, "code");
  const [tokenRetrieved, setTokenRetrieved] = useState(false);
  const [product, setProduct] = useState(true);
  const [productTokenRetrieved, setProductTokenRetrieved] = useState(false);

  // TODO: May not need these since I could just save the information straight
  // into the database. But it could be nice to have these variables.
  const [accessToken, setAccessToken] = useState("");
  const [accessGetToken, setAccessGetToken] = useState("");
  const [queueAccessToken, setQueueAccessToken] = useState("");
  const [queueRefreshToken, setQueueRefreshToken] = useState("");

  const [pastSongs, setPastSongs] = useState([]);

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

  /********************************************
  * Start of userProfile
  * This function grabs the Membership information from the user so we can 
  * determine if they can host the shared playlist.
  *********************************************/
  async function userProfile() {
  
    var searchParameters = {
      methods: 'GET',
      headers: {
        'Authorization': 'Bearer ' + queueAccessToken
      }
    }

    fetch('https://api.spotify.com/v1/me', searchParameters)
    .then(response => response.json())
    .then(data => {
      console.log(data);
      if(data.product === 'premium'){
        setProduct(true);
      }
      else {
        setProduct(false);
      }
    })
    .catch(error => {
      // Handle any errors that occurred during the fetch
      console.error('Fetch error:', error);
      setProduct(false);
    });

    setProductTokenRetrieved(true);
  }
  /********************************************
  * End of userProfile
  *********************************************/

  /********************************************
  * Start of boolean user Profile
  * This function will call the fetch unless we already called it.
  * This prevents us from fetching data more times than we need.
  *********************************************/
  async function boolUserProfile() {
    if(!productTokenRetrieved) {
      await userProfile();
      console.log('if statement: ' + product);
      return false;
    }
    else {
      console.log('else statement: ' + product);
      return false;
    }
  }
  /********************************************
  * End of boolean user Profile
  *********************************************/

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
        let scope = "user-read-private user-read-email user-modify-playback-state user-read-recently-played";

        var authOptions = {
          method: 'POST',
          body: 'grant_type=authorization_code'+ 
          '&client_id=' + config.CLIENT_ID + 
          '&client_secret=' + config.CLIENT_SECRET + 
          '&code=' + code + 
          '&redirect_uri=' + config.REDIRECT_URI + 
          '&scope=' + scope,
          headers: {
            'content-type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + (new Buffer.from(config.CLIENT_ID + ':' + config.CLIENT_SECRET).toString('base64'))
          },
          json: true
        };

        let queue = "";
        let queueR = "";
        fetch('https://accounts.spotify.com/api/token', authOptions)
            .then(result => result.json())
            .then(result => {
              console.log(result);
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

  /*********************************************
  * Song History
  *********************************************/
  async function songHistory() {

    var searchParameters = {
      methods: 'GET',
      headers: {
        'Authorization': 'Bearer ' + queueAccessToken
      }
    }

    fetch('https://api.spotify.com/v1/me/player/recently-played', searchParameters)
    .then(response => response.json())
    .then(data => {
      console.log(data);
      setPastSongs(data.items);
    })
  }

  /********************************************
  * QR Code datamaker 
  *********************************************/
  const generateQRcodeURL = () => {
    // Modify this URL as needed
    return `${config.JOIN_REDIRECT_URI}` + `?data=${hostCode}`;
  };
  /*********************************************
  * End of QR code datamaker 
  *********************************************/

  if(!tokenRetrieved) {
    //getAccessToken();
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
  else if(tokenRetrieved && !productTokenRetrieved)
  {
    boolUserProfile();
  }
  else if(!product)
  {
    return (
      <div>
        <h2 id='hostText'>You do not have a premium account. You are not able to use this service.</h2>
      </div>
    )
  }
  else if(product) {
    return (
      <div>
        <h2 id='hostText'>Here is Your Host Code: {hostCode}</h2>
        <h3 id='hostText'>Have those who want to join scan the QR code below:</h3>
        <QRCode fgColor="#71e061" bgColor="#2c2e2c" value={generateQRcodeURL()} />

        <div></div>
        <Button onClick={event => {
              songHistory();
              boolUserProfile();
            }} className='createButton'>
              Get Current Song History
            </Button>

        <Container>
          <Row className='mx-2 row row-cols-4'>
            {pastSongs.map( (song, i) => {
              return (
                <Card className='songCard' style={{ cursor: "pointer" }}>
                  <Card.Img className='songCardImage' src={song.track.album.images[0].url} />
                  <Card.Body>
                    <Card.Title>{song.track.name}</Card.Title>  
                    {/* <Card.Text>{artistName(song)}</Card.Text> */}
                  </Card.Body> 
                </Card>
              )
            })}
          </Row>
          
        </Container>
      </div>
    )
  }
}

export default Host