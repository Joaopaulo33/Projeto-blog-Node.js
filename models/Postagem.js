const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Postagem = new Schema({
    titulo: {
        type : String,
      //  required: true
    },
    slug: {
        type: String,
     //   required: true
    },
    
    descricao:{
        type: String,
       // required: true    
    },
    date: {
        type: Date, 
        default: Date.now()
    },
    // fazendo a relação entre dois documentos(models)
    categoria: {
        type: Schema.Types.ObjectId,
        ref: "categorias",
       // required: true    
    }
})
// categorias é a collection
//Categoria é o model
mongoose.model("postagens", Postagem);