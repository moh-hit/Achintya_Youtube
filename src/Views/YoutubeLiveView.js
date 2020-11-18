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
import { TextField, Button, setRef } from "@material-ui/core";
import firebase from "../config";
import { useHistory } from "react-router-dom";
import { useParams } from "react-router-dom";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";
import GroupAddIcon from "@material-ui/icons/GroupAdd";
import { withStyles } from "@material-ui/core/styles";
import { yellow } from "@material-ui/core/colors";
import Snackbar from "@material-ui/core/Snackbar";
import MuiAlert from "@material-ui/lab/Alert";

const { width, height } = Dimensions.get("window");
const YellowSwitch = withStyles({
  switchBase: {
    color: yellow[300],
    "&$checked": {
      color: yellow[500],
    },
    "&$checked + $track": {
      backgroundColor: yellow[500],
    },
  },
  checked: {},
  track: {},
})(Switch);

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

export default function YoutubeLiveView(props) {
  const history = useHistory();
  const { creatorId } = useParams();

  const [loggedUser, setLoggedUser] = useState(props.creatorId);
  const [joinAnother, setJoinAnother] = useState(false);
  const [host, setHost] = useState(true);
  const [anotherCreatorId, setAnotherCreatorId] = useState("");
  const [videoId, setVideoId] = useState(props.videoId);
  const [selfVid, setSelfVid] = useState(props.videoId);
  const [userTurnVideo, setUserTurnVideo] = useState("");
  const [expression, setExpression] = useState(false);
  const [videoIndex, setVideoIndex] = useState(0);
  const [userVideos, setUserVideos] = useState([]);
  const [watchingOther, setWatchingOther] = useState(false);
  const [watchCreator, setWatchCreator] = useState(true);
  const [creatorReleaseTurn, setCreatorReleaseTurn] = useState(false);
  const [streamReq, setStreamReq] = useState(false);
  const [requester, setRequester] = useState("");

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
    if (watchingOther) {
      if (dir == RIGHT) {
        setWatchCreator(!watchCreator);
      } else if (dir == LEFT) {
        setWatchCreator(!watchCreator);
      }
    }
  }

  useEffect(() => {
    firebase
      .database()
      .ref("/")
      .orderByChild("space")
      .equalTo(creatorId)
      .on("value", (snap) => {
        if (snap.val()) {
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
        }
      });
    firebase.database().ref(`/${loggedUser}`).onDisconnect().remove();
  }, []);

  useEffect(() => {
    if (!host) {
      firebase
        .database()
        .ref(`/${anotherCreatorId}/turnOpen`)
        .on("value", (snapshot) => {
          setCreatorReleaseTurn(snapshot.val());
        });
    } else {
      firebase
        .database()
        .ref(`/${creatorId}/streamReq`)
        .on("value", (snapshot) => {
          setStreamReq(snapshot.val());
        });
      firebase
        .database()
        .ref(`/${creatorId}`)
        .on("value", (snapshot) => {
          setRequester(snapshot.val().requester);
        });
    }
  });

  const joinStream = async () => {
    await firebase
      .database()
      .ref(`/${anotherCreatorId}`)
      .on("value", (snap) => {
        console.log(snap.val());
        setVideoId(snap.val().being);
        setUserTurnVideo(snap.val().watching);
      });
    await firebase
      .database()
      .ref(`/${creatorId}`)
      .update({ space: anotherCreatorId });
    history.push(`/${anotherCreatorId}`);
    setHost(false);
    setWatchingOther(true);
    setJoinAnother(!joinAnother);
  };

  const handleCreatorTurnToggle = (event) => {
    setCreatorReleaseTurn(event.target.checked);
  };

  useEffect(() => {
    firebase
      .database()
      .ref(`/${creatorId}`)
      .update({ turnOpen: creatorReleaseTurn });
  }, [creatorReleaseTurn]);

  const handleReqClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setStreamReq(false);
  };

  const sendStreamRequest = () => {
    firebase
      .database()
      .ref(`/${anotherCreatorId}`)
      .update({ streamReq: true, requester: loggedUser });
  };

  const acceptTurnRequest = () => {
    firebase
      .database()
      .ref(`/${requester}/being`)
      .on("value", (snap) => {
        if (snap.val()) {
          firebase
            .database()
            .ref(`/${loggedUser}`)
            .update({ watching: snap.val(), streamReq: false });
        }
        setStreamReq(false);
      });
  };

  return (
    <>
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
        ) : !joinAnother && watchingOther ? (
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
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                opacity: watchCreator ? 1 : 0,
              }} // videoId={videoId}
              url={"https://www.youtube.com/watch?v=" + videoId}
            />
            {userTurnVideo && userTurnVideo !== videoId ? (
              <YouTube
                height={height}
                width={width}
                playing={true}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  opacity: watchCreator ? 0 : 1,
                }} // videoId={videoId}
                url={"https://www.youtube.com/watch?v=" + userTurnVideo}
              />
            ) : null}
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
      <View
        style={{
          position: "absolute",
          right: 20,
          bottom: 20,
          padding: 10,
          borderRadius: 12,
          backgroundColor: "rgba(255,255,255,0.1)",
        }}
      >
        {host ? (
          <FormControlLabel
            style={{ color: "#fff" }}
            control={
              <YellowSwitch
                checked={creatorReleaseTurn}
                onChange={handleCreatorTurnToggle}
                name="checkedB"
                color="primary"
              />
            }
            label={creatorReleaseTurn ? "Take Turn" : "Give Turn"}
          />
        ) : creatorReleaseTurn ? (
          <Button
            variant="contained"
            color="default"
            startIcon={<GroupAddIcon />}
            onClick={sendStreamRequest}
          >
            Send Turn Request
          </Button>
        ) : null}
      </View>
      {host ? (
        <Snackbar
          onClose={handleReqClose}
          open={streamReq && host}
          autoHideDuration={6000}
        >
          <Alert
            severity="info"
            style={{ backgroundColor: "#fff", color: "#000" }}
          >
            {requester} sent you a stream request.{" "}
            <Button
              style={{ color: "#1eb2a6", fontWeight: "bold" }}
              size="small"
              onClick={acceptTurnRequest}
            >
              Accept
            </Button>
            <Button
              style={{ color: "#fe346e", fontWeight: "bold" }}
              size="small"
              onClick={() => setStreamReq(false)}
            >
              Decline
            </Button>
          </Alert>
        </Snackbar>
      ) : null}
    </>
  );
}
