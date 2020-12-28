import React, { useState, useEffect } from "react";
import { Dimensions, View } from "react-native";
import { TextField, IconButton, Button } from "@material-ui/core";
import { ArrowForward, AccountCircle } from "@material-ui/icons";
import { useHistory } from "react-router-dom";
import firebase from "../config";
import firebaseapp from "firebase";
import { useSelector } from "react-redux";
import useActionDispatcher from "../Hooks/useActionDispatcher";
import { SET_KEYS_TRUE, UPDATE_USER_DATA } from "../Store/actions";

const { width, height } = Dimensions.get("window");

export default function Home() {
  const history = useHistory();
  const userData = useSelector((state) => state.globalUserData);
  const dispatchAction = useActionDispatcher();

  const [profileId, setProfileId] = useState("");

  useEffect(() => {
    const fetchLive = async () => {
      const live =
        "https://www.googleapis.com/youtube/v3/videos?part=snippet&id=UWn6AjvRRGU&key=AIzaSyDRpDTn-sFBq6be1b-8fZTdBWc3-1vwoLw";
      const response = await fetch(live);
      const data = await response.json();
      console.log(data);
    };
    // fetchLive();
  }, []);

  const visitCreator = () => {
    firebase.database().ref(`/${profileId}`).update({
      online: true,
    });
    history.push(`/${profileId}`);
  };

  const googleLogin = async () => {
    if (!firebase.auth().currentUser) {
      var provider = new firebaseapp.auth.GoogleAuthProvider();
      const googleLogin = firebase.auth().signInWithPopup(provider).then(function (result) {
        const token = result.credential.accessToken;
        const user = result.user;
        console.log(user)
        const userId = user['uid'];
        // firebase.database().ref(`/${userId}`).update({
        //   name: user['displayName'],
        //   email: user['email'],
        //   profilePic: user['photoURL'],
        // });
        dispatchAction(UPDATE_USER_DATA, {
          data: {
            user_id: userId,
          },
        });
        history.push(`/${userId}`)
      })
        .catch(function (error) {
          const errorcode = error.code;
          const errorMessage = error.message;
          const email = error.email;
          const credential = error.credential;
          console.log(errorMessage, errorcode);
        });
    }

    else {
      const displayName = firebase.auth().currentUser.displayName;
      const userID = firebase.auth().currentUser.uid;
      dispatchAction(UPDATE_USER_DATA, {
        data: {
          user_id: userID,
        },
      });
      history.push(`/${userID}`)
    }

  };



  return (
    <View
      style={{
        height: height,
        width: width,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <TextField
        variant="outlined"
        placeholder="Enter Profile Id"
        size="small"
        value={profileId}
        onChange={(e) => setProfileId(e.target.value)}
        onSubmit={visitCreator}
      />
      <IconButton onClick={visitCreator} aria-label="delete" size="small">
        <ArrowForward style={{ fontSize: 40, margin: 15, color: "black" }} />
      </IconButton>
      <Button startIcon={<AccountCircle style={{ fontSize: 40, color: "black" }} />} onClick={googleLogin} aria-label="delete" size="small">
        Login With Google
      </Button>
    </View>
  );
}
