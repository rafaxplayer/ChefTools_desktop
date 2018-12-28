const electron = require('electron');
const remote = electron.remote;
const { dialog } = remote;
const ipcRenderer = electron.ipcRenderer;
const { closeWindow, minimizeWindow, maxsimizeWindow, loadModalWindow } = remote.require('./main.js');
const db = require('../../database/database');

const detailNombre = $('#detail-nombre'),
    detailImg = $('#detail-img'),
    detailCats = $('#detail-cats'),
    detailIngredientes = $('#detail-ingredientes'),
    detailElaboracion = $('#detail-elaboracion'),
    detailUrl = $('#detail-url');

var limit = 0;

deleteRecipe = function (id, name) {

    const options = { type: 'warning', buttons: ['Ok', 'Cancel'], title: 'Eliminar Receta', message: `¿Seguro quieres eliminar ${name}?` }

    dialog.showMessageBox(options, function (i) {
        if (i == 0) {
            db.recetas.remove({ _id: id }, (err, n) => {
                if (err) { console.log(err); return; }

                db.recetas.find({}, (err, result) => {
                    if (err) { console.log(err) }
                    if (result) {
                        displayRecipes(result)
                    }
                });
            })
        }
    });
}

const loadRecipes = function () {
    
    db.recetas.loadDatabase();

    db.recetas.find({}).sort({ nombre: 1 }).skip(limit).limit(10).exec((err, docs) => {
        if (err)  console.log(err) 
        if (docs) displayRecipes(docs)
    });
}

const loadRecipesWithCategoria = function (catText) {
       
    db.recetas.find({"cats.nombre":catText}).sort({ nombre: 1 }).exec((err, docs) => {
        if (err) { console.log(err) }
        if (docs) {
            displayRecipes(docs)
            
        }
    });
            
}


const loadCategories = function(){

    db.recetasCategorias.loadDatabase();
    db.recetasCategorias.find({}).sort({ nombre: 1 }).exec((err, docs) => {
        if (err) { console.log(err) }
        if (docs) {
            displayCategories(docs);
            
        }
    });
}

const displayRecipes = function (recipes) {
  
    let items="";
    recipes.forEach((recipe) => {

        items += `<li id="${recipe._id}" class="list-group-item list-group-item-action d-flex justify-content-start">
                        <img class="img-thumbnail" src="${ recipe.img.length > 0 ? recipe.img : '../../assets/img/recipe-placeholder.jpg'}"/>
                        <div class=" media-body">
                            <h3>${recipe.nombre}</h3>
                            <span>${ recipe.cats ? recipe.cats.map(cat => cat.nombre).join(", ") : 'Sin Categorias'}</span>
                        </div>
                        <div class="buttons d-flex justify-content-center align-items-center">
                            <i class="far fa-edit"></i>
                            <i class="far fa-trash-alt"></i>
                        </div>
                    </li>`;
        

    });

    $('#list-content').html(items);

    if(recipes.length >= limit){

        $('.more i').removeClass('fa-sync-alt').addClass('fa-plus-circle');
        
    }else{
        $('.more i').removeClass('fa-plus-circle').addClass('fa-sync-alt');
        
    }

    limit = recipes.length >= limit ? limit + 10 : 0;
    
}

const displayCategories = function(cats){

    $(".dropdown-menu").html("");
    let items="<a class='dropdown-item' href='#'>Todas</a>";
    cats.forEach((cat)=>{
        items += `<a id="${cat._id}" class="dropdown-item" href="#">${cat.nombre}</a>`
    })
    $(".dropdown-menu").html(items);
}

const editRecipe = function (id) {
    let data = { id: id }

    loadModalWindow('/pages/recetas/ventanas/receta-nueva-editar.html', data);
}

//pagination no esta implementado
$(document).on('click', '.more i', function () {
    loadRecipes();
});

$(document).on('click', '.reload i', function () {
    loadRecipes();
});

$('.add-content').on('click', function () {
    let data = { id: 0 }
    loadModalWindow('/pages/recetas/ventanas/nueva-editar.html', data);
});

$(document).on('click',".dropdown-menu a", function(){

    const catText = $(this).text();

    $('#navbarDropdown').text(catText)

    if(catText === 'Todas'){
        limit=0;
        loadRecipes();
        return;
    }

    loadRecipesWithCategoria(catText);
   
   
});


$(document).on('click', '#list-content li', function () {

    let id = $(this).attr('id');

    db.recetas.findOne({ _id: id }, (err, doc) => {

        if (err) { console.log(err) }

        if (doc) {
            detailNombre.text(doc.nombre);
            detailCats.text(doc.cats.length ? doc.cats.map(cat => cat.nombre).join(", ") : "Sin Categorias");
            detailImg.attr('src', doc.img.length > 0 ? doc.img : '../../assets/img/recipe-big-placeholder.jpg');
            detailIngredientes.text(doc.ingredientes);
            detailElaboracion.text(doc.elaboracion);
            detailUrl.text(doc.url);
        }

    })

    $('.container').animate({ scrollTop: $('#list-content').offset().top},1000);

});

ipcRenderer.on('reload', function (event, args) {
    limit = 0;
    console.log('reload ok');
    
    loadRecipes();
})


$(document).on('click', '.buttons .fa-trash-alt', function () {
    let liElement = $(this).parent().parent();
    deleteRecipe(liElement.attr('id'), liElement.find('h3').text());
});

$(document).on('click', '.buttons .fa-edit', function () {
    let id = $(this).parent().parent().attr('id');
    editRecipe(id);
});

$('#search-content').submit(function (e) {
    e.preventDefault();
    let text = $(this).find('input').val();

    let expresion = text.length > 0 ? { nombre: new RegExp(text, 'i') } : {};

    db.recetas.find(expresion, (err, docs) => {
        if (err) { console.log(err) }
        if (docs.length) { displayRecipes(docs) }
    });


});

$('#search-content input').keyup(function (e) {

    let text = $(this).val();

    let expresion = text.length > 0 ? { nombre: new RegExp(text, 'i') } : {};

    db.recetas.find(expresion, (err, docs) => {
        if (err) { console.log(err) }
        if (docs.length) { displayRecipes(docs) }
    });
})

$('#close').on('click', () => { closeWindow(1) });

$('#min').on('click', () => { minimizeWindow(1) });

$('#max').on('click', () => { maxsimizeWindow(1) });

loadRecipes();

loadCategories();

