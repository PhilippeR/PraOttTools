var maxValues = []; //tableau chunk video le plus recent
var minValues = []; //tableau chunk video le plus ancien
var maxValuesA = []; //tableau chunk audio le plus recent
var minValuesA = []; //tableau chunk audio le plus ancien
var rollbacksA = {};
var rollbacks = {};
var graphBuffurSize = 50; // nombre de point dans le graph
var buttonState = 0; // 0--> Analyse, 1-->En cours, 2-->Pause 
var infos = ''; // zone de texte info
var erreurs = ''; // zone de texte erreurs
var videoDomain = '';
var AudioDomain = '';

//couleur pour les graphes
window.chartColors = {
    red: 'rgb(255, 99, 132)',
    orange: 'rgb(255, 159, 64)',
    yellow: 'rgb(255, 205, 86)',
    green: 'rgb(75, 192, 192)',
    blue: 'rgb(54, 162, 235)',
    purple: 'rgb(153, 102, 255)',
    grey: 'rgb(201, 203, 207)'
};

// config du graphe
var config = {
    type: 'line',
    data: {
        labels: maxValues.map(function(e) { return e.ts.getHours().pad(2) + ":" + e.ts.getMinutes().pad(2) + ":" + e.ts.getSeconds().pad(2); }),
        datasets: [{
            label: 'Max Video',
            fill: false,
            backgroundColor: window.chartColors.red,
            borderColor: window.chartColors.red,
            data: maxValues,
        }, {
            label: 'Min Video',
            fill: false,
            backgroundColor: window.chartColors.orange,
            borderColor: window.chartColors.orange,
            data: minValues,

        }, {
            label: 'Max Audio',
            fill: false,
            backgroundColor: window.chartColors.blue,
            borderColor: window.chartColors.blue,
            data: maxValuesA,
        }, {
            label: 'Min Audio',
            fill: false,
            backgroundColor: window.chartColors.purple,
            borderColor: window.chartColors.purple,
            data: minValuesA,
        }]
    },
    options: {
        responsive: false,
    }
};

/*
TODO

- Afficher les headers de reponse et faire des tests
*/

Number.prototype.pad = function(len) {
    return (new Array(len + 1).join("0") + this).slice(-len);
};

window.onload = function() {
    //Une fois la page chargée, on crée le graphique
    var ctx = document.getElementById("graph").getContext("2d");
    window.myChart = new Chart(ctx, config);

};

$(document).ready(function() {

    //$("#inputUrl2").val(urlHlsAudio);

});

