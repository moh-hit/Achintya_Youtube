import React, { useEffect, useState } from "react";
import { View, Dimensions } from "react-native";
import { TextField, Button, IconButton } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import firebase from "firebase";
import { useParams } from "react-router-dom";
import Snackbar from "@material-ui/core/Snackbar";
import MuiAlert from "@material-ui/lab/Alert";
import { useHistory } from "react-router-dom";
import { AddCircleOutline } from "@material-ui/icons";
import YouTube from "react-player";

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const useStyles = makeStyles((theme) => ({
  root: {
    "& > *": {
      margin: theme.spacing(2),
    },
  },
}));

const { width, height } = Dimensions.get("window");

export default function CreateStatus() {
  const classes = useStyles();
  const history = useHistory();
  const { creatorId } = useParams();
  const videoRef = React.createRef();

  const [open, setOpen] = React.useState(false);
  const [successType, setSuccessType] = React.useState("");
  const [creationIds, setCreationIds] = useState({});
  const [timeDelay, setTimeDelay] = useState(0);

  const handleClick = () => {
    setOpen(true);
  };

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpen(false);
  };

  const [videoId, setVideoId] = useState("");

  const addToCollection = async () => {
    await setSuccessType("Collections");
    await firebase
      .firestore()
      .collection("LikedCollection")
      .doc(`${creatorId}`)
      .get()
      .then((snap) => {
        if (snap.data() === undefined) {
          firebase
            .firestore()
            .collection("LikedCollection")
            .doc(`${creatorId}`)
            .set({ [Date.now()]: videoId })
            .then(() => {
              handleClick();
            });
        } else {
          firebase
            .firestore()
            .collection("LikedCollection")
            .doc(`${creatorId}`)
            .update({ [Date.now()]: videoId })
            .then(() => {
              handleClick();
            });
        }
      });

    await setVideoId("");
  };

  const addToStatus = async () => {
    await setSuccessType("Status");
    await firebase
      .database()
      .ref(`${creatorId}`)
      .update({ being: videoId })
      .then(() => {
        handleClick();
      });
    await setVideoId("");
  };

  const addIdToCreation = async () => {
    const live =
      "https://www.googleapis.com/youtube/v3/videos?part=snippet&id=" +
      videoId +
      "&key=AIzaSyDReEVZ4A6hTOvAK4HduYlt14Exm5iTR00";
    const response = await fetch(live);
    const data = await response.json();
    if (data.hasOwnProperty("pageInfo") && data.pageInfo.totalResults === 1) {
      if (data.items[0].kind === "youtube#video") {
        await setTimeDelay(timeDelay + videoRef.current.getDuration());
        await setCreationIds({ ...creationIds, [timeDelay]: videoId });
        await setVideoId("");
      }
    } else {
      alert("ENTER A VALID YT VIDEO ID");
    }
  };

  const finalizeCreation = async () => {
    await firebase
      .firestore()
      .collection("LikedCollection")
      .doc(`${creatorId}`)
      .get()
      .then((snap) => {
        if (snap.data() === undefined) {
          firebase
            .firestore()
            .collection("Creation")
            .doc(`${creatorId}`)
            .set({ [Date.now()]: creationIds });
        } else {
          firebase
            .firestore()
            .collection("Creation")
            .doc(`${creatorId}`)
            .update({ [Date.now()]: creationIds });
        }
      });
  };

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
      <h2 style={{ textAlign: "center" }}>Start to list your Creation here.</h2>
      <div
        className={[classes.root, "col-lg-2"]}
        style={{
          display: "flex",
          flexDirection: "row",
          width: width,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <TextField
          label="Enter Video Id"
          variant="outlined"
          size="small"
          placeholder="Video Id"
          value={videoId}
          onChange={(e) => setVideoId(e.target.value)}
        />
        <IconButton onClick={addIdToCreation}>
          <AddCircleOutline style={{ fontSize: 30 }} />
        </IconButton>
        <Button variant="outlined" color="secondary" onClick={finalizeCreation}>
          Finalize your Creation
        </Button>
      </div>

      <div className="col-lg-10 pt-4 row">
        {creationIds &&
          Object.values(creationIds).map((id) => (
            <div className="col-lg-3 col-md-4 col-sm-6 col-xs-12 mb-4">
              <a href={`/creation/${id}`}>
                <img
                  src={`https://img.youtube.com/vi/${id}/maxresdefault.jpg`}
                  height="170"
                  width="100%"
                />
              </a>
            </div>
          ))}
      </div>
      <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
        <Alert onClose={handleClose} severity="success">
          Successfully Added to {successType}.{" "}
          {/* <a href="" onClick={() => history.push(`/profile/${creatorId}`)}>
            Visit Collections
          </a> */}
        </Alert>
      </Snackbar>
      <YouTube
        ref={videoRef}
        url={"https://www.youtube.com/watch?v=" + videoId}
        style={{ display: "none", opacity: 0 }}
      />
    </View>
  );
}
