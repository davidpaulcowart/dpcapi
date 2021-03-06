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

const checkScopes = jwtAuthz(['access:orderonline']);

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
});

app.get('/api/getmenu', checkJwt, checkScopes, function (req, res) {
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
});

app.use(function (err, req, res, next) {
    console.error(err.stack);
    return res.status(err.status).json({ message: err.message });
});

app.listen(3010);
console.log('Listening on http://localhost:3010');