// gestion du bouton Analyse
var analyze = function() {

    if (buttonState == 0) {
        //etat par defaut au lancement de la page
        // on récupère les url à tester et la durée des chunck
        var urlVideo = document.getElementById("inputUrl").value;
        var urlAudio = document.getElementById("inputUrl2").value;
        var duree = document.getElementById("dureeChunk").value;
        duree = duree * 1000;
        //utilisation de la biblio urlSplit.js pour decomposer celle ci  
        videoDomain = urlSplit(urlVideo).protocol + ':\/\/' + urlSplit(urlVideo).domain + urlSplit(urlVideo).directory;
        audioDomain = urlSplit(urlVideo).protocol + ':\/\/' + urlSplit(urlAudio).domain + urlSplit(urlAudio).directory;

        //on change le texte du bouton puisque l'analyse est en cours.
        document.getElementById("analyzeBtn").innerHTML = "Analyse en cours";
        //reset 
        resetChart();
        //infos = 'url Video: ' + urlVideo + '<br>' + 'url Audio: ' + urlAudio + '<br>';

        // si une url video a été remplie, on lance le timer de l'analyse
        if (urlVideo != '') {
            getMediaPlaylist(urlVideo, 1);
            setInterval(function() { getMediaPlaylist(urlVideo, 1); }, duree);
            infos += 'url Video: ' + urlVideo + '<br>';
            console.log("url video:" + urlVideo);
        }
        // si une url audio a été remplie, on lance le timer de l'analyse
        if (urlAudio != '') {
            getMediaPlaylist(urlAudio, 0);
            setInterval(function() { getMediaPlaylist(urlAudio, 0); }, duree);
            infos += 'url Audio: ' + urlAudio + ' < br > ';
            console.log("url audio:" + urlAudio);
        }


        buttonState = 1;
        document.getElementById("analyzeBtn").innerHTML = "Analyse en cours";
    } else if (buttonState == 1) {
        //Analyse en cours. On va passer le bouton en pause
        document.getElementById("analyzeBtn").innerHTML = "Pause";
        buttonState = 2;
    } else if (buttonState == 2) {
        //le bouton est en pause. On le repasse en analyse.
        buttonState = 1;
        document.getElementById("analyzeBtn").innerHTML = "Analyse en cours";

    }

};
// typeUrl=0 playlist audio, typeUrl=1 playlist video
var getMediaPlaylist = function(url, typeUrl) {

    var type = typeUrl;
    var xhr = new XMLHttpRequest();
    xhr.onloadend = function() {
        if (xhr.status === 200) {
            var chunkList = new Array();
            var firstChunk = 0;
            var lastChunk = 0;
            var nbreChunk = 0;
            var m3u8 = xhr.responseText;
            var splittedM3u8 = m3u8.split('\n');
            var lastChunkRelativeUrl = splittedM3u8[splittedM3u8.length - 2];
            var lastChunkUrl = videoDomain + lastChunkRelativeUrl;
            console.log("url dernier chunk:  " + videoDomain + lastChunkRelativeUrl);
            getLastChunk(lastChunkUrl);
            // on va chercher tous les lignes ou il y a un -xxxx.ts
            for (var i = 0; i < splittedM3u8.length; i++) {
                var temp = /(?!-)[\d]+(?=.ts)/.exec(splittedM3u8[i]);

                if (temp) {
                    chunkList.push(temp);
                } else {

                }
            }
            // extraire le n° du chunk de la premiere ligne et de la derniere
            nbreChunk = chunkList.length;
            firstChunk = (chunkList[0].toString());
            lastChunk = (chunkList[chunkList.length - 1].toString());

            document.getElementById("infos").innerHTML = infos;
            var ts = new Date();

            if (typeUrl) {
                // si c est la playlist video
                console.log('Video: ' + firstChunk + ' -- ' + lastChunk);

                //on ajoute les nouvelles valeurs aux tableaux et on enlève le premier element
                maxValues.push({ ts: ts, value: parseInt(lastChunk) });
                if (maxValues.length > graphBuffurSize) { maxValues.shift(); }

                minValues.push({ ts: ts, value: parseInt(firstChunk) });
                if (minValues.length > graphBuffurSize) { minValues.shift(); }
            } else {
                //si c est la playlist audio
                console.log('Audio: ' + firstChunk + ' -- ' + lastChunk);

                maxValuesA.push({ ts: ts, value: parseInt(lastChunk) });
                if (maxValuesA.length > graphBuffurSize) { maxValuesA.shift(); }

                minValuesA.push({ ts: ts, value: parseInt(firstChunk) });
                if (minValuesA.length > graphBuffurSize) { minValuesA.shift(); }
            }
        }

        if (buttonState == 1) {
            updateMyChart();
            displayRollbacks();

        }
    };
    xhr.open("GET", url);
    xhr.send();
};
// on verifie si le dernier chunk est accessible
var getLastChunk = function(url) {

    var xhr = new XMLHttpRequest();
    xhr.onloadend = function() {
        if (xhr.status != 200) {
            erreurs += '<br>' + 'Pbs de recuparation de chunk. Erreur ' + xhr.status + ' url: ' + url + '<br>';
            document.getElementById("errors").innerHTML = erreurs;
        }
    };
    xhr.open("HEAD", url);
    xhr.send();
};

var updateMyChart = function() {

    window.config.data.datasets[0].data = maxValues.map(function(e) { return e.value; });
    window.config.data.datasets[1].data = minValues.map(function(e) { return e.value; });
    //    window.config.data.labels = maxValues.map(function(e) { return e.ts.getHours().pad(2) + ":" + e.ts.getMinutes().pad(2) + ":" + e.ts.getSeconds().pad(2) });

    window.config.data.datasets[2].data = maxValuesA.map(function(e) { return e.value; });
    window.config.data.datasets[3].data = minValuesA.map(function(e) { return e.value; });
    window.config.data.labels = maxValues.map(function(e) { return e.ts.getHours().pad(2) + ":" + e.ts.getMinutes().pad(2) + ":" + e.ts.getSeconds().pad(2); });
    analyzeValues();

    window.myChart.update();
};

var analyzeValues = function() {
    var ref = 0;
    maxValues.forEach(function(val) {
        if (val.value < ref) {
            rollbacks[val.ts.getTime()] = { from: ref, to: val.value };
        }
        ref = val.value;
    });
};

var displayRollbacks = function() {
    $('#errors').html("");
    Object.keys(rollbacks).forEach(function(_ts) {
        var ts = new Date(parseInt(_ts));
        var date = ts.getHours().pad(2) + ":" + ts.getMinutes().pad(2) + ":" + ts.getSeconds().pad(2);
        $('#errors').append("[" + date + "] Rollback de chunk (ID de " + rollbacks[_ts].from + " -> " + rollbacks[_ts].to + ")<br/>");
    });

};

var resetChart = function() {
    document.getElementById("errors").innerHTML = '';
    maxValues = [];
    minValues = [];
    rollbacks = {};
    maxValuesA = [];
    minValuesA = [];
    rollbacksA = {};
    updateMyChart();

};