import React, { useEffect, useState } from "react";
import { View, Dimensions } from "react-native";
import YouTube from "react-player";
import {
  useSwipeable,
  Swipeable,
  LEFT,
  RIGHT,
  UP,
  DOWN,
} from "react-swipeable";
import { TextField, Button } from "@material-ui/core";
import firebase from "../config";
import { useHistory } from "react-router-dom";
import { useParams } from "react-router-dom";

const { width, height } = Dimensions.get("window");

export default function YoutubeLiveView(props) {
  const history = useHistory();
  const { creatorId } = useParams();

  const [joinAnother, setJoinAnother] = useState(false);
  const [anotherCreatorId, setAnotherCreatorId] = useState("");
  const [videoId, setVideoId] = useState(props.videoId);
  const [selfVid, setSelfVid] = useState(props.videoId);
  const [expression, setExpression] = useState(false);
  const [videoIndex, setVideoIndex] = useState(0);
  const [userVideos, setUserVideos] = useState([]);
  function onSwiping({ dir }) {
    if (dir == UP) {
      setJoinAnother(false);
    } else if (dir == DOWN) {
      setJoinAnother(true);
    } else if (dir == LEFT) {
      if (!expression) setExpression(true);
      else setVideoIndex(videoIndex + 1);
    } else if (dir == RIGHT) {
      if (videoIndex === 0) setExpression(false);
      else setVideoIndex(videoIndex - 1);
    }
  }

  useEffect(() => {
    firebase
      .database()
      .ref("/")
      .orderByChild("space")
      .equalTo(creatorId)
      .on("value", (snap) => {
        console.log("FILTER");
        let list = Object.values(snap.val());
        let allVid = list.map((user) => {
          return user.being;
        });
        console.log(
          list.map((user) => {
            return user.being;
          })
        );
        console.log(allVid);
        setUserVideos(allVid);
      });
  }, []);

  const joinStream = async () => {
    await firebase
      .database()
      .ref(`/${anotherCreatorId}/timeline`)
      .on("value", (snap) => {
        setVideoId(Object.values(snap.val()));
      });
    await firebase
      .database()
      .ref(`/${creatorId}`)
      .update({ space: anotherCreatorId });
    history.push(`/${anotherCreatorId}`);
    setJoinAnother(!joinAnother);
  };

  return (
    <Swipeable
      onSwiped={(eventData) => onSwiping(eventData)}
      preventDefaultTouchmoveEvent={true}
      trackMouse={true}
      className="swiping"
      style={{ height: "100%", overflow: "hidden" }}
    >
      {joinAnother ? (
        <View
          style={{
            height: height,
            width: width,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <TextField
            variant="outlined"
            placeholder="Enter Creator User Id"
            size="small"
            value={anotherCreatorId}
            onChange={(e) => setAnotherCreatorId(e.target.value)}
          />
          <Button
            variant="contained"
            style={{ backgroundColor: "#000", color: "#fff", marginTop: 10 }}
            onClick={joinStream}
          >
            Join Stream
          </Button>
        </View>
      ) : expression && userVideos.length > 0 ? (
        <View
          style={{
            height: height,
            width: width,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {videoId === selfVid ? (
            <YouTube
              height={height}
              width={width}
              playing={true}
              // videoId={videoId}
              url={"https://www.youtube.com/watch?v=" + userVideos[videoIndex]}
            />
          ) : (
            <YouTube
              height={height}
              width={width}
              playing={true}
              // videoId={videoId}
              url={"https://www.youtube.com/watch?v=" + videoId}
            />
          )}

          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              background: "black",
              opacity: 0.1,
              height: "100%",
              width: "100%",
            }}
          ></View>
        </View>
      ) : (
        <View
          style={{
            height: height,
            width: width,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <YouTube
            height={height}
            width={width}
            playing={true}
            // videoId={videoId}
            url={"https://www.youtube.com/watch?v=" + selfVid}
          />
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              background: "black",
              opacity: 0.1,
              height: "100%",
              width: "100%",
            }}
          ></View>
        </View>
      )}
    </Swipeable>
  );
}
