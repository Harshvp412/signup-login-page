if (process.env.NODE_ENV !=='production'){
    require('dotenv').config()
}

const express = require('express')
const app= express()
const path = require('path')
const bcrypt = require('bcrypt')
const passport= require('passport')
const flash = require('express-flash')
const session= require('express-session')
const methodOverride= require('method-override')

const initialization= require('./password-config')

initialization(
    passport,
    email => users.find(user =>user.email === email),
    id => users.find(user =>user.id === id)
    )

// static files
app.use(express.static(path.join(__dirname , 'public')));

// template engine

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended : false }));
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))
const users= [];

// getting login and register page

app.get('/login', checkNotAuthenticated,(req,res)=>{

    res.render('login')
});

app.get('/register',checkNotAuthenticated, (req,res)=>{

    res.render('signup')
});

app.get('/home', checkAuthenticated, (req,res)=>{

    res.render('index.ejs',{name: req.user.name})
})

app.post('/login',checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/home',
    failureRedirect: '/login',
    failureFlash: true
}))

app.post('/register', checkNotAuthenticated, async (req, res)=>{
   console.log(req.body)
    try {
       const hashedPassword = await bcrypt.hash(req.body.password, 10)
       users.push({
           id : Date.now().toString(),
           name: req.body.name,
           email: req.body.email,
           password: hashedPassword
       })
       res.redirect('/login')
   } catch {
       res.redirect('/register')
   }
   })
app.delete('/logout', (req,res)=>{
    req.logOut()
    res.redirect('/login')

})
   function checkAuthenticated(req, res, next){
       if(req.isAuthenticated()){
           return next()
       }
       res.redirect('/login')
   }
   function checkNotAuthenticated(req, res, next){
    if(req.isAuthenticated()){
       return res.redirect('/home')
    }
    next()
}
  // setting up the server
app.listen(3000, ()=>{
    console.log('We are listening to port: 3000');
})