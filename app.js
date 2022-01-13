//Carregando módulos
const express = require('express');
const handlebars = require('express-handlebars');
const app = express();
const path = require("path");
const admin = require("./routes/admin");
const mongoose = require("mongoose");

//Configurações
    //handlebars
const hbs = handlebars.create({
    defaultLayout: "main";
})
app.engine("handlebars", hbs.engine);
app.set("view engine", 'handlebars');

//bodyparse(no lugar dele)      
app.use(express.urlencoded({extended:false}));
app.use(express.json());


//Mongoose
    //em breve

//Public
    app.use(express.static(path.join(__dirname,"public")));

//Rotas
    app.use('/admin', admin);  // O "/admin" vai ser um subcaminho(prefixo)

//Pra chamar as rotas



//Outros
const PORT = 8081;
app.listen(PORT, ()=> {
    console.log("Servidor rodando! ")
})