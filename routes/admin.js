const express = require("express");
const { render, redirect } = require("express/lib/response");
const router = express.Router();
const mongoose = require("mongoose");
require("../models/Categoria");
const Categoria = mongoose.model("categorias");
require("../models/Postagem");
const Postagem = mongoose.model("postagens")

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


// Essa rota passa informações para a view editcategorias(categoria)
// Identifica qual é a categoria atravéz do id
 router.get('/categorias/edit/:id', (req,res) => {
     //FindOne procurar um unico id
     // o Lean "simplifica" a constante e permite que seja usada de maneira normal.
    //Procura categoria que possui o id igual ao que foi passado pela view categorias "{{id}}"
    Categoria.findOne({_id:req.params.id}).lean().then((categoria)=>{
    res.render("admin/editcategorias", {categoria:categoria});
     }).catch((err)=>{
         req.flash("error_msg", "esta categoria não existe")
         res.redirect("/admin/categorias")
     })
   
})

// Onde a edição será efetivada
//Essa rota apenas executa a edição 
router.post("/categorias/edit", (req, res) => {
    Categoria.findOne({ _id: req.body.id }).then((categoria) => {
        let erros = []

        if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
            erros.push({ texto: "Nome invalido" })
        }
        if (!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
            erros.push({ texto: "Slug invalido" })
        }
        if (req.body.nome.length < 2) {
            erros.push({ texto: "Nome da categoria muito pequeno" })
        }
        if(req.body.nome === categoria.nome && req.body.slug === categoria.slug){
            erros.push({texto:"A categoria não foi modificada"})
        }
        if (erros.length > 0) {
            Categoria.findOne({ _id: req.body.id }).lean().then((categoria) => {
                res.render("admin/editcategorias",{erros : erros, categoria:categoria})
        
            }).catch((err) => {
                req.flash("error_msg", "Erro ao pegar os dados")
                res.redirect("admin/categorias")
            })
            
        } else {


            categoria.nome = req.body.nome
            categoria.slug = req.body.slug

            categoria.save().then(() => {
                req.flash("success_msg", "Categoria editada com sucesso!")
                res.redirect("/admin/categorias")
            }).catch((err) => {
                req.flash("error_msg", "Erro ao salvar a edição da categoria")
                res.redirect("admin/categorias")
            })

        }
    }).catch((err) => {
        req.flash("error_msg", "Erro ao editar a categoria")
        req.redirect("/admin/categorias")
    })
})


router.post("/categorias/deletar", (req,res)=>{
    Categoria.remove({_id: req.body.id}).then(()=>{
        req.flash("success_msg","Categoria deletada com sucesso!")
        res.redirect("/admin/categorias")
    }).catch((err)=>{
        req.flash("error_msg","Houve um erro ao deletar categoria")
        res.redirect("/admin/categorias")
    })
})

router.get("/postagens",(req,res)=>{
    //O  populate consegue pegar atributos de outros models como "CATEGORIA"
    //No populate é o nome que demos no model "categoria no caso"
    Postagem.find().populate("categoria").sort({date:'desc'}).then((postagens)=>{
        //passar as categorias para a página
        // res.render("admin/categorias",{categorias:categorias}) //tava assim anttes
        res.render('admin/postagens', {postagens: postagens.map(postagem => postagem.toJSON())})    
    }).catch((err)=>{
        req.flash("error_msg", "Houve um erro ao listar as postagens");
        console.log(err)
        res.redirect("/admin");
    })
})

router.get("/postagens/add",(req,res)=>{
    Categoria.find().lean().then((categoria)=>{

            res.render("admin/addpostagem",{categoria:categoria})

    }).catch(()=>{req.flash("error_msg", "Houve um erro ao carregar o formulário")
    res.redirect("/admin")
    })
})

router.post("/postagens/nova",(req,res)=>{


     var erros =[];
     if(req.body.categorias == "0"){
         erros.push({texto: "Categoria inválida, registre uma categoria"})
     }
     if (!req.body.titulo || typeof req.body.titulo == undefined || req.body.titulo == null) {
        erros.push({ texto: "Título invalido" })
    }
     if(erros.length > 0){
         
         res.render("admin/addpostagem",{erros:erros})
     }else{
        const novaPostagem={
            
            titulo: req.body.titulo,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria,
            slug:req.body.slug
        }
        console.log (novaPostagem)
        // new Postagem(novaPostagem).save().lean().then(()=>{
        //     req.flash("success_msg","Postagem criada com sucesso!")
            
        //     redirect("/admin/postagens")
        // }).catch((err)=>{
        //     console.log(err)
        //     req.flash("error_msg","Houve um erro durante o salvamento da postagem")
        //     res.redirect("/admin/postagens")
        // })
        new Postagem(novaPostagem).save().then(()=>{
            console.log("Postagem salva com sucesso");
            //Mensagem de sucesso
            req.flash("success_msg","Categoria criada com sucesso")
            res.redirect("/admin/postagens")
        }).catch((err) =>{
            //Mensagem de erro
            req.flash("error_msg","Houve um erro durante o salvamento da postagem")
            res.redirect("/admin/postagens")
        })
    
    }
 })

//O id está passando como parâmetro, por isso o params
router.get("/postagens/edit/:id", (req,res)=>{
    
    Postagem.findOne({_id: req.params.id}).lean().then((postagem)=>{
        Categoria.find().lean().then((categoria)=>{
            res.render("admin/editpostagens",{categoria:categoria, postagem:postagem})
            
        }).catch((err)=>{
            req.flash("error_msg","Houve um erro ao listar categorias")
            res.render("admin/editpostagens")
        })

    }).catch((err)=>{
        req.flash("error_msg","Houve um erro ao carregar o formulário de edição")
        console.log(err);
        console.log(err);
        res.redirect("/admin/postagens")
    })
})

router.post("/postagens/edit", (req, res)=>{

    Postagem.findOne({_id: req.body.id}).then((postagem)=>{
        postagem.titulo= req.body.titulo;
        postagem.descricao = req.body.descricao
        postagem.slug = req.body.slug
        postagem.categoria = req.body.categoria
        postagem.conteudo = req.body.conteudo

        postagem.save().lean().then(()=>{
            req.flash("success_msg","Postagem editada com sucesso.")
            res.redirect("/admin/postagens");
            
        }).catch((err)=>{
            req.flash("error_msg","Erro interno")
            res.redirect("/admin/postagens");
        })

    }).catch((err) => {
        req.flash("error_msg" , "Houve um erro ao salvar a edição")
        res.redirect("/admin/postagens")
    })
})



module.exports = router;