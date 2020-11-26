import React, { useState } from "react";
import { Dimensions, View } from "react-native";
import { TextField, IconButton } from "@material-ui/core";
import ArrowForward from "@material-ui/icons/ArrowForward";
import { useHistory } from "react-router-dom";
import firebase from "../config";

const { width, height } = Dimensions.get("window");

export default function Home() {
  const history = useHistory();

  const [profileId, setProfileId] = useState("");

  const visitCreator = () => {
    firebase.database().ref(`/${profileId}`).update({
      online: true,
    });
    history.push(`/${profileId}`);
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
    </View>
  );
}
