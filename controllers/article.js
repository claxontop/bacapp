'use strict'

var validator = require('validator');
var fs = require('fs');
var path = require('path');


const article = require('../models/article');
var Article = require('../models/article');
const { exists } = require('../models/article');

var controller = {
    datosCurso: (req, res) => {
        var bala = req.body.bala;

        return res.status(200).send({
            curso: 'Master en Frameworks',
            autor: 'Victor Robles',
            url: 'venturaconsultors.com',
            bala
            
        });
    },

    test: (req, res) => {
        return res.status(200).send({
            message: 'Soy la acción test de mi controlador de artículos'
        });
    },

    // metodo save para crear artículos
    save: (req, res) => {
        // Recogemos los parámetros por post (los que envíe el usuario)
        var params = req.body;

        // Validar datos (validator)
        try {
            var validate_title = !validator.isEmpty(params.title);
            var validate_content = !validator.isEmpty(params.content);

        } catch (err) {
            return res.status(200).send({
                status: 'error',
                message: 'Faltan datos por enviar'
            });
        }
        if (validate_title && validate_content) {

            // Crear el objeto a guardar
            var article = new Article();

            // Asignar valores
            article.title = params.title;
            article.content = params.content;

            if(params.image) {
                article.image = params.image;
            } else{
                article.image = null;
            }

            
            // Guardar artículo
            article.save((err, articleStored) => {
                if (err || !articleStored) {
                    return res.status(404).send({
                        status: 'error',
                        message: 'El artículo no se ha guardado'
                    });
                }
                // Devolver una respuesta
                return res.status(200).send({
                    status: 'success',
                    article: articleStored
                });
            });


        } else {
            return res.status(200).send({
                status: 'error',
                message: 'Los datos no son válidos'
            });
        }
    },
    // Método para Listado de artículos
    // Find para sacar los datos de la BD
    getArticles: (req, res) => {

        var query = Article.find({});
        var last = req.params.last;

        if (last || last != undefined) {

            query.limit(5);
        }

        query.sort('-date').exec((err, articles) => {

            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message: 'Error al devolver los artículos'
                });
            }

            if (!articles) {
                return res.status(404).send({
                    status: 'error',
                    message: 'No hay artículos a mostrar'
                });
            }

            return res.status(200).send({
                status: 'success',
                articles
            });
        });
    },
    getArticle: (req, res) => {

        // recoger id de la url
        var articleId = req.params.id;
        // comprobar que existe
        if (!articleId || articleId == null) {
            return res.status(404).send({
                status: 'error',
                message: 'Noexiste el artículo'
            });
        }
        // Buscar artículo
        Article.findById(articleId, (err, article) => {

            if (err || !article) {
                return res.status(404).send({
                    status: 'error',
                    message: 'No existe el artículo'
                });
            }
            // Devolver el artículo en json
            return res.status(200).send({
                status: 'success',
                article
            });
        });
    },
    update: (req, res) => {

        // Recoger id de artículo de la url
        var articleId = req.params.id;
        // recoger datos  que vienen por PUT
        var params = req.body;
        // Validar datos
        try {
            var validate_title = !validator.isEmpty(params.title);
            var validate_content = !validator.isEmpty(params.content);
        } catch (err) {
            return res.status(404).send({
                status: 'error',
                message: 'Faltan datos por enviar'
            });
        }
        if (validate_title && validate_content) {
            // find and update
            Article.findByIdAndUpdate({ _id: articleId }, params, { new: true }, (err, articleUpdated) => {
                if (err) {
                    return res.status(500).send({
                        status: 'error',
                        message: 'Error al actualizar'
                    });
                }
                if (!articleUpdated) {
                    return res.status(404).send({
                        status: 'error',
                        message: 'No existe el artículo'
                    });
                }
                // devolver respuesta
                return res.status(200).send({
                    status: 'success',
                    article: articleUpdated
                });
            });
        } else {
            return res.status(200).send({
                status: 'error',
                message: 'Validación no correcta'
            });
        }

    },
    delete: (req, res) => {
        // Recoger id de la url
        var articleId = req.params.id;

        // fin & delete
        article.findOneAndDelete({ _id: articleId }, (err, articleRemoved) => {
            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message: 'Error al borrar'
                });
            }
            if (!articleRemoved) {
                return res.status(404).send({
                    status: 'error',
                    message: 'No se ha borrado el artículo, que posiblemente no exista.'
                });
            }
            return res.status(202).send({
                status: 'success',
                article: articleRemoved
            });
        });
    },

    upload: (req, res) => {
        // configurar core multiparty en controllers/article.js

        // recoger el fichero
        var file_name = 'Imagen no subida ...';
        // comprobar que se procesa correctamente
        if (!req.files.file0) {
            return res.status(404).send({
                status: 'error',
                message: file_name
            });
        }
        // Conseguir el nombre y la extensión del fichero
        var file_path = req.files.file0.path;
        var file_split = file_path.split('\\');
        // *ADVERTENCIA*  para sistemas UNIX  ('/')
        // nombre del fichero
        var file_name = file_split[2];
        // busco la extensión del fichero
        var extension_split = file_name.split('\.');
        var file_ext = extension_split[1];
        //comprobar que la extensión sea válida, en caso contrario se borra el fichero
        if (file_ext != 'png' && file_ext != 'jpg' && file_ext != 'jpeg' && file_ext != 'gif') {
            fs.unlink(file_path, (err) => {
                return res.status(404).send({
                    status: 'error',
                    message: 'La extensión del fichero no es válida'
                });
            });
        } else {
            var articleId = req.params.id;

            if(articleId) {
                Article.findOneAndUpdate({ _id: articleId }, { image: file_name }, { new: true }, (err, articleUpdated) => {

                    if (err || !articleUpdated) {
                        return res.status(200).send({
                            status: 'error',
                            message: 'Error al guardar la imagen del artículo'
                        });
                    }
    
                    return res.status(200).send({
                        status: 'success',
                        article: articleUpdated
                    });
                });
            }else{
                return res.status(200).send({
                    status: 'success',
                     image: file_name
                });
            }

            
        }
    }, // end upload file
    // Extraer imagen
    getImage: (req, res) => {
        //sacar el fichero
        let file = req.params.image;
        // sacar la url
        let path_file = './upload/articles/' + file;
        // comprobar si el fichero existe
        fs.access(path_file, fs.constants.F_OK, (err) => {
            if (err) {
                return res.status(404).send({
                    status: 'error',
                    message: 'no existe'
                });
                // console.log(existsSync)
                // return res.sendFile(path.resolve(path_file));
            } else {
                //devolvemos el fichero, para incrustarlo en etiquetas de imagen
                return res.sendFile(path.resolve(path_file));

            }
        });
    },

      search:  (req, res)  => {

        // sacar el string a buscar
        var searchString = req.params.search;
        // find or
        Article.find ({"$or": [
            {"title": {"$regex": searchString, "$options": "i"}},
            {"content": {"$regex": searchString, "$options": "i"}}
        ]})
        .sort([['date', 'descending']])
        .exec ((err, articles) => {

                if(err) {
                    return res.status(500).send({
                        status: 'error',
                       message: 'Error en la petición'
                    });
                }
                if (!articles || articles.length <= 0){
                    return res.status(404).send({
                        status: 'error',
                       message: 'No hay artículos a mostrar que coincidan con tu búsqueda'
                    });
                }
                return res.status(200).send({
                status: 'success',
                articles
            });
        });
        
      }      





};

// Fin del controller
module.exports = controller;

