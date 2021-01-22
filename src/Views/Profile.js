import React, { useEffect, useState } from "react";
import { View, Dimensions } from "react-native";
import { TextField, IconButton } from "@material-ui/core";
import {
  AccountBalanceWalletTwoTone,
  AddCircleOutlined,
} from "@material-ui/icons";
import { makeStyles } from "@material-ui/core/styles";
import firebase from "firebase";
import { useParams } from "react-router-dom";
import Skeleton from "@material-ui/lab/Skeleton";

const useStyles = makeStyles((theme) => ({
  root: {
    "& > *": {
      margin: theme.spacing(2),
    },
  },
}));

const { width, height } = Dimensions.get("window");

export default function Profile() {
  const classes = useStyles();
  const { creatorId } = useParams();
  const [likedCollection, setLikedCollection] = useState([]);
  const [loadLC, setLoadLC] = useState(false);
  const [user, setUser] = useState({});
  useEffect(() => {
    const fetchLikedCollection = async () => {
      await setLoadLC(true);
      await firebase
        .firestore()
        .collection("LikedCollection")
        .doc(`${creatorId}`)
        .get()
        .then((snap) => setLikedCollection(Object.values(snap.data())));
      await setLoadLC(false);
    };

    const fetchUser = async () => {
      await firebase
        .database()
        .ref(`${creatorId}`)
        .on("value", (snap) => {
          console.log(snap.val());
          setUser(snap.val());
        });
    };

    fetchLikedCollection();
    fetchUser();
  }, []);

  useEffect(() => {}, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        padding: 16,
        justifyContent: "flex-start",
        alignItems: "flex-start",
      }}
    >
      <div className="d-flex col-lg-12 row justify-content-around pb-5">
        <h1 style={{ textTransform: "uppercase", textAlign: "center" }}>
          {creatorId}
        </h1>
        <>
          <h1
            style={{
              textTransform: "uppercase",
              textAlign: "center",
              verticalAlign: "middle",
            }}
          >
            <AccountBalanceWalletTwoTone style={{ fontSize: 35 }} />{" "}
            {user.balance}{" "}
            <IconButton color="primary" style={{ padding: 0 }}>
              <AddCircleOutlined style={{ fontSize: 25 }} />
            </IconButton>
          </h1>
        </>
      </div>
      <div className="col-lg-12 row">
        {loadLC
          ? [...Array(12)].map((e, i) => (
              <div
                key={i}
                className="col-lg-3 col-md-4 col-sm-6 col-xs-12 mb-4"
              >
                <Skeleton variant="rect" width="100%" height={200} />
              </div>
            ))
          : likedCollection.sort().map((creation) => (
              <div className="col-lg-3 col-md-4 col-sm-6 col-xs-12 mb-4">
                <a href={`/creation/${creation}`}>
                  <img
                    src={`https://img.youtube.com/vi/${creation}/maxresdefault.jpg`}
                    height="200"
                    width="100%"
                  />
                </a>
              </div>
            ))}
      </div>
    </div>
  );
}
