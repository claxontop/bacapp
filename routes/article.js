'use strict'

var express = require('express');
//cargo el controlador con la dirección de la carpeta y no es necesario el js
var ArticleController = require('../controllers/article');

//llamamos al router
var router = express.Router();
var multipart = require('connect-multiparty');
// crear un middlevare para connect
var md_upload = multipart ({uploadDir: './upload/articles'});

//Creo las rutas de prueba
router.post('/datos-curso', ArticleController.datosCurso);
router.get('/test-de-controlador', ArticleController.test);

//Rutas para artículos

router.post('/save', ArticleController.save);
router.get('/articles/:last?', ArticleController.getArticles);
router.get('/article/:id', ArticleController.getArticle);
router.put('/article/:id', ArticleController.update);
router.delete('/article/:id', ArticleController.delete);
router.post('/upload-image/:id?', md_upload, ArticleController.upload);
router.get('/get-image/:image',  ArticleController.getImage);
router.get('/search/:search',  ArticleController.search);




//Exportamos la ruta para poder importarla en app.js
module.exports = router;