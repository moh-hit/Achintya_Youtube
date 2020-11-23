import React, { useEffect, useRef, useState } from "react";
import { TextInput, View, Dimensions } from "react-native";
import YouTube from "react-player";
import firebase from "../config";
import {
  useSwipeable,
  Swipeable,
  LEFT,
  RIGHT,
  UP,
  DOWN,
} from "react-swipeable";
import { useParams } from "react-router-dom";
import LocalAtmIcon from '@material-ui/icons/LocalAtm';
import { TextField, Button, setRef } from "@material-ui/core";

const { width, height } = Dimensions.get("window");

export default function CreationView() {
  const creationRef = useRef();
  const expressionRef = useRef();
  const { creationId } = useParams();

  const [videoId, setVideoId] = useState("");
  const [submit, setSubmit] = useState(false);
  const [creations, setCreations] = useState([]);
  const [creationIndex, setCreationIndex] = useState(0);
  const [expression, setExpression] = useState(false);
  const [currentCreationTime, setCurrentCreationTime] = useState(0);
  const [freeCreation, setFreeCreation] = useState([]);
  const [freeCreationOver, setFreeCreationOver] = useState(false);
  const [paidForCreation, setPaidForCreation] = useState(false);

  useEffect(() => {
    firebase
      .database()
      .ref("/Creations")
      .orderByChild("creationId")
      .equalTo(creationId)
      .on("value", function (snap) {
        let list = Object.values(snap.val());
        list.map((creation) => {
          return creation.free
            ? setFreeCreation((prev) => [...prev, creation])
            : setCreations((prev) => [...prev, creation]);
        });
        console.log("IN FIREBASE", list);
      });
  }, []);

  const sendingMoney = (razorpay_payment_id) => {
    console.log("payment successful", razorpay_payment_id);
    setPaidForCreation(true);
  };
  const openCheckout = (room_id) => {
    let options = {
      key: "rzp_live_Gp5B5KcVjDSZ98",
      amount: 1 * 100,
      name: "Achintya",
      description: "Purchase Description",
      image: "./favicon.png",
      handler: function (response) {
        sendingMoney(response.razorpay_payment_id);
      },
      prefill: {
        name: "",
        email: "",
      },
      notes: {
        address: "Hello World",
      },
      theme: {
        color: "#000000",
      },
    };

    let rzp = new window.Razorpay(options);
    rzp.open();
  };
  const submitVideoId = () => {
    console.log("SUBMITTED", videoId);

    firebase
      .database()
      .ref("/Creations")
      .orderByChild("creationId")
      .equalTo(creationId)
      .on("value", function (snap) {
        console.log("IN FIREBASE", snap.val());
      });
    setSubmit(true);
  };

  function onSwiping({ dir }) {
    if (expression) {
      if (dir == RIGHT) {
        setExpression(false);
      } else if (dir == UP) {
        setCreationIndex(creationIndex + 1);
      } else if (dir == DOWN) {
        setCreationIndex(creationIndex - 1);
      }
    } else {
      if (dir == LEFT) {
        setExpression(true);
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
        {freeCreation.length && !freeCreationOver && (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              height: height,
            }}
          >
            <div
              style={{
                position: "fixed",
                left: 0,
                top: 0,
                visibility: expression ? "hidden" : "visible",
              }}
            >
              <YouTube
                ref={creationRef}
                height={height}
                width={width}
                playing={true}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                }} // videoId={videoId}
                url={
                  "https://www.youtube.com/watch?v=" + freeCreation[0].hostId
                }
                onEnded={() => openCheckout()}
              />
            </div>

            <div
              style={{
                position: "fixed",
                left: 0,
                top: 0,
                visibility: expression ? "visible" : "hidden",
              }}
            >
              <YouTube
                ref={expressionRef}
                height={height}
                width={width}
                playing={true}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                }} // videoId={videoId}
                url={
                  "https://www.youtube.com/watch?v=" + freeCreation[0].guestId
                }
              />
            </div>

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
        {freeCreationOver && paidForCreation && (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              height: height,
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
              }} // videoId={videoId}
              url={"https://www.youtube.com/watch?v=rCoPr8UwRMc"}
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
        <Button
          variant="contained"
          color="default"
          startIcon={<LocalAtmIcon />}
          onClick={() => openCheckout()}
        >
          Donate
        </Button>
      </View>
    </>
  );
}