'use strict'

var mongoose = require('mongoose'); 
const { prependListener } = require('./app');
var app = require('./app');
var port = 3900;



mongoose.set('useFindAndModify',false);
mongoose.Promise = global.Promise;


mongoose.connect('mongodb://localhost:27017/api_rest_blog', { useNewUrlParser: true,  useUnifiedTopology: true })
    .then (() =>  {

        console.log('La conexión a la BD se ha realizado correctamente !!');

                    //Crear servidor
                    app.listen(port, () => {
                            console.log('Servidor corriendo en http://localhost:'+port);
                    });

}); 