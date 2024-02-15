import React, { useState } from 'react'
import { getDoc, collection , doc } from 'firebase/firestore'
import {db} from "../firebase-config"

function Join() {
    const codesCollectionRef = collection(db, "code");
    // const codeRef = doc(db, "code", "AEO");
    const [code, setCode] = useState("");

    const getPosts = async () => {
      try
      {
        const codeRef = doc(db, "code", code);
      const data = await getDoc(codeRef);
      let val = data.data();
      console.log(val.postText);
      }
      catch(err)
      {
        console.log(err.message);
      }
    }

  return (
    <div>
      <h1>Create A Post</h1>
      <div className='cpContainer'>
          <div className='inputGp'>
          <label> Code: </label>
          <input placeholder="Code..." 
          onChange={(event) => {
              setCode(event.target.value);
          }}></input>
          </div>
          <button onClick={getPosts}> Submit Code </button>
        </div>
    </div>
  )
}

export default Join