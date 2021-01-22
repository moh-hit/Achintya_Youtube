import React, { useEffect, useState } from "react";
import { View, Dimensions } from "react-native";
import { TextField, Button } from "@material-ui/core";
import { makeStyles } from '@material-ui/core/styles';
import firebase from 'firebase';
import { useParams } from "react-router-dom";

const useStyles = makeStyles((theme) => ({
  root: {
    '& > *': {
      margin: theme.spacing(2),
    },
  },
}));

const { width, height } = Dimensions.get("window");

export default function CreateStatus() {
    const classes = useStyles();
    const { creatorId } = useParams();

  const [videoId, setVideoId] = useState("");

  const addToCollection = async () => {
    firebase.firestore().collection("LikedCollection").doc(`${creatorId}`).update({[Date.now()]: videoId})
  }

  const addToStatus = async () => {
    firebase.database().ref(`${creatorId}`).update({being: videoId})
  }
 
  return (
    <View
      style={{
        flex: 1,
        width: width,
        height: height,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <h2 style={{ textAlign: "center" }}>
        Provide your youtube videoId in order to add it to your collection of
        timeline and library.
      </h2>
      <div className={classes.root} style={{display: "flex", flexDirection: "row",width: width, justifyContent: "center"}}>
      <TextField
        label="Enter Video Id"
        variant="outlined"
        size="small"
        placeholder="Video Id"
        value={videoId}
        onChange={(e) => setVideoId(e.target.value)}
      />
      <Button variant="outlined" color="primary" onClick={addToStatus}>
        ADD IT TO YOUR STATUS
      </Button>
      <Button variant="outlined" color="secondary" onClick={addToCollection}>
        ADD IT TO YOUR COLLECTION
      </Button>
      </div>
     
    </View>
  );
}
