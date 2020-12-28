import React, { useEffect, useState } from "react";
import firebase from "../config";
import { useParams } from "react-router-dom";
import { TextField, Button, Card, CardContent, CardActions, makeStyles, Typography } from "@material-ui/core";
import { Dimensions, View } from "react-native";
import YoutubeLiveView from "./YoutubeLiveView";
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import firebaseapp from 'firebase';


const { width, height } = Dimensions.get("window");


const useStyles = makeStyles({
  root: {
    minWidth: 275,
  },
  t: {
    display: 'inline-block',
    margin: '0 2px',
    transform: 'scale(0.8)',
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
  const classes = useStyles();

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
    firebase.database().ref(`/${creatorId}/scheduled`).update({
      [scheduledDate]: videoId,
    })
    setVideoId("");
    handleClose();
  }

  const handleStartEventNow = async () => {
    firebase.database().ref(`/${creatorId}`).update({
      videoId: videoId,
    })
    handleClose();
    setLive(true)
  }

  useEffect(() => {
    if (timeNow) {
      // firebase
      //   .database()
      //   .ref(`/${creatorId}/timeline`)
      //   .update({ [timeNow]: videoId });
      firebase.database().ref(`/${creatorId}`).update({
        videoId: videoId,
      }).then(() => {
        setLive(true)
      })
      // firebase
      //   .database()
      //   .ref(`/Creations/${timeNow}`)
      //   .update({ [creatorId]: videoId });
    }
  }, [timeNow]);


  useEffect(() => {
    firebase.database().ref(`${creatorId}/scheduled`).on("value", snap => {
      console.log(snap.val());
      setScheduledEvents(snap.val())
    })
  }, [])

  return live ? (
    <YoutubeLiveView videoId={videoId} creatorId={creatorId} />
  ) : !loading ? (
    <View
      style={{
        height: height,
        width: width,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <View style={{
        flexDirection: "row",
        width: width,
        justifyContent: "space-evenly",
        alignItems: "center",
      }}>
        <Button style={{ fontSize: 30 }} color="primary" onClick={() => handleClickOpen(true)}>
          Create Event
      </Button>
        <Button style={{ fontSize: 30 }} color="secondary" onClick={() => handleClickOpen(false)}>
          Schedule Event
      </Button>
      </View>
      <View style={{
        flexDirection: "row",
        width: width,
        justifyContent: "space-evenly",
        alignItems: "center",
      }}>
        {scheduledEvents && Object.keys(scheduledEvents).map((key, index) => {
          let date = new Date(key * 1000).toLocaleString()
          return <Card className={classes.root} variant="outlined">
            <CardContent>
              <Typography className={classes.title} color="textSecondary" gutterBottom>
                {date}
              </Typography>
              <Typography variant="h5" component="h2">
                {scheduledEvents[key]}
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small">Learn More</Button>
            </CardActions>
          </Card>
        })}


      </View>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{liveModal ? "Create Event Now." : "Schedule Event."}</DialogTitle>
        <DialogContent style={{ display: "flex", flexDirection: "row" }}>
          <TextField
            label="Enter Video Id"
            variant="standard"
            placeholder="Video Id"
            value={videoId}
            onChange={(e) => setVideoId(e.target.value)}
          />
          {!liveModal &&
            <TextField
              id="datetime-local"
              label="Next appointment"
              type="datetime-local"
              // defaultValue={Date.now().toLocaleString()}
              onChange={e => setScheduledDate(firebaseapp.firestore.Timestamp.fromDate(new Date(e.target.value)).seconds)}
              InputLabelProps={{
                shrink: true,
              }}
            />}

        </DialogContent>
        <DialogActions>
          {liveModal ?
            <Button onClick={handleStartEventNow} color="primary" autoFocus>
              Start Now
          </Button> :
            <Button onClick={handleSubmitScheduleEvent} color="primary" autoFocus>
              Schedule
          </Button>}
        </DialogActions>
      </Dialog>
    </View>
  ) : loading ? (
    <h2>LOADING....</h2>
  ) : null;
}


{/* <h3 style={{ textTransform: "uppercase" }}>Enter the video id of your Scheduled Youtube live Event</h3>
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
</Button> */}