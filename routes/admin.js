const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
require("../models/Categoria")
const Categoria = mongoose.model("categorias");

router.get('/', (req,res)=>{
   res.render("admin/index");
})

router.get('/posts',(req,res)=>{
    res.send("Página dos posts");
})
// Onde serão mostradas as categorias
router.get('/categorias',(req,res)=>{

    //antes de renderizar 
    //A função find() que lista todos documentos que existem, todas as categorias
    //todo model tem essa função
//sort para mostrar em ordem decrescente conforme a data da criação
    Categoria.find().sort({date:'desc'}).then((categorias)=>{
        //passar as categorias para a página
        // res.render("admin/categorias",{categorias:categorias}) //tava assim anttes
        res.render('admin/categorias', {categorias: categorias.map(categoria => categoria.toJSON())})    
    }).catch((err)=>{
        req.flash("error_msg", "Houve um erro ao listar as categorias");
        res.redirect("/admin");
    })
  //  res.render("admin/categorias");
})

router.get('/categorias/add',(req,res)=>{
    res.render("admin/addcategorias");
})

router.post("/categorias/nova",(req,res)=>{
    // fazendo validação do formulário
    var erros=[];

    if(!req.body.nome || typeof req.body.slug == undefined || req.body.nome == null){
         erros.push({texto:"Nome inválido."}) 
    }

    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug === null){
        erros.push({texto:"Slug inválido."})
    }

    if(req.body.nome.length<2){
        erros.push({texto:"Nome da categoria é muito pequeno"})

    }
    if(erros.length>0){
        res.render("admin/addcategorias",{erros : erros})
    }else{
        const novaCategoria = { 
        nome: req.body.nome,
        slug: req.body.slug
}
    //Salvar nova categoria no banco de dados
        new Categoria(novaCategoria).save().then(()=>{
            console.log("Categoria salva com sucesso");
            //Mensagem de sucesso
            req.flash("success_msg","Categoria criada com sucesso")
            res.redirect("/admin/categorias")
        }).catch((err) =>{
            //Mensagem de erro
            req.flash("error_msg","Houve um erro ao salvar a categoria, tente novamente")
            res.redirect("/admin");
        })
    }

 
})

//  router.get('/categorias/edit/:id'), (req,res)=>{
//     res.render('ola') 
//     //res.render("/categorias/edit/:id")
//  }  

 router.get('/categorias/edit/:id', (req,res)=>{
    res.render("admin/editcategorias");
})


module.exports = router;