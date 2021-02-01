import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  TextField,
  Button,
  Card,
  CardContent,
  CardActions,
  makeStyles,
  IconButton,
} from "@material-ui/core";
import { Dimensions, View } from "react-native";
import YoutubeLiveView from "./YoutubeLiveView";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import firebase from "firebase";
import { useHistory } from "react-router-dom";
import { AccountCircleOutlined } from "@material-ui/icons";

const { width, height } = Dimensions.get("window");

const useStyles = makeStyles({
  root: {
    minWidth: 275,
  },
  t: {
    display: "inline-block",
    margin: "0 2px",
    transform: "scale(0.8)",
  },
  title: {
    fontSize: 14,
  },
  pos: {
    marginBottom: 12,
  },
});

export default function CreatorView() {
  const { creatorId } = useParams();
  const history = useHistory();

  const [creator, setCreator] = useState({});
  const [videoId, setVideoId] = useState("");
  const [timeNow, setTimeNow] = useState("");
  const [live, setLive] = useState(false);
  const [registeredVideoId, setRegisteredVideoId] = useState(false);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = React.useState(false);
  const [scheduledDate, setScheduledDate] = useState("");
  const [liveModal, setLiveModal] = useState(false);
  const [scheduledEvents, setScheduledEvents] = useState({});

  useEffect(() => {
    if (creatorId === "profile") {
      history.push(`/`);
    }
  }, []);

  const handleClickOpen = (modalType) => {
    setLiveModal(modalType);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const hostLiveCreation = async () => {
    setTimeNow(Date.now());
  };

  const handleSubmitScheduleEvent = async () => {
    firebase
      .database()
      .ref(`/${creatorId}/scheduled`)
      .update({
        [scheduledDate]: videoId,
      });
    setVideoId("");
    handleClose();
  };

  useEffect(() => {
    var gauthUid = firebase.auth().currentUser;
    firebase
      .database()
      .ref(`${loggedUser}/uid`)
      .on("value", (snap) => {
        if (snap.val() !== gauthUid) {
          setLive(true);
        } 
      });
  }, [creatorId]);

  const handleStartEventNow = async () => {
    firebase.database().ref(`/${creatorId}`).update({
      being: videoId,
    });
    handleClose();
    setLive(true);
  };
  const getCountDown = (sTime) => {
    return parseInt((sTime * 1000 - Date.now()) / 3600);
  };
  useEffect(() => {
    setInterval(() => {
      getCountDown();
    }, 1000);
  });
  useEffect(() => {
    if (timeNow) {
      // firebase
      //   .database()
      //   .ref(`/${creatorId}/timeline`)
      //   .update({ [timeNow]: videoId });
      firebase
        .database()
        .ref(`/${creatorId}`)
        .update({
          videoId: videoId,
        })
        .then(() => {
          setLive(true);
        });
      // firebase
      //   .database()
      //   .ref(`/Creations/${timeNow}`)
      //   .update({ [creatorId]: videoId });
    }
  }, [timeNow]);

  useEffect(() => {
    firebase
      .database()
      .ref(`${creatorId}/scheduled`)
      .on("value", (snap) => {
        console.log(snap.val());
        setScheduledEvents(snap.val());
      });
  }, []);
  var newDate = new Date();
  return live ? (
    <YoutubeLiveView creatorId={creatorId} />
  ) : !loading ? (
    <View
      style={{
        height: height,
        width: width,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div style={{position: "fixed", top: 16, right: 16}}>
      <IconButton onClick={() => history.push(`/profile/${creatorId}`)}>
        <AccountCircleOutlined style={{fontSize: 30}} />
      </IconButton>
      </div>
      <View
        style={{
          flexDirection: "row",
          width: width,
          justifyContent: "space-evenly",
          alignItems: "center",
        }}
      >
        <Button
          style={{ fontSize: 30 }}
          color="primary"
          onClick={() => handleClickOpen(true)}
        >
          Create Event
        </Button>
        <Button
          style={{ fontSize: 30 }}
          color="secondary"
          onClick={() => history.push(`/createStatus/${creatorId}`)}
        >
          Create Status
        </Button>
      </View>

      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Create Event Now.</DialogTitle>
        <DialogContent style={{ display: "flex", flexDirection: "row" }}>
          <TextField
            label="Enter Video Id"
            variant="standard"
            placeholder="Video Id"
            value={videoId}
            onChange={(e) => setVideoId(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleStartEventNow} color="primary" autoFocus>
            Start Now
          </Button>
        </DialogActions>
      </Dialog>
    </View>
  ) : loading ? (
    <h2>LOADING....</h2>
  ) : null;
}

{
  /* <h3 style={{ textTransform: "uppercase" }}>Enter the video id of your Scheduled Youtube live Event</h3>
<TextField
  variant="standard"
  placeholder="Enter Video Id"
  size="small"
  value={videoId}
  onChange={(e) => setVideoId(e.target.value)}
/>
<Button
  variant="contained"
  style={{ backgroundColor: "#000", color: "#fff", marginTop: 10 }}
  onClick={hostLiveCreation}
>
  Register For Event
</Button> */
}
