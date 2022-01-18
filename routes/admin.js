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

 router.get('/categorias/edit/:id', (req,res) => {
     //FindOne procurar um unico id
     // o Lean "simplifica" a constante e permite que seja usada de maneira normal.

     Categoria.findOne({_id:req.params.id}).lean().then((categoria)=>{
    res.render("admin/editcategorias", {categoria:categoria});
     }).catch((err)=>{
         req.flash("error_msg", "esta categoria não existe")
         res.redirect("/admin/categorias")
     })
   
})

// Onde a edição será efetivada
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





module.exports = router;