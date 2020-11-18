import React, { useEffect, useState } from "react";
import firebase from "../config";
import { useParams } from "react-router-dom";
import { TextField, Button } from "@material-ui/core";
import { Dimensions, View } from "react-native";
import YoutubeLiveView from "./YoutubeLiveView";

const { width, height } = Dimensions.get("window");

export default function CreatorView() {
  const { creatorId } = useParams();

  const [creator, setCreator] = useState({});
  const [creatorVideo, setCreatorVideo] = useState("");
  const [timeNow, setTimeNow] = useState("");
  const [live, setLive] = useState(false);

  const fetchUser = async () => {
    await firebase
      .database()
      .ref(`/${creatorId}`)
      .on("value", (snap) => {
        if (snap.val() && snap.val().online === true) {
          setCreator(snap.val());
          console.log(snap.val());
        }
      });
  };
  useEffect(() => {
    fetchUser();
  }, []);

  const hostLiveCreation = () => {
    setTimeNow(Date.now());
  };

  useEffect(() => {
    if (timeNow) {
      // firebase
      //   .database()
      //   .ref(`/${creatorId}/timeline`)
      //   .update({ [timeNow]: creatorVideo });
      firebase
        .database()
        .ref(`/${creatorId}`)
        .update({ being: creatorVideo, watching: creatorVideo });
      // firebase
      //   .database()
      //   .ref(`/Creations/${timeNow}`)
      //   .update({ [creatorId]: creatorVideo });
      setLive(true);
    }
  }, [timeNow]);

  return live ? (
    <YoutubeLiveView videoId={creatorVideo} creatorId={creatorId} />
  ) : (
    <View
      style={{
        height: height,
        width: width,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <h3>Enter your video id from youtube for starting live creation.</h3>
      <TextField
        variant="outlined"
        placeholder="Enter VideoId"
        size="small"
        value={creatorVideo}
        onChange={(e) => setCreatorVideo(e.target.value)}
      />
      <Button
        variant="contained"
        style={{ backgroundColor: "#000", color: "#fff", marginTop: 10 }}
        onClick={hostLiveCreation}
      >
        Host Live Creation
      </Button>
    </View>
  );
}
