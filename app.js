//Carregando módulos
const express = require('express');
const handlebars = require('express-handlebars');
const app = express();
const path = require("path");
const admin = require("./routes/admin");
const usuarios = require("./routes/usuario")
const mongoose = require("mongoose");
const bodyParser = require('body-parser')
const session = require('express-session');
const flash = require("connect-flash");
const req = require('express/lib/request');
const res = require('express/lib/response');
const {
    redirect
} = require('express/lib/response');
require("./models/Postagem")
const Postagem = mongoose.model("postagens")
require("./models/Categoria")
const Categoria = mongoose.model("categorias")
require("./models/Usuario")
const passport = require('passport');
const Usuario = mongoose.model("usuarios")
require("./config/auth")(passport)

//Configurações

//Sessions

app.use(session({
    secret: "cursodenode",
    resave: true,
    saveUninitialized: true
}))
    app.use(passport.initialize())
    app.use(passport.session())
    app.use(flash())

//Middleware
app.use((req, res, next) => {
    // criando variáveis locais 
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash("error")
    next();
    res.locals.user = req.user || null;
})

//handlebars
const hbs = handlebars.create({
    defaultLayout: "main"
})
app.engine("handlebars", hbs.engine);
app.set("view engine", 'handlebars');

//bodyparse(no lugar dele)     
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());



//Mongoose

mongoose.Promise = global.Promise;
mongoose.connect("mongodb://127.0.0.1/blogapp", {
    //disse que não é suportado
    // useMongoClient: true 
}).then(() => {
    console.log("Conectado ao mongo");
}).catch((err) => {
    console.log("Erro ao se conctar:", err);
})

//Public
//Definindo que os arquivos estáticos vão ficar na pasta public
app.use(express.static(path.join(__dirname, "public")));

//Rotas

app.get("/", (req, res) => {
    Postagem.find().populate("categoria").sort({
        data: "desc"
    }).lean().then((postagens) => {
        res.render("index", {
            postagens: postagens
        });
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro interno")
        res.redirect("/404")
    })
})


app.get("/postagem/:slug", (req, res) => {
    Postagem.findOne({
        slug: req.params.slug
    }).lean().then((postagem) => {
        if (postagem) {
            res.render("postagem/index", {
                postagem: postagem
            })
        } else {
            req.flash("error_msg", "Esta postagem não existe")
            res.redirect("/")
        }
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro interno")
        res.reditect("/")
    })
})


app.get("/categorias", (req, res) => {
    Categoria.find().lean().then((categorias) => {
        
        res.render("categorias/index", {
            categorias: categorias
        })
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro interno ao listar as catergorias")
        console.log(err);
        res.redirect("/")
    })
})

app.get("/categorias/:slug", (req, res) => {
    Categoria.findOne({
        slug: req.params.slug
    }).lean().then((categoria) => {
        if (categoria) {
            Postagem.find({
                categoria: categoria._id
            }).lean().then((postagens) => {
                res.render("categorias/postagens", {
                    postagens: postagens,
                    categoria: categoria
                })
            }).catch((err) => {
                console.log(err);
                req.flash("error_msg", "Houve um erro ao listar os posts");
                res.redirect("/");
            })
        } else {
            req.flash("error_msg", "Esta categoria não existe.");
            res.redirect("/")
        }
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro interno ao carregar a página desta categoria")
        res.redirect("/")
    })
})

app.get("/404", (req, res) => {
    res.send('ERRO 404!')
})


//Pra chamar Grupo de rotas
app.use('/admin', admin); 
app.use('/usuarios', usuarios)

//Outros
const PORT = process.env.PORT || 8081;
app.gitisten(PORT, () => {
    console.log("Servidor rodando! ")
})