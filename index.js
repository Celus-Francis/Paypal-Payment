const express = require("express");
const paypal = require("paypal-rest-sdk");

paypal.configure({
  mode: "sandbox", //sandbox or live
  client_id:
    "Ae_ov3mf2njnswabSB2byvtaOWPV_9kT48_DamGjAy0H6PvJEnAol3ZAq_dvVtNFvkwzGCJ2qrCLwnpL",
  client_secret:
    "EN3adU7f5mea_riJhKVaNl-YafDwLBkhYIKi4LqHNTkTQaee12W1bxIrH1TPNg35vaPYEnF5dfDmqyvw",
});

const PORT = process.env.PORT || 3000;

const app = express();

app.get("/", (req, res) => res.sendFile(__dirname + "/index.html"));

app.post("/pay", (req, res) => {
  const create_payment_json = {
    intent: "sale",
    payer: {
      payment_method: "paypal",
    },
    "redirect_urls": {
      "return_url": "https://payment-paypal.herokuapp.com//success",
      "cancel_url": "https://payment-paypal.herokuapp.com//cancel"
  },
    transactions: [
      {
        item_list: {
          items: [
            {
              name: "Donation",
              sku: "001",
              currency: "USD",
            },
          ],
        },
        amount: {
          currency: "USD",
          total: "5.00",
        },
        description: "Donate for the best team ever",
      },
    ],
  };

  paypal.payment.create(create_payment_json, function (error, payment) {
    if (error) {
      throw error;
    } else {
      for (let i = 0; i < payment.links.length; i++) {
        if (payment.links[i].rel === "approval_url") {
          res.redirect(payment.links[i].href);
        }
      }
    }
  });
});

app.get("/success", (req, res) => {
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;

  const execute_payment_json = {
    payer_id: payerId,
    transactions: [
      {
        amount: {
          currency: "USD",
          total: "5.00",
        },
      },
    ],
  };

  paypal.payment.execute(paymentId, execute_payment_json, function (
    error,
    payment
  ) {
    if (error) {
      console.log(error.response);
      throw error;
    } else {
      console.log(JSON.stringify(payment));
      res.send("Success");
      res.send_email = "True";
    }
  });
});

app.get("/cancel", (req, res) => res.send("Cancelled"));

app.listen(PORT, () => console.log(`Server Started on ${PORT}`));