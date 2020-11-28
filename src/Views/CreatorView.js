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
  const [channelId, setChannelId] = useState("");
  const [timeNow, setTimeNow] = useState("");
  const [live, setLive] = useState(false);
  const [channelExist, setChannelExist] = useState(false);
  const [loading, setLoading] = useState(false);

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

  const hostLiveCreation = async () => {
    setTimeNow(Date.now());
  };

  useEffect(() => {
    setLoading(true);
    firebase
      .database()
      .ref(`/${creatorId}/channelId`)
      .on("value", (snap) => {
        if (snap.val()) {
          setChannelExist(true);
          setLive(true);
          setLoading(false);
          setChannelId(snap.val());
        } else {
          setLoading(false);
        }
      });
  });

  useEffect(() => {
    if (timeNow) {
      // firebase
      //   .database()
      //   .ref(`/${creatorId}/timeline`)
      //   .update({ [timeNow]: channelId });
      firebase.database().ref(`/${creatorId}`).update({
        channelId: channelId,
      });
      // firebase
      //   .database()
      //   .ref(`/Creations/${timeNow}`)
      //   .update({ [creatorId]: channelId });
      setLive(true);
    }
  }, [timeNow]);

  return live && channelExist ? (
    <YoutubeLiveView channelId={channelId} creatorId={creatorId} />
  ) : !channelExist && !loading ? (
    <View
      style={{
        height: height,
        width: width,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <h3>Enter your Youtube Channel Id</h3>
      <TextField
        variant="outlined"
        placeholder="Enter Channel Id"
        size="small"
        value={channelId}
        onChange={(e) => setChannelId(e.target.value)}
      />
      <Button
        variant="contained"
        style={{ backgroundColor: "#000", color: "#fff", marginTop: 10 }}
        onClick={hostLiveCreation}
      >
        Host Live Creation
      </Button>
    </View>
  ) : loading ? (
    <h2>LOADING....</h2>
  ) : null;
}
