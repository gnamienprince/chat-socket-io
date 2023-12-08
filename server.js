var express = require('express');
var app = express();
var server = require('http').createServer(app);
var mysql = require('mysql');
const dotenv = require('dotenv');


app.use(express.static(__dirname + '/public'));

//connexion a la base de donnée

//chargé les variables d'environnement
dotenv.config();

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});


// Établir la connexion à la base de données
db.connect((err) => {
    if (err) {
        console.error('Erreur de connexion à la base de données : ' + err.stack);
        return;
    }
    console.log('Connecté à la base de données MySQL');
});


//notre route
app.get('/', function (req, res) {
    const sql = 'SELECT * FROM user';
    db.query(sql, (err, results) => {
        if (results) {
            const user = Array.from(results);
            res.render('index.ejs', { user: user });
        };
    });

})

//erreur 404
app.use(function (req, res, next) {
    res.setHeader('Content_type', 'text/html');
    res.status(404).send('Page introuvable');
});

//variable globale pour les messgaes


//initialisation du socket IO
var io = require('socket.io')(server);
io.on('connection', (socket) => {

    socket.on('pseudo', (pseudo) => {

        const nom = pseudo; // Nom à rechercher
        const sql = 'SELECT * FROM user WHERE pseudo = ?';
        db.query(sql, [nom], (err, results) => {

            if (err) {

            }
            else {
                //si l'utilisateur n'existe pas
                if (results.length === 0) {
                    //console.log('Requête réussie. Résultats 1 :', results);
                    const sql = 'INSERT INTO user (pseudo) VALUES (?)';
                    db.query(sql, [nom]);

                    socket.pseudo = pseudo;
                    socket.broadcast.emit('newUser', pseudo);
                } else {
                    //console.log('Requête réussie. Résultats 2:', results);
                    socket.pseudo = pseudo;
                    socket.broadcast.emit('newUser', pseudo);
                }
            }
        })
    });

    
    //deconnexion
    socket.on('disconnect', () => {
        socket.broadcast.emit('quitUser', socket.pseudo);
    });

    //requette pour recuperer tout les messages de la base de données
    const sql = 'SELECT * from message ORDER BY idMessage ASC';

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Erreur lors de la requête : ' + err.message);
            // Gérez l'erreur ici, par exemple, en renvoyant une réponse d'erreur au client.
        } else {
            // Traitez les données récupérées ici (dans l'objet 'results')
            tableauObjets = Array.from(results);
            
            //console.log(tableauObjets[1].receiver);
            // Traitez le tableau d'objets
            // tableauObjets.forEach((objet) => {
            //     console.log(objet.sender);
            // });  

            socket.emit('OldMessages', (tableauObjets));
            
        }
    });

    //requette pour recuperer tout les messages privés de la base de données
    var valDif = '0';
    const sql2 = 'SELECT * from message WHERE receiver <> ? ORDER BY idMessage ASC';

    db.query(sql2,[valDif], (err, results) => {
        if (err) {
            console.error('Erreur lors de la requête : ' + err.message);
            // Gérez l'erreur ici, par exemple, en renvoyant une réponse d'erreur au client.
        } else {
            // Traitez les données récupérées ici (dans l'objet 'results')
            tableauObjets = Array.from(results);
            
            //console.log(tableauObjets[1].receiver);
            // Traitez le tableau d'objets
            // tableauObjets.forEach((objet) => {
            //     console.log(objet.sender);
            // });  

            socket.emit('DifMessages', (tableauObjets));
        }
    });

    socket.on('newMessageMe', (message,receiver) => {

        //insertion des messages envoyés dans la base de données
        //const message = message;
        
        if(receiver != 0){
            const sql = "INSERT INTO message (sender,receiver,content) VALUES (?)";
            const contenu = [socket.pseudo, receiver, message];
            db.query(sql, [contenu]);
    
            socket.broadcast.emit('newMessageAll', { message: message, pseudo: socket.pseudo });
        }else{
            const sql = "INSERT INTO message (sender,receiver,content) VALUES (?)";
            const contenu = [socket.pseudo, 0, message];
            db.query(sql, [contenu]);
    
            socket.broadcast.emit('newMessageAll', { message: message, pseudo: socket.pseudo });
        }
    });

    socket.on('writting', (pseudo) => {
        socket.broadcast.emit('isWritting', pseudo);
    })

    socket.on('notWritting', () => {
        socket.broadcast.emit('notWritting');
    })
});



//appel du serveur
server.listen(8080, () => console.log('Server started at port: 8080'));