const express = require("express");
const paypal = require("paypal-rest-sdk");

paypal.configure({
  mode: "sandbox", //sandbox or live
  client_id:
    "AXgKmTzUYtlaE-bbP389QVtQVf27OjCFiJWVVwPLOZgwEyfjbmGHBzqVs9b1wo-gMJoxrdpucRTVQGCF",
  client_secret:
    "EP-rfUXcqBTLR9R5LyhtAO4eS17fBzhyicafRRPclKoFZuPOCQKPRF4DCWLC46HI8f4rfRxlnEjljYfC",
});

const PORT = process.env.PORT || 3000;

const app = express();

app.get("/", (req, res) => res.sendFile(__dirname + "/index.html"));



 
app.post("/pay", (req, res) => {
const create_payment_json = {
    "intent": "sale",
    "payer": {
        "payment_method": "paypal"
    },
    "redirect_urls": {
      "return_url": "https://payment-paypal.herokuapp.com//success",
      "cancel_url": "https://payment-paypal.herokuapp.com//cancel"
    },
    "transactions": [{
        "item_list": {
            "items": [{
                "name": "Donation",
                "sku": "001",
                "price": "2.00",
                "currency": "USD",
                "quantity": 1
            }]
        },
        "amount": {
            "currency": "USD",
            "total": "2.00"
        },
        "description": "Supporting open source programming."
    }]
};

paypal.payment.create(create_payment_json, function (error, payment) {
    if (error) {
        throw error;
    } else {
        for(let i = 0; i < payment.links.length; i++){
          if(payment.links[i].rel === 'approval_url'){
            res.redirect(payment.links[i].href);
}
}
    }
});

});



app.get('/success', (req, res) => {
  const payerID = req.query.PayerID;
  const paymentID = req.query.paymentId;

  const execute_payment_json = {
    "payer_id": payerID,
    "transactions": [{
       "amount": {
          "currency": "USD",
          "total": "2.00"
}
}]
};

  paypal.payment.execute(paymentID, execute_payment_json, function (error, payment) {
    if (error) {
      console.log(error.response);
      throw error;
} else {
    console.log("Get Payment Response");
    console.log(JSON.stringify(payment));
    res.render('success');
}

});
});


app.get('/cancel', (req, res) => res.render('cancel'));

// Web Server
app.listen(PORT, () => console.log(`Server Started on ${PORT}`));
