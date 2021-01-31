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
import firebase from "firebase";
import { useHistory } from "react-router-dom";
import { useParams } from "react-router-dom";
import YoutubeComp from "../Components/YoutubeComp";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Slide,
  FormControlLabel,
  Switch,
  Snackbar,
} from "@material-ui/core";
import { GroupAdd, PersonAddDisabled, ExitToApp } from "@material-ui/icons";

import MuiAlert from "@material-ui/lab/Alert";
import { withStyles } from "@material-ui/core/styles";
import { yellow } from "@material-ui/core/colors";
import VideoRoom from "./VideoRoom";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="down" ref={ref} {...props} />;
});

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

const { width, height } = Dimensions.get("window");

export default function YoutubeLiveView(props) {
  const history = useHistory();
  const { creatorId } = useParams();

  const [loggedUser, setLoggedUser] = useState(props.creatorId);
  const [host, setHost] = useState(false);
  const [guest, setGuest] = useState(false);

  const [selfPresence, setSelfPresence] = useState("");
  const [secondaryPresence, setSecondaryPresence] = useState("");
  const [primaryPresence, setPrimaryPresence] = useState("");

  const [otherUsers, setOtherUsers] = useState(false);
  const [guestScreen, setGuestScreen] = useState(false);
  const [watchingOtherCreator, setWatchingOtherCreator] = useState(false);
  const [donationScreen, setDonationScreen] = useState(false);
  const [textScreen, setTextScreen] = useState(false);

  const [usersVideos, setUserVideos] = useState([]);
  const [currentUserVideosIndex, setCurrentUserVideosIndex] = useState(0);
  const [ytPublishTime, setYtPublishTime] = useState("");

  const [openJoinModal, setOpenJoinModal] = React.useState(false);
  const [anotherCreatorId, setAnotherCreatorId] = useState("");
  const [creatorReleaseTurn, setCreatorReleaseTurn] = useState(false);
  const [streamReq, setStreamReq] = useState(false);
  const [requester, setRequester] = useState("");

  const [showGroups, setShowGroups] = useState(false);
  const [groupsHost, setGroupsHost] = useState([]);
  const [groupIndex, setGroupIndex] = useState(0);
  const [groupHostVid, setGroupsHostVid] = useState("");
  const [videoCallScreen, setVideoCallScreen] = useState(false);
  const [youtubeScreen, setYoutubeScreen] = useState(false);

  const handleClickOpenJoinModal = () => {
    setOpenJoinModal(true);
  };

  const handleCloseJoinModal = () => {
    setOpenJoinModal(false);
  };

  useEffect(() => {
    firebase
      .database()
      .ref(`/${creatorId}/being`)
      .on("value", (snap) => {
        fetchVidFromChannel(snap.val());
      });
    return firebase
      .database()
      .ref("/")
      .onDisconnect(() => {
        onUnmount();
      });
  }, []);

  const onUnmount = async () => {
    history.push(`/${loggedUser}`);
    window.location.reload();
  };

  useEffect(() => {
    firebase
      .database()
      .ref("/")
      .on("child_changed", () => {
        firebase
          .database()
          .ref("/")
          .orderByChild("space")
          .equalTo(loggedUser)
          .on("value", (snap) => {
            if (snap.val()) {
              let list = Object.values(snap.val());
              let allVid = list.map((user) => {
                return user.being;
              });
              console.log(allVid);
              setUserVideos(allVid);
            }
          });

        // firebase
        //   .database()
        //   .ref("/")
        //   .orderByChild("space")
        //   .equalTo("selfGroup")
        //   .on("value", function (snapshot) {
        //     setGroupsHost(Object.keys(snapshot.val()));
        //   });
      });

    // firebase.database().ref(`/${loggedUser}`).onDisconnect().remove();
  });

  useEffect(() => {
    firebase
      .database()
      .ref(`/${groupsHost[groupIndex]}/data/being`)
      .on("value", (snap) => {
        setGroupsHostVid(snap.val());
      });
  }, [groupIndex, showGroups]);

  useEffect(() => {
    firebase
      .database()
      .ref(`/${creatorId}/data`)
      .update({ turnOpen: creatorReleaseTurn });
  }, [creatorReleaseTurn]);

  // useEffect(() => {
  //   if (guestScreen) {
  //     firebase
  //       .database()
  //       .ref(`/${loggedUser}`)
  //       .update({ watching: secondaryPresence });
  //   } else {
  //     firebase
  //       .database()
  //       .ref(`/${loggedUser}`)
  //       .update({ watching: primaryPresence ? primaryPresence : selfPresence });
  //   }
  // }, [guestScreen]);

  const handleReqClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setStreamReq(false);
  };

  const sendStreamRequest = () => {
    firebase
      .database()
      .ref(`/${anotherCreatorId}/data`)
      .update({ streamReq: true, requester: loggedUser });
  };

  const acceptTurnRequest = () => {
    firebase
      .database()
      .ref(`/${requester}/data/being`)
      .on("value", (snap) => {
        if (snap.val()) {
          firebase.database().ref(`/${loggedUser}/data`).update({
            watching: snap.val(),
            streamReq: false,
            turnOpen: false,
            guest: requester,
          });
        }
        setStreamReq(false);
      });
  };

  const leaveTurn = () => {
    firebase.database().ref(`/${anotherCreatorId}/data`).update({
      streamReq: false,
      requester: "",
      turnOpen: true,
      watching: primaryPresence,
    });
    firebase.database().ref(`/${loggedUser}/data`).update({ guest: "" });
  };

  const joinStream = async () => {
    await firebase
      .database()
      .ref(`/${anotherCreatorId}/data`)
      .on("value", (snap) => {
        console.log(snap.val());
        setPrimaryPresence(snap.val().watching);
        setSecondaryPresence(snap.val().being);
        firebase.database().ref(`/${loggedUser}/data`).update({
          space: anotherCreatorId,
          // creationId: primaryPresence,
          watching: snap.val().watching,
        });
        setWatchingOtherCreator(true);
      });

    handleCloseJoinModal();
    setHost(false);
    history.push(`/${anotherCreatorId}`);
  };

  const exitOthersStream = () => {
    onUnmount();
  };

  const handleCreatorTurnToggle = (event) => {
    setCreatorReleaseTurn(event.target.checked);
  };

  useEffect(() => {
    if (!host) {
      setYoutubeScreen(true);
      firebase
        .database()
        .ref(`/${anotherCreatorId}/data/turnOpen`)
        .on("value", (snapshot) => {
          setCreatorReleaseTurn(snapshot.val());
        });
      firebase
        .database()
        .ref(`/${anotherCreatorId}/data/guest`)
        .on("value", (snapshot) => {
          setGuest(snapshot.val());
        });
      if (guest === loggedUser) {
        firebase
          .database()
          .ref(`/${anotherCreatorId}/data/being`)
          .on("value", (snapshot) => {
            setPrimaryPresence(snapshot.val());
          });
      }
    } else {
      setVideoCallScreen(true);
      firebase
        .database()
        .ref(`/${creatorId}/data/streamReq`)
        .on("value", (snapshot) => {
          setStreamReq(snapshot.val());
        });

      firebase
        .database()
        .ref(`/${loggedUser}/data/guest`)
        .on("value", (snapshot) => {
          setGuest(snapshot.val());
        });
      firebase
        .database()
        .ref(`/${loggedUser}/data/watching`)
        .on("value", (snapshot) => {
          setPrimaryPresence(snapshot.val());
        });
      firebase
        .database()
        .ref(`/${loggedUser}/data/watching`)
        .on("child_changed", (snapshot) => {
          setPrimaryPresence(snapshot.val());
        });
      firebase
        .database()
        .ref(`/${creatorId}/data`)
        .on("value", (snapshot) => {
          setRequester(snapshot.val().requester);
        });
    }
  }, [firebase.database().ref(`/${creatorId}/data/turnOpen`)]);

  const fetchVidFromChannel = async (videoId) => {
    // const live =
    //   "https://www.googleapis.com/youtube/v3/search?order=date&part=snippet&channelId=" +
    //   channel +
    //   "&eventType=live&type=video&key=AIzaSyDRpDTn-sFBq6be1b-8fZTdBWc3-1vwoLw";
    const live =
      "https://www.googleapis.com/youtube/v3/videos?part=snippet&id=" +
      videoId +
      "&key=AIzaSyDReEVZ4A6hTOvAK4HduYlt14Exm5iTR00";
    const response = await fetch(live);
    const data = await response.json();
    console.log(data);
    if (data.items.length === 0) {
      alert("NO LIVE YET !!!");
    } else {
      console.log(videoId);
      var ytLiveStartTime = new Date(data.items[0].snippet.publishTime);
      setYtPublishTime(ytLiveStartTime.getTime());
      // alert(data.items[0].id.videoId);
      setSelfPresence(videoId);
      setPrimaryPresence(videoId);
      setHost(true);
      await firebase.database().ref(`/${loggedUser}/data`).update({
        being: videoId,
        watching: videoId,
        space: "self",
      });
      await firebase
        .database()
        .ref(`/${loggedUser}/timeline`)
        .update({
          [Date.now()]: videoId,
        });
    }
  };

  function onSwiping({ dir }) {
    if (dir === LEFT) {
      if (secondaryPresence) {
        setGuestScreen(true);
      } else if (!videoCallScreen) {
        setVideoCallScreen(true);
      } else if (!donationScreen) {
        setDonationScreen(true);
      } else if (!textScreen) {
        setTextScreen(true);
      }
    } else if (dir === RIGHT) {
      if (guestScreen) setGuestScreen(false);
      else if (textScreen) {
        setTextScreen(false);
      } else if (donationScreen) {
        setDonationScreen(false);
      } else if (videoCallScreen) {
        setVideoCallScreen(false);
      }
    } else if (dir === DOWN) {
      if (!showGroups) handleClickOpenJoinModal();
      if (showGroups && groupIndex > 0) {
        setGroupIndex(groupIndex - 1);
      } else if (showGroups && groupIndex === 0) {
        setShowGroups(false);
      }
    } else if (dir === UP) {
      if (!otherUsers && !showGroups) {
        setShowGroups(true);
      } else if (showGroups && groupIndex + 1 < groupsHost.length) {
        setGroupIndex(groupIndex + 1);
      }
    }
  }

  return (
    <>
      <Swipeable
        onSwiped={(eventData) => onSwiping(eventData)}
        preventDefaultTouchmoveEvent={true}
        trackMouse={true}
        className="swiping"
        style={{ height: "100%", overflow: "hidden" }}
      >
       
        {!host && youtubeScreen && (
          <>
            <View
              style={{
                height: height,
                width: width,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <YoutubeComp videoId={primaryPresence} opacity={1} />
              {/* <YoutubeComp
            videoId={host ? selfPresence : primaryPresence}
            opacity={guestScreen ? 0 : 1}
          /> */}
            </View>
            <View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                background: "black",
                opacity: 0.0,
                height: "100%",
                width: "100%",
              }}
            ></View>
          </>
        )}
         {((host && videoCallScreen) || (!host && guest === loggedUser)) && (
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              backgroundColor: "#fff",
              height: height,
              width: width,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <VideoRoom
              username={creatorId}
              spaceOwner={false}
              creator={false}
            />
          </View>
        )}
        {donationScreen && (
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              backgroundColor: "#fff",
              height: height,
              width: width,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Button>ENJOYING EVENT? DONATE TO CREATOR</Button>
          </View>
        )}
        {textScreen && (
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              backgroundColor: "#fff",
              height: height,
              width: width,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <h2>Text SCREEN WILL BE HERE</h2>
          </View>
        )}
      </Swipeable>

      <Dialog
        open={openJoinModal}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleCloseJoinModal}
        aria-labelledby="alert-dialog-slide-title"
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle id="alert-dialog-slide-title">
          {"Enter Another Creator's Id to Join their Stream."}
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Enter Creator User Id"
            size="small"
            style={{ width: "100%" }}
            value={anotherCreatorId}
            onChange={(e) => setAnotherCreatorId(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button variant="text" onClick={joinStream}>
            Join Stream
          </Button>
          {watchingOtherCreator && (
            <Button variant="text" onClick={joinStream}>
              Create Sub Group
            </Button>
          )}
        </DialogActions>
      </Dialog>
      {host && (
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
      )}
      <View
        style={{
          position: "absolute",
          right: 20,
          bottom: 20,
          padding: 10,
          borderRadius: 12,
          backgroundColor: "rgba(255,255,255,0.2)",
        }}
      >
        {watchingOtherCreator && !host && (
          <Button
            variant="contained"
            color="default"
            startIcon={<ExitToApp />}
            onClick={exitOthersStream}
          >
            Exit This Stream
          </Button>
        )}
        {host && selfPresence ? (
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
            color="primary"
            startIcon={<GroupAdd />}
            onClick={sendStreamRequest}
            style={{ color: "#fff" }}
          >
            Send Turn Request
          </Button>
        ) : (
          guest === loggedUser &&
          !host && (
            <Button
              variant="contained"
              color="secondary"
              startIcon={<PersonAddDisabled />}
              onClick={leaveTurn}
              style={{ color: "#fff" }}
            >
              Leave Turn
            </Button>
          )
        )}
      </View>
    </>
  );
}
