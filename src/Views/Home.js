import React, { useState, useEffect } from "react";
import { Dimensions, View } from "react-native";
import { TextField, IconButton, Button } from "@material-ui/core";
import { AccountCircleOutlined, AccountCircle } from "@material-ui/icons";
import { useHistory } from "react-router-dom";
// import { messaging, database, auth } from "../config";
import swal from "sweetalert";
import { messaging } from "../config";
import { useSelector } from "react-redux";
import useActionDispatcher from "../Hooks/useActionDispatcher";
import { SET_KEYS_TRUE, UPDATE_USER_DATA } from "../Store/actions";
import firebaseapp from "firebase";
import Loading from "../Components/Loading";
import { useParams } from "react-router-dom";

const { width, height } = Dimensions.get("window");

export default function Home() {
  const { creatorId } = useParams();
  const history = useHistory();
  const userData = useSelector((state) => state.globalUserData);
  const dispatchAction = useActionDispatcher();

  const [profileId, setProfileId] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (creatorId === "profile") {
      history.push(`/`);
    }
  }, []);

  useEffect(() => {
    messaging
      .requestPermission()
      .then(function () {
        console.log("permission granted");
        firebaseapp.database().ref(`/mohit`).update({
          online: true,
        });
        return messaging.getToken();
      })
      .then((token) => {
        firebaseapp.database().ref(`/mohit`).update({
          token: token,
        });
      });
    const fetchLive = async () => {
      const live =
        "https://www.googleapis.com/youtube/v3/videos?part=snippet&id=UWn6AjvRRGU&key=AIzaSyDRpDTn-sFBq6be1b-8fZTdBWc3-1vwoLw";
      const response = await fetch(live);
      const data = await response.json();
      console.log(data);
    };
    // fetchLive();
  }, []);

  const visitCreator = async () => {
    await messaging
      .requestPermission()
      .then(function () {
        console.log("permission granted");
        firebaseapp.database().ref(`/${profileId}`).update({
          online: true,
        });
        return messaging.getToken();
      })
      .then((token) => {
        firebaseapp.database().ref(`/${profileId}`).update({
          token: token,
        });
      });

    await history.push(`/${profileId}`);
  };

  const openCheckout = async (userDetails) => {
    console.log(userDetails);
    let options = {
      key: "rzp_live_1hWjIFVX8QIpW8",
      amount: 100,
      name: "Achintya",
      currency: "INR",
      description: `Space on Achintya`,
      image: "./favicon.png",
      handler: async function (response) {
        console.log(response);
        if (response.razorpay_payment_id) {
          await firebaseapp
            .firestore()
            .collection("transactions")
            .doc(response.razorpay_payment_id)
            .set({
              paymentId: response.razorpay_payment_id,
              claimedAmount: 1,
            })
            .then(() => {
              firebaseapp
                .firestore()
                .collection("transactions")
                .doc(response.razorpay_payment_id)
                .onSnapshot(async function (doc) {
                  if (doc.data()) {
                    if (
                      doc.data().paidAmount === 1 &&
                      doc.data().status === 1
                    ) {
                      console.log(userDetails);
                      await firebaseapp.database().ref(`/${profileId}`).update({
                        name: userDetails["displayName"],
                        email: userDetails["email"],
                        uid: userDetails["uid"],
                      });
                      await firebaseapp
                        .database()
                        .ref(`${profileId}`)
                        .update({
                          balance: doc.data().paidAmount,
                        })
                        .then(() => {
                          swal({
                            title:
                              "Transaction Successful for INR " + 100 / 100,
                            text:
                              "Congatulations! You got your space on Achintya. You can save your Transaction ID - " +
                              response.razorpay_payment_id.replace("pay_", ""),
                            icon: "success",
                            button: "Okay!",
                            buttonColor: "#000",
                          }).then(() => {
                            setLoading(false);
                            dispatchAction(UPDATE_USER_DATA, {
                              data: {
                                creator: true,
                                is_creator: true,
                                user_id: profileId,
                              },
                            });
                            messaging
                              .requestPermission()
                              .then(function () {
                                console.log("permission granted");
                                firebaseapp
                                  .database()
                                  .ref(`/${profileId}`)
                                  .update({
                                    online: true,
                                  });
                                return messaging.getToken();
                              })
                              .then((token) => {
                                firebaseapp
                                  .database()
                                  .ref(`/${profileId}`)
                                  .update({
                                    token: token,
                                  });
                              });
                            history.push(`/${profileId}`);
                          });
                        });
                    } else {
                      setLoading(true);
                      // history.push(`/`);
                    }
                  } else {
                    setLoading(true);
                  }
                });
            });
        }
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

  const googleLogin = async () => {
    firebaseapp
      .database()
      .ref(`${profileId}`)
      .once("value", (snap) => {
        if (!firebaseapp.auth().currentUser && !snap.val()) {
          var provider = new firebaseapp.auth.GoogleAuthProvider();
          firebaseapp
            .auth()
            .signInWithPopup(provider)
            .then(function (result) {
              const token = result.credential.accessToken;
              const user = result.user;
              console.log(user);
              openCheckout(user);
            })
            .catch(function (error) {
              const errorcode = error.code;
              const errorMessage = error.message;
              const email = error.email;
              const credential = error.credential;
              console.log(errorMessage, errorcode);
            });
        } else {
          var loggedInUser = firebaseapp.auth().currentUser;
          console.log(loggedInUser);
          firebaseapp
            .database()
            .ref(`${profileId}`)
            .once("value", (snap) => {
              if (snap.val()) {
                dispatchAction(UPDATE_USER_DATA, {
                  data: {
                    user_id: profileId,
                  },
                });
                history.push(`/${profileId}`);
              } else {
                openCheckout(loggedInUser);
              }
            });
        }
      });
  };

  return loading ? (
    <Loading />
  ) : (
    <View
      style={{
        height: height,
        width: "100%",
        // flexDirection: "row",
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
      {/* <IconButton onClick={visitCreator} aria-label="delete" size="small">
        <ArrowForward style={{ fontSize: 40, margin: 15, color: "black" }} />
      </IconButton> */}
      <Button
        variant="outlined"
        startIcon={<AccountCircle style={{ color: "black" }} />}
        color="primary"
        onClick={googleLogin}
        style={{ fontSize: 13, marginTop: 10 }}
        size="small"
      >
        Proceed With Google
      </Button>
    </View>
  );
}
