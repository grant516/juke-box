import React, { useEffect, useState } from 'react'
import {setDoc, collection, doc} from 'firebase/firestore'
import {db} from "../firebase-config"
import config from "../config.json";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, InputGroup, FormControl, Button, Row, Card } from 'react-bootstrap';

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

  const [code, setCode] = useState("");
  const [postText, setPostText] = useState("");

  const codesCollectionRef = collection(db, "code");

  /////////////////////////////////////////////////////////////////////////////
  const [searchInput, setSearchInput] = useState("");
  const [accessToken, setAccessToken] = useState("");

  // The code below is what we get in return when the user authorizes the 
  // website to use their data from Spotify.
  const [queueAccessToken, setQueueAccessToken] = useState("");
  const [queueRefreshToken, setQueueRefreshToken] = useState("");
  const [refreshAttempt, setrefreshAttempt] = useState(0);


  const [albums, setAlbums] = useState([]);
  const [top10Tracks, setTopTracks] = useState([])
  /////////////////////////////////////////////////////////////////////////////

  /*
  * Create Host
  * This code below is what will create the innital data to be stored inside
  * the user's section in the google firebase. Without this, others would be 
  * unable to share songs with the host of a session.
  */
  const createHost = async () => {
      generateRandomCode();
      await setDoc(doc(codesCollectionRef, code), {postText});
  }

  /*
  * Generate Random Code
  * This code generates a random 6 character code that will allow me to 
  * access the information in the database when others join the host's
  * session.
  */
  function generateRandomCode() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let generatedCode = '';
  
    for (let i = 0; i < 6; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      generatedCode += characters.charAt(randomIndex);
    }
  
    setCode(generatedCode);
  }

  /* 
  * Start On Render
  * This code belows ensures that a random generated code exist at all
  * times and there is no way to run into a firebase doc empty error.
  */
  useEffect(() => {
    setTimeout(() => {
      generateRandomCode();
    }, 0);

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

      //console.log(accessToken);
      console.log("in here");
  }, []);


  // The Section below is from the old jukeBox code without the database.
  /////////////////////////////////////////////////////////////////////////

  /********************************************
  * Beginning of refresh Queue Access Token
  *********************************************/
  async function refreshQueueAccessToken(){
    // refresh token that has been previously stored
    const refreshToken = queueRefreshToken;
    const url = "https://accounts.spotify.com/api/token";

    var authOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=refresh_token' + 
      '&client_id=' + config.CLIENT_ID + 
      '&client_secret=' + config.CLIENT_SECRET + 
      '&refresh_token=' + refreshToken
    }

    const body = await fetch(url, authOptions)
      .then(result => result.json())
      .then(result => {
        //console.log(result);
        setQueueAccessToken(result.access_token);
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }
  /********************************************
  * End of refresh Queue Access Token
  *********************************************/

  /********************************************
  * Start of getAccessToken
  *********************************************/
  const getAccessToken = async () =>
  {
    console.log("queueAccessToken: " + queueAccessToken);
    console.log("queueRefreshToken: " + queueRefreshToken);

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

        fetch('https://accounts.spotify.com/api/token', authOptions)
            .then(result => result.json())
            .then(result => {
              console.log(result); 
              console.log("The result is above")
              setQueueRefreshToken(result.refresh_token); 
              setQueueAccessToken(result.access_token);
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

  /****************************************************************************
   * Start of addToQueue
   * This function is responsible for adding songs to the spotify queue.
  ****************************************************************************/
  async function addToQueue(songId) {
    if(queueAccessToken.length > 0)
    {
      let options = {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${queueAccessToken}`
        }
      };

      let url = 'https://api.spotify.com/v1/me/player/queue?uri=spotify%3Atrack%3A'
      + songId + '&device_id=' + config.DEVICE_ID_MY_COMP;

      console.log(url);

      let badStatus = false;
      await fetch(url, options)
        .then(res => {
          if(res.status == 401)
          {
            badStatus = true;
          }
        })
        .then(res => res.json())
        .then(json => console.log(json + "This is where I'm at"))
        .catch(err => console.error('error:' + err));

        if(badStatus && refreshAttempt < config.TOTAL_REFRESH_ATTEMPTS)
        {
          await refreshQueueAccessToken();
          // We want to avoid an infinite loop
          await addToQueue(songId);
          setrefreshAttempt(refreshAttempt + 1);
        }
        else if(!badStatus)
        {
          console.log("good status");
          setrefreshAttempt(0);
        }
    }
  }
  /****************************************************************************
   * End of addToQueue
  ****************************************************************************/

  /* 
  * Search
  * This is where we perform the song search from the spotify API
  * 
  * TODO: This code will probably be moved into the guest section of the 
  * app since they are the ones who need to perform the searching and 
  * adding of the music.
  */
  async function search() {

    // Get request using search to get the Artist ID
    var searchParameters = {
      methods: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + accessToken
      }
    }
  
    var returnedSongs = await fetch('https://api.spotify.com/v1/search?q=' +
                        searchInput + '&type=track' + 
                        '&market=US&limit=' + 
                        config.TOTAL_DISPLAYED_SONGS, searchParameters)
    .then(response => response.json())
    .then(data => {
  
      setTopTracks(data.tracks.items);
    })
  }

  const onClicked = async (song) => {
    await addToQueue(song.id);
  }

  /*
  * Artist Name
  * This function grabs the artist name(s) and prepares it before sending it 
  * to get it displayed.
  */
  const artistName = (song) => {
    var songArtist = "";
    song.artists.map( (artist, i) => { 
      if(i > 0){
        songArtist += ", ";
      }
      songArtist += artist.name;
    })
    return songArtist;
  }


  /////////////////////////////////////////////////////////////////////////
      
  return (
    // <div className='createPostPage '>
    //     {" "}
    //     <h1>{code}</h1>
    //     <div className='cpContainer'>
    //         <h1>Create A Post</h1>
            
    //         <div className='inputGp'>
    //         <label> Post: </label>
    //         <textarea placeholder="Post..."
    //         onChange={(event) => {
    //             setPostText(event.target.value);
    //         }}>
    //         </textarea>
    //         </div>
    //         <button onClick={createHost}> Submit Post </button>
    //     </div>
    // </div>
    <div className="App">
    <Button onClick={authorize}>
      Authorization
    </Button>
      <Container>
        <InputGroup className='mb-3' size="lg">
          <FormControl
          placeholder='Search For Songs'
          type="input"
          onKeyPress={event => {
            if (event.key === "Enter") {
              getAccessToken();
              search();
            }
          }}
          onChange={event => setSearchInput(event.target.value)}
          />
          <Button onClick={event => {
            getAccessToken();
            search();
          }}>
            Search
          </Button>
        </InputGroup>
      </Container>
      <Container>
        <Row className='mx-2 row row-cols-4'>
          {top10Tracks.map( (song, i) => {
            return (
              <Card onClick={() => onClicked(song)} style={{ cursor: "pointer" }}>
                <Card.Img src={song.album.images[0].url} />
                <Card.Body>
                  <Card.Title>{song.name}</Card.Title>  
                  <Card.Text>{artistName(song)}</Card.Text>
                </Card.Body> 
              </Card>
            )
          })}
        </Row>
        
      </Container>
    </div>
  )
}

export default Home