if (!process.env.GITHUB_CLIENT_ID) {
  require('dotenv').config({
    path: require('path').join(__dirname, '../.env')
  })
}

const express = require('express')
const cors = require('cors')
const passport = require('passport')
require("./config/passport.config");
const authRoutes = require('./routes/auth.route')
const session = require('express-session')

const path = require("path");

const githubRoutes = require('./routes/github.route')

const internshipRoutes = require('./routes/internship.route')

const recommendateRoutes = require('./routes/recommendation.route')

const dashboardRoutes = require('./routes/dashboard.route')

const applicationRoutes = require('./routes/application.route')

const app = express()

app.use(cors({
  origin: process.env.CLIENT_REDIRECT_URL || 'http://localhost:5173',
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, '../dist')));

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: true,
    })
);

app.use(passport.initialize());
app.use(passport.session());

app.use('/api/auth', authRoutes)
app.use('/api/github', githubRoutes)
app.use('/api/internships', internshipRoutes)

app.use('/api/recommendations', recommendateRoutes)

app.use('/api/dashboard', dashboardRoutes)

app.use('/api/applications', applicationRoutes)

app.get("*name", (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

module.exports = app
