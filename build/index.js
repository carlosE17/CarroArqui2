"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express"); // Create a new express app instance
var app = express();
var cors_1 = __importDefault(require("cors"));
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors_1.default());
//------------------------------------------------------------------------------------SOCKET--------------------------------------------------
var http = require("http").Server(app);
// set up socket.io and bind it to our
// http server.
var io = require("socket.io")(http, {
    handlePreflightRequest: function (req, res) {
        var headers = {
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
            "Access-Control-Allow-Origin": req.headers.origin,
            "Access-Control-Allow-Credentials": true
        };
        res.writeHead(200, headers);
        res.end();
    }
});
io.on('connection', function (socket) {
    console.log('user connected');
    socket.on('nuevoJuego', function (message) {
        newJuego();
    });
});
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------
var pista = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
var punteo = 0;
var tiempo = 0;
var activo = false;
var esquivados = [0, 0, 0];
var movimientos = [0, 0, 0, 0];
var xj = 2, yj = 7, contador = 0, temp = 4;
pista[yj][xj] = 1;
//______________________________________________________logica de la matriz________________________________________________________________
//enemigos 2,3,4
//jugador 1
//vacio 0
function sumarPunteo(e) {
    switch (e) {
        case 2:
            punteo += 2;
            esquivados[0]++;
            break;
        case 3:
            punteo += 3;
            esquivados[1]++;
            break;
        case 4:
            punteo += 5;
            esquivados[2]++;
            break;
    }
}
function newEnemigo() {
    var r = Number(Math.floor(Math.random() * 4));
    var notRandomNumbers = [2, 2, 3, 2, 2, 3, 2, 3, 4, 4];
    var e = Math.floor(Math.random() * notRandomNumbers.length);
    pista[0][r] = notRandomNumbers[e];
}
function colision() {
    var resultado = { matriz: pista, punteo: punteo, tiempo: tiempo, activo: activo, enemigos: (esquivados[0] + esquivados[1] + esquivados[2]), enemigos1: esquivados[0], enemigos2: esquivados[1], enemigos3: esquivados[2], movArriba: movimientos[0], movAbajo: movimientos[1], movDer: movimientos[2], movIzq: movimientos[3] };
    console.log('colision!!');
    resultado.activo = false;
    console.log(resultado);
    io.sockets.emit('matriz', resultado);
    console.log('colision!!');
    pista = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
    activo = false;
}
function newJuego() {
    activo = true;
    xj = 2;
    yj = 7;
    contador = 0;
    temp = 4;
    pista = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
    pista[yj][xj] = 1;
    tiempo = 0;
    punteo = 0;
    esquivados = [0, 0, 0];
    movimientos = [0, 0, 0, 0];
}
function actualizarM() {
    if (activo) {
        if (contador == temp) {
            newEnemigo();
            contador = 0;
        }
        for (var i = 0; i < pista.length; i++) {
            for (var j = 0; j < pista[0].length; j++) {
                if (pista[i][j] != 0 && pista[i][j] != 1) {
                    var enemyType = pista[i][j];
                    if (i == pista.length - 1) {
                        pista[i][j] = 0;
                        sumarPunteo(Number(enemyType));
                    }
                    else {
                        if (pista[i + 1][j] == 1) {
                            colision();
                        }
                        else {
                            pista[i + 1][j] = enemyType;
                            pista[i][j] = 0;
                            i++;
                        }
                    }
                }
            }
        }
        pista.forEach(function (fila) {
            console.log(fila);
        });
        console.log('-------T:' + tiempo + '-----------------P:' + punteo);
        io.sockets.emit('matriz', { matriz: pista, punteo: punteo, tiempo: tiempo, activo: activo, esquivados: esquivados });
        contador++;
    }
}
function izquierda() {
    if (xj == 0) {
        colision();
    }
    else if (pista[yj][xj - 1] != 0) {
        colision();
    }
    else {
        pista[yj][xj] = 0;
        xj--;
        pista[yj][xj] = 1;
    }
}
function derecha() {
    if (xj == pista[0].length - 1) {
        colision();
    }
    else if (pista[yj][xj + 1] != 0) {
        colision();
    }
    else {
        pista[yj][xj] = 0;
        xj++;
        pista[yj][xj] = 1;
    }
}
function up() {
    if (yj == 0) {
        colision();
    }
    else if (pista[yj - 1][xj] != 0) {
        colision();
    }
    else {
        pista[yj][xj] = 0;
        yj--;
        pista[yj][xj] = 1;
    }
}
function down() {
    if (yj == pista.length - 1) {
        colision();
    }
    else if (pista[yj + 1][xj] != 0) {
        colision();
    }
    else {
        pista[yj][xj] = 0;
        yj++;
        pista[yj][xj] = 1;
    }
}
function moverse(d) {
    if (activo) {
        switch (d) {
            case 2:
                izquierda();
                movimientos[3]++;
                break;
            case 1:
                derecha();
                movimientos[2]++;
                break;
            case 3:
                up();
                movimientos[0]++;
                break;
            case 4:
                down();
                movimientos[1]++;
                break;
        }
        io.sockets.emit('matriz', { matriz: pista, punteo: punteo, tiempo: tiempo, activo: activo, esquivados: esquivados });
    }
}
//matriz, punteo, tiempo, activo
//-----------------------------------------------------------------------LOOP----------------------------------------------------------
var timeIntevalSeconds = 1;
setInterval(function () { actualizarM(); tiempo++; }, timeIntevalSeconds * 1000);
//_____________________________________server endpoints_________________________________________________________
app.get('/', function (req, res) {
    res.send('funciona!  ( -w-)/');
});
app.post('/moverse', function (req, res) {
    //console.log(req.body);
    moverse(Number(req.body.direccion));
    res.send("ok");
});
app.post('/reiniciar', function (req, res) {
    //console.log(req.body);
    newJuego();
    res.send("ok");
});
app.listen(8080, function () {
    console.log('App is listening on port 8080!');
});
