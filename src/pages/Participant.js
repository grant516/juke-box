import React, { useEffect, useState } from 'react'
import {setDoc, collection, doc} from 'firebase/firestore'
import {db} from "../firebase-config"
import config from "../config.json";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, InputGroup, FormControl, Button, Row, Card } from 'react-bootstrap';

const Participant = () => {

//   /********************************************
//   * Beginning of refresh Queue Access Token
//   *********************************************/
//     async function refreshQueueAccessToken(){
//       // refresh token that has been previously stored
//       const refreshToken = queueRefreshToken;
//       const url = "https://accounts.spotify.com/api/token";
  
//       var authOptions = {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/x-www-form-urlencoded'
//         },
//         body: 'grant_type=refresh_token' + 
//         '&client_id=' + config.CLIENT_ID + 
//         '&client_secret=' + config.CLIENT_SECRET + 
//         '&refresh_token=' + refreshToken
//       }
  
//       const body = await fetch(url, authOptions)
//         .then(result => result.json())
//         .then(result => {
//           //console.log(result);
//           setQueueAccessToken(result.access_token);
//         })
//         .catch(error => {
//           console.error('Error:', error);
//         });
//     }
//     /********************************************
//     * End of refresh Queue Access Token
//     *********************************************/

//   /****************************************************************************
//    * Start of addToQueue
//    * This function is responsible for adding songs to the spotify queue.
//   ****************************************************************************/
//   async function addToQueue(songId) {
//     if(queueAccessToken.length > 0)
//     {
//       let options = {
//         method: 'POST',
//         headers: {
//           Authorization: `Bearer ${queueAccessToken}`
//         }
//       };

//       let url = 'https://api.spotify.com/v1/me/player/queue?uri=spotify%3Atrack%3A'
//       + songId + '&device_id=' + config.DEVICE_ID_MY_COMP;

//       console.log(url);

//       let badStatus = false;
//       await fetch(url, options)
//         .then(res => {
//           if(res.status == 401)
//           {
//             badStatus = true;
//           }
//         })
//         .then(res => res.json())
//         .then(json => console.log(json + "This is where I'm at"))
//         .catch(err => console.error('error:' + err));

//         if(badStatus && refreshAttempt < config.TOTAL_REFRESH_ATTEMPTS)
//         {
//           await refreshQueueAccessToken();
//           // We want to avoid an infinite loop
//           await addToQueue(songId);
//           setrefreshAttempt(refreshAttempt + 1);
//         }
//         else if(!badStatus)
//         {
//           console.log("good status");
//           setrefreshAttempt(0);
//         }
//     }
//   }
//   /****************************************************************************
//    * End of addToQueue
//   ****************************************************************************/

// /* 
//   * Search
//   * This is where we perform the song search from the spotify API
//   * 
//   * TODO: This code will probably be moved into the guest section of the 
//   * app since they are the ones who need to perform the searching and 
//   * adding of the music.
//   */
// async function search() {

//   // Get request using search to get the Artist ID
//   var searchParameters = {
//     methods: 'GET',
//     headers: {
//       'Content-Type': 'application/json',
//       'Authorization': 'Bearer ' + accessToken
//     }
//   }

//   var returnedSongs = await fetch('https://api.spotify.com/v1/search?q=' +
//                       searchInput + '&type=track' + 
//                       '&market=US&limit=' + 
//                       config.TOTAL_DISPLAYED_SONGS, searchParameters)
//   .then(response => response.json())
//   .then(data => {

//     setTopTracks(data.tracks.items);
//   })
// }

// const onClicked = async (song) => {
//   await addToQueue(song.id);
// }

// /*
// * Artist Name
// * This function grabs the artist name(s) and prepares it before sending it 
// * to get it displayed.
// */
// const artistName = (song) => {
//   var songArtist = "";
//   song.artists.map( (artist, i) => { 
//     if(i > 0){
//       songArtist += ", ";
//     }
//     songArtist += artist.name;
//   })
//   return songArtist;
// }

  return (
    <View>
      <Text>Participant</Text>
    </View>
  )
}

export default Participant