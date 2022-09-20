require("dotenv").config();
const express = require("express");
const massive = require("massive");
const session = require("express-session");

const { SESSION_SECRET, SERVER_PORT, CONNECTION_STRING } = process.env;
const request = require("request");

const app = express();

const spotify_client_id = process.env.REACT_APP_CLIENT_ID;
const spotify_client_secret = process.env.REACT_APP_CLIENT_SECRET;
const backEndUrl = process.env.BACKEND_URL;
const frontEndUrl = process.env.FRONTEND_URL;


massive({
  connectionString: CONNECTION_STRING,
  ssl: { rejectUnauthorized: false },
})

app.use(
  session({
    resave: true,
    saveUninitialized: false,
    secret: SESSION_SECRET,
    cookie: { maxAge: 60000 * 60 * 24 * 90 }
  }));

app.use(express.json());

app.use(express.static(`${__dirname}/../build`))

var generateRandomString = function (length) {
  var text = "";
  var possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

app.post("/api/token", (req, res) => {
  var scope =
  "streaming \
  user-read-email \
  user-read-private";
  
  var state = generateRandomString(16);
  
  var auth_query_parameters = new URLSearchParams({
    response_type: "code",
    client_id: spotify_client_id,
    scope: scope,
    redirect_uri: `${backEndUrl}/auth/callback`,
    state: state,
    grant_type: authorization_code,
  });
  
  res.redirect(
    "https://accounts.spotify.com/authorize/?" +
    auth_query_parameters.toString()
    );
  });

  app.get('/', (req, res) => {
    res.json({
      hello: 'world'
    });
  })
  
  app.get("/auth/login", (req, res) => {
    var scope = "streaming \
    user-read-email \
    user-read-private";
  
    var state = generateRandomString(16);
  
    var auth_query_parameters = new URLSearchParams({
      response_type: "code",
      client_id: spotify_client_id,
      scope: scope,
      redirect_uri: `${backEndUrl}/auth/callback`,
      state: state,
    });
  
    res.redirect(
      "https://accounts.spotify.com/authorize/?" +
      auth_query_parameters.toString()
    );
  });

app.get("/auth/callback", (req, res) => {
  var code = req.query.code;

  var authOptions = {
    url: "https://accounts.spotify.com/api/token",
    form: {
      code: code,
      redirect_uri: `${backEndUrl}/auth/callback`,
      grant_type: "authorization_code",
    },
    headers: {
      Authorization:
        "Basic " +
        Buffer.from(spotify_client_id + ":" + spotify_client_secret).toString(
          "base64"
        ),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    json: true,
  };

  request.post(authOptions, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      req.session.token = body.access_token;
      res.redirect(`${frontEndUrl}/homepage`); 
    } else {
      console.log('An error occured requesting token from Spotify')
    }
  });
});

app.get('/auth/token', (req, res) => {
  if (req.session.token) {
    res.json(
      {
        access_token: req.session.token,
      })
  } else { res.sendStatus(403) }
});

const port = process.env.SERVER_PORT || 5000;

app.listen(port, () => console.log(`${port}`));