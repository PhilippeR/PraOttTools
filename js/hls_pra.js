 analyzeHLS = function() {
     var url = document.getElementById("url").value;
     var urlHls = 'http://hls-m04.live-lv3.canal-plus.com/live/hls/alaune-hd-andr7/r7-hd-clair/index.m3u8';
     var urlHls2 = 'http://hls-m001.live-lv3.canalplus-cdn.net/live/disk/tf1-hd/ios-hdplus/index.m3u8';
     var urlHls3 = 'http://hls-m02.live-lv3.canal-plus.com/live/hlsdvr/c8-hd-ios/ios-hd/index.m3u8';
     if (url == '') {
         url = urlHls;

     }
     console.log('url:' + url);
     var xhr = new XMLHttpRequest();
     console.log("creation new XMLHttpRequest()");

     xhr.onloadend = function() {
         if (xhr.status === 200) {
             var txt = '';
             var masterPlaylist = xhr.responseText;
             var headers = xhr.getAllResponseHeaders();
             var parsedM3u8 = m3u(masterPlaylist);
             var parsedUrl = urlSplit(url);


             displayMasterPlaylist(masterPlaylist);
             displayHeaders(headers);


             console.log("retour fonction urlSplit");
             console.log(parsedUrl);
             console.log("retour Domain");
             console.log(parsedUrl.domain);
             console.log('retour de la fonction de parsing made ');
             /*             console.log('On va parser l\'objet cree');
                          for (id in parsedM3u8) {
                              console.log(parsedM3u8[id]);
                          };*/




             console.log('----------------------------------------------------------');
             console.log('debut de la fonction m3u');
             console.log(m3u(masterPlaylist));
             console.log('fin de la fonction m3u');
             console.log('----------------------------------------------------------');
             console.log('debut de la fonction m3u8');
             var rr = m3u8(masterPlaylist);
             console.log(m3u8(masterPlaylist));
             console.log('fin de la fonction m3u8');

             console.log('----------------------------------------------------------');
         }
     };
     xhr.open("GET", url);
     console.log("Go pour la requete");
     xhr.send();

 };
 displayHeaders = function(headers) {
     var display = headers.toString().split('\n');
     var text = '';

     for (var i = 0; i < display.length; i++) {
         text += display[i].toString() + '<br> ';
     }

     document.getElementById("headers").innerHTML = text;
 };
 displayMasterPlaylist = function(playlist) {
     var display = playlist.toString().split('\n');
     var text = '';

     for (var i = 0; i < display.length; i++) {
         text += display[i].toString() + '<br> ';
     }

     document.getElementById("masterPlaylist").innerHTML = text;
 };