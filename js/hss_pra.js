 // traitement du manifest HSS (Format XML)
 analyzeHSS = function() {
     var url = document.getElementById("url").value;
     var urlHss = "http://hss-m001.live-aka.canalplus-cdn.net/live/disk/tf1-hd/hd.isml/Manifest";
     if (url == '') {
         url = urlHss;
     }

     var xhr = new XMLHttpRequest();
     console.log("creation new XMLHttpRequest()");

     xhr.onloadend = function() {
         if (xhr.status === 200) {
             var manifest = xhr.responseXML;
             var headers = xhr.getAllResponseHeaders();
             manifestParser(manifest);
             document.getElementById("headers").innerHTML = headers;

         }
     };
     xhr.open("GET", url);
     console.log("Go pour la requete");
     xhr.send();
 };
 // traitement du manifest HSS
 function manifestParser(manifest) {
     function parseStreamIndex(el) {
         var index = [];
         if (!el) {
             return;
         }
         var cdren = el.children;
         if (!cdren) {
             return;
         }
         for (var i = 0; i < cdren.length; i++) {
             index.push({ d: +cdren[i].getAttribute('d'), c: +cdren[i].getAttribute('c') });
         }
         return index;
     }
     var txt = '';
     recuprecursif(manifest);
     //On recupere toutes les déclarations de streams
     // en parsannt le manifest (xml)   
     var streamIndex = manifest.getElementsByTagName('StreamIndex');
     var indexes = [];
     // Pour chaque stream, on va examiner le type; video, audio, text
     for (var i = 0; i < streamIndex.length; i++) {
         var type = streamIndex[i].getAttribute('Type');
         var qualityLevel = streamIndex[i].getElementsByTagName('QualityLevel');

         //  console.log("StreamIndex n°: " + i + '----  Type:' + typeof(streamIndex[i]));
         //  console.log(streamIndex[i]);
         //  console.log('');
         //  console.log('Liste des attributs du StreamIndex');
         //  console.log(streamIndex[i].attributes);
         //  console.log('');
         //  console.log('Liste des Quality Level');
         //  console.log(qualityLevel.getAttributeNode());

         //  console.log('---------------------------');
         //  console.log('');
         //  console.log('');
         for (var j = 0; j < qualityLevel.length; j++) {
             switch (type) {
                 case 'video':

                     txt += streamIndex[i].getAttribute('Type') + ' ';
                     txt += qualityLevel[j].getAttribute('Bitrate') + ' b/s - Resolution: ' + qualityLevel[j].getAttribute('MaxWidth') + 'x' + qualityLevel[j].getAttribute('MaxHeight');
                     txt += 'Codec: ' + qualityLevel[i].getAttribute('FourCC') + "<br>";

                     break;

                 case 'audio':

                     txt += streamIndex[i].getAttribute('Type') + ' ' + qualityLevel[j].getAttribute('Bitrate') + 'b/s - Codec: ' + qualityLevel[j].getAttribute('FourCC') + '<br>';


                     break;
                 case 'text':

                     txt += streamIndex[i].getAttribute('Type') + ' Name:' + streamIndex[i].getAttribute('Name') + ' Subtype:' + streamIndex[i].getAttribute('Subtype') +
                         '<br>';


                     break;
                 default:
                     break;
             }
         }


         indexes.push(parseStreamIndex(streamIndex[i]));
         //console.log(streamIndex[i].getAttribute('Type'));

         document.getElementById("masterPlaylist").innerHTML = txt;
         //return indexes;



     }
 }
 // fonction pour parser un Xml de bout en bout
 // on va recuperer le node racine du manifest
 function recuprecursif(xml) {
     var result = "";
     var racine = xml.documentElement;
     getFils(racine);

 }
 // on fonction recusrive qui va parser l'ensemble du doc
 function getFils(xml) {

     var nodName = xml.nodeName;
     var nodType = xml.nodType;
     var childNod = xml.childNodes;
     var nbre = xml.childNodes.length;
     console.log(nodName, nodType, childNod);
     console.log("<b>" + xml.nodeName + "<  | Type " + xml.nodeType + " | " + xml.childNodes.length + " fils");
     //  for (var i = 0; i < xml.childNodes.length; i++) {
     //      var element = xml.childNodes[i];
     //      if (element.nodeType == 1) {
     //          getFils(element);
     //      } else if (element.nodeType == 3 || element.nodeType == 4) {
     //          console.log(" valeur = " + element.nodeValue);
     //      }
     //  }
 }