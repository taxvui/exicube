var mercadopago = require("mercadopago");
var request = require("request");
const admin = require("firebase-admin");
const addToWallet = require("../../common").addToWallet;
const UpdateBooking = require("../../common/sharedFunctions").UpdateBooking;
const firebaseProjectId = require('../../config.json').firebaseProjectId;

module.exports.render_checkout = async function (request, response) {
    const config = (await admin.database().ref('payment_settings/mercadopago').once('value')).val();
    const public_key = config.public_key;
    const access_token = config.access_token;

    mercadopago.configure({
        access_token: access_token
    });

    const allowed = ["ARS", "BRL", "CLP", "COP", "MXN", "PEN", "UYU", "VEF"];

    const refr = request.get('Referrer');
    const platform = (request.body.platform || "mobile").toLowerCase();
    const server_url = refr ? ((refr.includes('bookings') || refr.includes('addbookings') || refr.includes('userwallet')) ? refr.substring(0, refr.length - refr.split("/")[refr.split("/").length - 1].length) : refr) : request.protocol + "://" + request.get('host') + "/";

    const preference = {
        items: [
            {
                id: request.body.order_id,
                title: request.body.product_name || 'Payment',
                description: `Order ${request.body.order_id}`,
                quantity: parseInt(request.body.quantity) || 1,
                currency_id: allowed.includes(request.body.currency) ? request.body.currency : 'BRL',
                unit_price: parseFloat(request.body.amount)
            }
        ],
        payer: {
            name: request.body.first_name,
            surname: request.body.last_name,
            email: request.body.email
        },
        back_urls: {
            // FIXED: The success URL should call your process endpoint
            "success": `${server_url}mercadopago-process?platform=${platform}`,
            "failure": platform === 'web'? `${server_url}cancel` : `${firebaseProjectId}://payment?mercadopago_status=cancel`,
            "pending": platform === 'web'? `${server_url}cancel` : `${firebaseProjectId}://payment?mercadopago_status=cancel`
        },
        auto_return: "approved",
        payment_methods: {
            installments: 1
        },
        statement_descriptor: firebaseProjectId,
        external_reference: request.body.order_id,
        binary_mode: true
    };

    try {
        const res = await mercadopago.preferences.create(preference);
        const checkoutURL = config.testing ? res.body.sandbox_init_point : res.body.init_point;

        // For web platform, redirect directly to checkout URL
        if (platform === 'web') {
            response.redirect(checkoutURL);
        } else {
            // For mobile platform, send JSON response
            response.json({
                url: checkoutURL,
                id: res.body.id,
                public_key: public_key,
                preference_id: res.body.id
            });
        }
    } catch (error) {
        console.error('MercadoPago error:', error);
        response.status(400).json({ error: 'Payment initialization failed' });
    }
};

// Process checkout handler
module.exports.process_checkout = async function (req, res) {
  const config = (await admin.database().ref('payment_settings/mercadopago').once('value')).val();
    const access_token = config.access_token;

    let platform = req.query.platform;

    var options = {
        'method': 'GET',
        'url': `https://api.mercadopago.com/v1/payments/${req.query.payment_id}`,
        'headers': {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': 'Bearer ' + access_token
        }
    };

    request(options, (error, response) => {
        if (error) {
            res.redirect(platform === 'web'? `/cancel` :`${firebaseProjectId}://payment?mercadopago_status=cancel`);
        } else {
            const json = JSON.parse(response.body);
            if (json.status === 'approved') {
                const order_id = json.additional_info.items[0].id;
                const transaction_id = json.id;
                const amount = json.transaction_amount;

                admin.database().ref('bookings').child(order_id).once('value', snapshot => {
                    if (snapshot.val()) {
                        const bookingData = snapshot.val();
                        UpdateBooking(bookingData, order_id, transaction_id, 'mercadopago');
                        res.redirect(platform !== 'web'? (`${firebaseProjectId}://booking/` + order_id) : `/success?order_id=${order_id}&amount=${amount}&transaction_id=${transaction_id}`);  
                    } else {
                        if (order_id.startsWith("wallet")) {
                            addToWallet(order_id.substr(7, order_id.length - 12), amount, order_id, transaction_id);
                            res.redirect(platform !== 'web'? `${firebaseProjectId}://wallet`: `/success?order_id=${order_id}&amount=${amount}&transaction_id=${transaction_id}`);                
                        } else {
                          res.redirect(platform === 'web'? `/cancel` :`${firebaseProjectId}://payment?mercadopago_status=cancel`);
                        }
                    }
                });
            } else {
              res.redirect(platform === 'web'? `/cancel` :`${firebaseProjectId}://payment?mercadopago_status=cancel`);
            }
        }
    });

};