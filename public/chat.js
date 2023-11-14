var socket = io.connect('http://localhost:8080');

while (!pseudo) {
    var pseudo = prompt('entrez votre speudo');
}

socket.emit('pseudo', pseudo);
document.title = pseudo + ' - ' + document.title;


//socket de connexion
socket.on('newUser', (pseudo) => {
    createElementFunction('newUser', pseudo);
});

//socket de deconnexion
socket.on('quitUser', (pseudo) => {
    createElementFunction('quitUser', pseudo);
});

var tableauObjets = [];

//reception de tout les messages
socket.on('OldMessages', (tableauObjet) => {
    tableauObjets = tableauObjet;
    tableauObjet.forEach(objet => {
       
            if (objet.sender === pseudo) {
                createElementFunction('oldMessageMe', objet);
            }
            else {
                createElementFunction('oldMessage', objet);
            };
        
    });
});



//message envoyé au public
socket.on('newMessageAll', (content) => {
    createElementFunction('newMessageAll', content);
});

//message solitaire


var nomUser = 0;
function envoyerID(user) {
    //console.log(user);
    nomUser = document.getElementById(user).value;
    //a chaque fois le chaque utilisateur est selectionner, il faut masquer la conversation du groupe
    const element1 = document.getElementById('msgContainer');

    if (element1) {
        while (element1.firstChild) {
            element1.removeChild(element1.firstChild);
        };
    };

    //console.log('test');
    //console.log('loremmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm',tableauObjets);
    //console.log(tableauObjets);
    //le fait de filtrer les messages
    //const tableauObjetsFilter = tableauObjets.filter(items => items.sender == pseudo && items.receiver == nomUser);
    //console.log(tableauObjets);
    //console.log(tableauObjets);
    //let premierMessage = tableauObjets.find(item => true);
    let resultatsFiltres = tableauObjets.filter(objet =>
        objet.sender === pseudo && objet.receiver === nomUser || objet.sender === nomUser && objet.receiver === pseudo
    );

    //console.log(resultatsFiltres);
    resultatsFiltres.forEach(objet => {
        if (objet.sender === pseudo) {
            //console.log('test3');
            createElementFunction('oldMessageMe', objet);
        }
        if (objet.sender === nomUser) {
            //console.log(objet);
            createElementFunction('recuMessagePerso', objet);
        };
    });

    //quand je clic je doit modifier l'id du bouton envoyé de sorte a filtrer les messages
    // const idButton = document.getElementById('btnSend');
    // idButton.id = nomUser;
    // console.log(idButton.id);
};


//socket d'envoie de message 
document.getElementById('chatForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const textInput = document.getElementById('msgInput').value;

    //le nom du receveur de notre message
    const receiver = nomUser;
    console.log(receiver);
    //alert(receiver);
    if (textInput.length > 0) {
        socket.emit('newMessageMe', textInput, receiver);

        //if(receiver === 'all'){
        createElementFunction('newMessageMe', textInput);
        document.getElementById('msgInput').value = '';
        //};
    };
});


//la fonction en train d'écrire
function writting() {
    socket.emit('writting', pseudo);
}

socket.on('isWritting', (pseudo) => {
    document.getElementById('isWritting').textContent = pseudo + " est en train d'écrire...";
});

function notWritting() {
    socket.emit('notWritting');
};

socket.on('notWritting', () => {
    document.getElementById('isWritting').textContent = "";
});


function createElementFunction(element, content) {

    const newElement = document.createElement("div");

    switch (element) {

        //afficher le message de connexion
        case 'newUser':
            newElement.classList.add(element, 'message');
            newElement.textContent = content + ' est connecté';
            document.getElementById('notification').appendChild(newElement);
            break;

        //afficher le message de deconnexion
        case 'quitUser':
            newElement.classList.add(element, 'message');
            newElement.textContent = content + " s'est déconnecté";
            document.getElementById('notification').appendChild(newElement);
            break;

        //afficher le message envoyé
        case 'newMessageMe':
            newElement.classList.add(element, 'message');
            newElement.innerHTML = pseudo + ' : ' + content;
            document.getElementById('msgContainer').appendChild(newElement);
            break;

        case 'newMessageAll':
            newElement.classList.add(element, 'message');
            newElement.innerHTML = content.pseudo + ' : ' + content.message;
            document.getElementById('msgContainer').appendChild(newElement);
            break;

        case 'oldMessage':
            newElement.classList.add('newMessageAll', 'message');
            newElement.innerHTML = content.sender + ' : ' + content.content;
            document.getElementById('msgContainer').appendChild(newElement);
            break;

        case 'recuMessagePerso':
            newElement.classList.add('newMessageAll', 'message');
            newElement.innerHTML = content.receiver + ' : ' + content.content;
            document.getElementById('msgContainer').appendChild(newElement);
            break;


        case 'oldMessageMe':
            newElement.classList.add('newMessageMe', 'message');
            newElement.innerHTML = pseudo + ' : ' + content.content;
            document.getElementById('msgContainer').appendChild(newElement);
            break;

        //en train d'ecrire
        case 'isWritting':
            newElement.classList.add(element, 'message');
            newElement.innerHTML = content.pseudo + ' : ' + content.message;
            document.getElementById('msgContainer').appendChild(newElement);
            break;
    }
}

function groupe() {
    const element0 = document.getElementById('msgContainer');
    if (element0) {
        while (element0.firstChild) {
            element0.removeChild(element0.firstChild);
        };
    };

    const element1 = document.getElementById('msgContainer');

    // Assurez-vous que l'élément existe avant de manipuler son contenu
    if (element1) {
        // Reconstruisez le contenu de la div
        const nouvelleDiv = document.createElement('div');
        //console.log('test');
        // Ajoutez des classes si nécessaire
        nouvelleDiv.classList.add('maClasse');

        // Ajoutez la nouvelle div à l'élément parent
        element1.appendChild(nouvelleDiv);

        // Maintenant, vous pouvez utiliser Socket.IO pour afficher les messages
        const socket = io(); // Initialisez votre connexion Socket.IO

        // Écoutez l'événement 'OldMessages' de la socket
        socket.on('OldMessages', function (tableauObjet) {
            tableauObjets = tableauObjet;
            tableauObjet.forEach(objet => {
                
                    if (objet.sender === pseudo) {
                        createElementFunction('oldMessageMe', objet);
                    } else {
                        createElementFunction('oldMessage', objet);
                    }
                
            });
        });
    };
};
