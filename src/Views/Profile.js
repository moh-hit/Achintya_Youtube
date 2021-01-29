import React, { useEffect, useState } from "react";
import { View, Dimensions } from "react-native";
import { TextField, IconButton } from "@material-ui/core";
import {
  AccessTime,
  AccountBalanceWalletTwoTone,
  Add,
  AddCircleOutlined,
  ArrowForwardRounded,
  BurstMode,
} from "@material-ui/icons";
import { makeStyles } from "@material-ui/core/styles";
import firebase from "firebase";
import { useParams } from "react-router-dom";
import Skeleton from "@material-ui/lab/Skeleton";
import swal from "sweetalert";
import Popper from "@material-ui/core/Popper";
import Fade from "@material-ui/core/Fade";
import { Fab, Action } from "react-tiny-fab";
import "react-tiny-fab/dist/styles.css";
import { useHistory } from "react-router-dom";

const useStyles = makeStyles((theme) => ({
  root: {
    "& > *": {
      margin: theme.spacing(2),
    },
  },
  paper: {
    border: "1px solid",
    padding: theme.spacing(1),
    backgroundColor: theme.palette.background.paper,
  },
}));

const { width, height } = Dimensions.get("window");

export default function Profile() {
  const classes = useStyles();
  const history = useHistory();
  const { creatorId } = useParams();
  const [likedCollection, setLikedCollection] = useState([]);
  const [loadLC, setLoadLC] = useState(false);
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(false);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [amount, setAmount] = useState("");

  const openPopper = (event) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };

  const open = Boolean(anchorEl);
  const id = open ? "transitions-popper" : undefined;

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

  const openCheckout = async (amountToBeAdded) => {
    let options = {
      key: "rzp_live_1hWjIFVX8QIpW8",
      amount: amountToBeAdded * 100,
      name: "Achintya",
      currency: "INR",
      description: `Add Coins to Wallet.`,
      image: "./favicon.png",
      handler: async function (response) {
        console.log(response);
        if (response.razorpay_payment_id) {
          await firebase
            .firestore()
            .collection("transactions")
            .doc(response.razorpay_payment_id)
            .set({
              paymentId: response.razorpay_payment_id,
              claimedAmount: 1,
            })
            .then(() => {
              firebase
                .firestore()
                .collection("transactions")
                .doc(response.razorpay_payment_id)
                .onSnapshot(async function (doc) {
                  if (doc.data()) {
                    if (
                      doc.data().paidAmount === parseInt(amountToBeAdded) &&
                      doc.data().status === 1
                    ) {
                      console.log(doc.data().paidAmount);
                      await firebase
                        .database()
                        .ref(`${creatorId}`)
                        .update({
                          balance: firebase.database.ServerValue.increment(
                            doc.data().paidAmount
                          ),
                        })
                        .then(() => {
                          swal({
                            title:
                              "Transaction Successful for INR " +
                              amountToBeAdded,
                            text:
                              "Congatulations! You got your space on Achintya. You can save your Transaction ID - " +
                              response.razorpay_payment_id.replace("pay_", ""),
                            icon: "success",
                            button: "Okay!",
                            buttonColor: "#000",
                          });
                        });
                    } else {
                      setLoading(true);
                      console.log("WRONG CONDITION");
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
        email: user.email,
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
            <IconButton
              color="primary"
              style={{ padding: 0 }}
              onClick={openPopper}
            >
              <AddCircleOutlined style={{ fontSize: 25 }} />
            </IconButton>
          </h1>
          <Popper
            id={id}
            open={open}
            placement="bottom"
            anchorEl={anchorEl}
            transition
          >
            {({ TransitionProps }) => (
              <Fade {...TransitionProps} timeout={350}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <TextField
                    placeholder="Enter amount"
                    size="small"
                    style={{ width: 100 }}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                  <IconButton
                    color="primary"
                    onClick={() =>
                      amount > 0
                        ? openCheckout(amount)
                        : alert("ENTER A VALID AMOUNT.")
                    }
                  >
                    <ArrowForwardRounded />
                  </IconButton>
                </View>
              </Fade>
            )}
          </Popper>
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
          : likedCollection &&
            likedCollection.sort().map((creation) => (
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

      <Fab icon={<Add style={{fontSize: 35}} />} alwaysShowTitle={false}>
        <Action text="Add a Status">
          <AccessTime style={{fontSize: 25}} />
        </Action>
        <Action text="List a Creation" onClick={() => history.push(`/createStatus/${creatorId}`)}>
          <BurstMode style={{fontSize: 25}} />
        </Action>
      </Fab>
    </div>
  );
}
