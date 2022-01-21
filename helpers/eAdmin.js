module.exports={
    eAdmin: function(req, res, next){
        //Função fornecida pelo passport
        //Para ver se o usuário está autenticado
        if(req.isAuthenticated() && req.user.eAdmin == 1){
            return next()
        }
        req.flash("error_msg","Você precisar ser um admin!")
        res.redirect("/")
   
    }
}