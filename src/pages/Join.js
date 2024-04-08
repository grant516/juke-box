import './Join.css';
import logo from "../images/JukeBox_Logo.png";
import React, { useEffect, useState } from 'react'
import { getDoc, collection , doc } from 'firebase/firestore'
import {db} from "../firebase-config"
import config from "../config.json";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, InputGroup, FormControl, Button, Row, Card } from 'react-bootstrap';

function Join() {
  const codesCollectionRef = collection(db, "code");
  const [code, setCode] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [top10Tracks, setTopTracks] = useState([]);

  const [queueAccessToken, setQueueAccessToken] = useState("");
  const [queueRefreshToken, setQueueRefreshToken] = useState("");
  const [accessToken, setAccessToken] = useState("");

  const [refreshAttempt, setrefreshAttempt] = useState(0);

  useEffect(() => {
    let fullURL = window.location.href;
    let startIndex = fullURL.indexOf("data=");
    if(startIndex >= 0) {
      setCode(fullURL.substring(startIndex + "data=".length));
    }
  })

  const handleInputChange = (event) => {
    setCode(event.target.value);
  };

  const getHost = async () => {
    try
    {
      const codeRef = doc(db, "code", code);
      const data = await getDoc(codeRef);
      let val = data.data();
      setQueueAccessToken(val.queueAccessToken);
      setQueueRefreshToken(val.queueRefreshToken);
      setAccessToken(val.accessToken);
    }
    catch(err)
    {
      console.log(err.message);
    }
  }

  /****************************************************************************
  * Search
  * This is where we perform the song search from the spotify API
  * 
  * TODO: This code will probably be moved into the guest section of the 
  * app since they are the ones who need to perform the searching and 
  * adding of the music.
  ****************************************************************************/
  async function search() {

    // Get request using search to get the Artist ID
    var searchParameters = {
      methods: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + queueAccessToken
      }
    }
  
    let badStatus = false;
    await fetch('https://api.spotify.com/v1/search?q=' +
                        searchInput + '&type=track' + 
                        '&market=US&limit=' + 
                        config.TOTAL_DISPLAYED_SONGS, searchParameters)
    .then(response => {
      if(response.status === 401) {
        badStatus = true;
      }
    })
    .catch(err => console.error('error:' + err))

    if(!badStatus) {
      var returnedSongs = await fetch('https://api.spotify.com/v1/search?q=' +
                          searchInput + '&type=track' + 
                          '&market=US&limit=' + 
                          config.TOTAL_DISPLAYED_SONGS, searchParameters)
      .then(response => response.json())
      .then(data => {
        setTopTracks(data.tracks.items);
      })
      .catch(err => console.error('error:' + err))
    }

    if(badStatus && refreshAttempt < config.TOTAL_REFRESH_ATTEMPTS)
        {
          await refreshQueueAccessToken();
          // We want to avoid an infinite loop
          await search();
          setrefreshAttempt(refreshAttempt + 1);
        }
        else if(!badStatus)
        {
          setrefreshAttempt(0);
        }
  }

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

      let badStatus = false;
      await fetch(url, options)
        .then(res => {
          if(res.status == 401)
          {
            badStatus = true;
          }
        })
        //.then(res => res.json())
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
          setrefreshAttempt(0);
        }
    }
  }
  /********************************************
   * End of addToQueue
  ********************************************/

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
        setQueueAccessToken(result.access_token);
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }
  /********************************************
  * End of refresh Queue Access Token
  *********************************************/

  /****************************************************************************
  * Artist Name
  * This function grabs the artist name(s) and prepares it before sending it 
  * to get it displayed.
  ****************************************************************************/
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

  /****************************************************************************
  * This is the function to run the other functions when a song is clicked. 
  ****************************************************************************/
  const onClicked = async (song) => {
    await addToQueue(song.id);
  }

  /****************************************************************************
  * Below is the code that is returned to the user. The UI.
  ****************************************************************************/
  if(queueAccessToken === "" && queueRefreshToken === "")
  {
    return (
      <div id='joinPage'>
        <div className='codeInput'>
            <img className='image' src={logo} />
          
            {/* Text input */}
            <input
            className='codeTextBox'
              type="text"
              value={code}
              onChange={handleInputChange}
              placeholder="Enter Host Code..."
            />
            {/* Button */}
            <button id='searchButton' onClick={getHost}>Submit</button>
          
        </div>
      </div>
    )
  }
  else
  {
    return (
      <div className="App">
        <Container>
          <InputGroup size="lg">
            <FormControl className='songSearch'
            placeholder='Search For Songs'
            type="input"
            onKeyPress={event => {
              if (event.key === "Enter") {
                search();
              }
            }}
            onChange={event => setSearchInput(event.target.value)}
            />
            <Button onClick={event => {
              search();
            }} id='searchButton'>
              Search
            </Button>
          </InputGroup>
        </Container>
        <Container>
          <Row className='mx-2 row row-cols-4'>
            {top10Tracks.map( (song, i) => {
              return (
                <Card className='songCard' onClick={() => onClicked(song)} style={{ cursor: "pointer" }}>
                  <Card.Img className='songCardImage' src={song.album.images[0].url} />
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
}

export default Join