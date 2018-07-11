const express = require('express');
const app = express();
const jwt = require('express-jwt');
const jwtAuthz = require('express-jwt-authz');
const jwksRsa = require('jwks-rsa');
const cors = require('cors');
require('dotenv').config();

if (!process.env.AUTH0_DOMAIN || !process.env.AUTH0_AUDIENCE) {
    throw 'Make sure you have AUTH0_DOMAIN, and AUTH0_AUDIENCE in your .env file';
}

const corsOptions = {
    origin: 'http://localhost:3000'
};

app.use(cors(corsOptions));

const checkJwt = jwt({
    // Dynamically provide a signing key based on the kid in the header and the singing keys provided by the JWKS endpoint.
    secret: jwksRsa.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`
    }),

    // Validate the audience and the issuer.
    audience: process.env.AUTH0_AUDIENCE,
    issuer: `https://${process.env.AUTH0_DOMAIN}/`,
    algorithms: ['RS256']
});

const checkScopes = jwtAuthz(['read:users']);

app.get('/api/public', function (req, res) {
    res.json({
        message: 'Hello from a public endpoint! You don\'t need to be authenticated to see this.'
    });
});

app.get('/api/private', checkJwt, function (req, res) {
    res.json({
        message: 'Hello from a private endpoint! You need to be authenticated to see this.'
    });
});

app.get('/api/verifiedemail/:email', checkJwt, function (req, res) {

    res.json({
        "pizza": [
            {
                "name": "Pepperoni",
                "cost": "$10.99"
            }, {
                "name": "Supreme",
                "cost": "$12.99"
            }, {
                "name": "Cheese",
                "cost": "$9.99"
            }
        ]
    });

    //var request = require("request");
    //var appToken = "";

    ////console.log("Lets get our app token");
    //var tokenOptions = {
    //    method: 'POST',
    //    url: 'https://dpcowart.auth0.com/oauth/token',
    //    headers: { 'content-type': 'application/json' },
    //    body:
    //        {
    //            grant_type: 'client_credentials',
    //            client_id: process.env.AUTH0_APP_CLIENTID,
    //            client_secret: process.env.AUTH0_APP_SECRET,
    //            audience: 'https://dpcowart.auth0.com/api/v2/'
    //        },
    //    json: true
    //};

    //console.log("promise");
    //new Promise(function (resolve, reject) {
    //    request(tokenOptions, function (error, response, body) {
    //        if (error) {
    //            reject(error);
    //        }
    //        else {
    //            resolve(body);
    //        }
    //        //console.log("body check");
    //        //console.log(body.access_token);
    //        appToken = body.access_token;
    //    })
    //});
    //console.log("promise ended");
    //console.log(appToken);
    //console.log("Let's get email with our token");
    //var options = {
    //    method: 'GET',
    //    url: 'https://dpcowart.auth0.com/api/v2/users-by-email',
    //    qs: {
    //        fields: "email_verified",
    //        email: req.params.email
    //    },
    //    headers:
    //        {
    //            "content-type": "application/json; charset=utf-8",
    //            "cache-control": "private, no-store, no-cache, must-revalidate, post-check=0, pre-check=0",
    //            Authorization: "Bearer " + process.env.AUTH0_APP_TOKEN
    //        },
    //    form:
    //        {
    //            client_id: null,
    //            access_token: null,
    //            connection: null,
    //            scope: 'openid'
    //        }
    //};

    ////console.log(options);

    //request(options, function (error, response, body) {
    //    if (error) throw new Error(error);

    //    console.log("email body: " + body);
    //    console.log("status: " + response.statusCode);
    //    hasVerifiedEmail = JSON.parse(body);
    //    console.log("hasVerifiedEmail: " + hasVerifiedEmail[0].email_verified);

    //    if (hasVerifiedEmail[0].email_verified === true) {
    //        res.json({
    //            "pizza": [
    //                {
    //                    "name": "Pepperoni",
    //                    "cost": "$10.99"
    //                }, {
    //                    "name": "Supreme",
    //                    "cost": "$12.99"
    //                }, {
    //                    "name": "Cheese",
    //                    "cost": "$9.99"
    //                }
    //            ]
    //        });
    //    }
    //    else {
    //        res.json({
    //            message: 'unverified'
    //        });
    //    }

    //});
});

app.get('/api/private-scoped', checkJwt, checkScopes, function (req, res) {
    res.json({
        message: 'Hello from a private endpoint! You need to be authenticated and have a scope of read:messages to see this.'
    });
});

app.use(function (err, req, res, next) {
    console.error(err.stack);
    return res.status(err.status).json({ message: err.message });
});

app.listen(3010);
console.log('Listening on http://localhost:3010');
