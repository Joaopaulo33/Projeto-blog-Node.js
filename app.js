//Carregando módulos
const express = require('express');
const handlebars = require('express-handlebars');
const app = express();
const path = require("path");
const admin = require("./routes/admin");
const mongoose = require("mongoose");
const bodyParser = require('body-parser')
const session = require('express-session');
const flash = require("connect-flash")

//Configurações
    //Session
    app.use(session({
        secret: "cursodenode",
        resave: true,
        saveUninitialized: true
    }))

    app.use(flash())

    //Middleware
        app.use((req, res, next)=>{
            res.locals.success_msg = req.flash('success_msg')
            res.locals.error_msg = req.flash('error_msg')
            next();
        })

    //handlebars
const hbs = handlebars.create({
    defaultLayout: "main"
})
app.engine("handlebars", hbs.engine);
app.set("view engine", 'handlebars');

//bodyparse(no lugar dele)     
    app.use(bodyParser.urlencoded({extended: false}))
    app.use(bodyParser.json())  
// app.use(express.urlencoded({extended:false}));
// app.use(express.json());


//Mongoose
    //em breve
    mongoose.Promise = global.Promise;
    mongoose.connect("mongodb://127.0.0.1/blogapp",{
       // useMongoClient: true //disse que não é suportado
    }).then(()=>{
        console.log("Conectado ao mongo");
    }).catch((err) =>{
        console.log("Erro ao se conctar:",err);
    })

//Public
//Definindo que os arquivos estáticos vão ficar na pasta public
    app.use(express.static(path.join(__dirname,"public")));

//Rotas
    app.use('/admin', admin);  // O "/admin" vai ser um subcaminho(prefixo)

//Pra chamar as rotas



//Outros
const PORT = 8081;
app.listen(PORT, ()=> {
    console.log("Servidor rodando! ")
})