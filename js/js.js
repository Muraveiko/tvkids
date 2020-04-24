// ----------------------------------------------------------------
//          My player class
// ----------------------------------------------------------------

if (!window.AntPlayer){
AntPlayer = {}

AntPlayer.extend = function(dest, src, skipexist){
    var overwrite = !skipexist; 
    for (var i in src)
        if (overwrite || !dest.hasOwnProperty(i)) dest[i] = src[i];
    return dest;
};

(function($){
 $.extend($, {
  dialog_status : 0, // 0 - main,1-playlist,2-video
  Menu0 : [],
  curMenu0 : 0,
  curMenuMax : 0,
  prevCurMenu : -1,
  curMenuPl : 0,
  curMenuPlMax : 0,
  stoptime : 0,

  myCuePlaylist: function (x){
          $.dialog_status = 1;
	  if($.prevCurMenu!==$.curMenu0){
                jQuery('#playlist').html('loading playlist...');

		$.player.cuePlaylist(eval("("+x+")"));
	        $.prevCurMenu=$.curMenu0;
	 }
	 $.show();
  },
  show: function(){
     alert('must be redeclared');
  },


  Menu : function(k){
      $.curMenu0 = k;
      $.myCuePlaylist($.Menu0[k]);
      return false;
  },
  play : function(i){
     jQuery('#mymenu').css('background-color',''); 
      $.dialog_status = 2;
      $.player.playVideoAt(i);
      $.show();
      return false;
  },

  loadMainMenu : function(data){
         a=JSON.parse(data);
         b='';
         $.curMenuMax = 0;
         for(var k in a) {
             $.Menu0[k]=a[k][2];
             b+='<img title="'+a[k][0]+'" src="'+a[k][1]+'" onclick="AntPlayer.Menu('+k+');return false;" class="big" tabindex=1/>';
             $.curMenuMax++;
         }
         jQuery("#homemenu").html(b);
         jQuery("#homemenu img").eq(0).focus();

  },
  

   loadPlayList:  function(){
      $.curMenuPl = 0;
      var pl = $.player.getPlaylist();
      var r='',i = 0;
      pl.forEach(function(id){
      	r+='<img tabindex=2 src="http://img.youtube.com/vi/'+id+'/mqdefault.jpg" class="big2';
      	r+='" onclick="return AntPlayer.play('+i+');"> ';
      	i++;
      });
      jQuery('#playlist').html(r).attr('scrollLeft',0);
    },

  start_stop: function (){
  	var state = $.player.getPlayerState(); 
        if(state==1){
           $.player.pauseVideo();
           $.stoptime = new Date().getTime();
        }else if(state==2){
           $.player.playVideo();
           
       }
      $.show();    
  },
  enter_action: function (){
      jQuery('#mymenu').css('background-color',''); 
      switch($.dialog_status){
         case 0:
       jQuery('#mymenu').css('background-color','rgba(0,0,0,0.7)'); 
          $.Menu($.curMenu0);
          $.dialog_status = 1;
          break;
         case 1:
           $.play($.curMenuPl);
           $.dialog_status = 2;
           $.myhide();
           break;
         case 2:
           var ctime = new Date().getTime();
	   if(ctime - $.stoptime < 3000){
       	       jQuery('#mymenu').css('background-color','rgba(0,0,0,0.7)'); 
               $.dialog_status = 0;
	   }else{
	       $.start_stop();
	   }
           break;
      }
      $.show();
  },

  back_action: function(){
      switch($.dialog_status){
         case 0:
          if($.player.getPlayerState()<3)
          {
            jQuery('#mymenu').css('background-color',''); 
             $.dialog_status = 2;
          }
          break;
         case 1:
      	       jQuery('#mymenu').css('background-color','rgba(0,0,0,0.7)'); 
            $.dialog_status = 0;
           break;
         case 2:
           AntPlayer.showTimePos(-1);
     	       jQuery('#mymenu').css('background-color','rgba(0,0,0,0.7)'); 
             $.dialog_status = 1;
           break;
      }
      $.show();
  },

  goPercent : function(pr){
  	var state = $.player.getPlayerState(); 
        if(state==1){
	    var all = AntPlayer.player.getDuration();
	    AntPlayer.player.seekTo(all*pr/100); 
	    AntPlayer.showTimePos(all*pr/100); 
	}
  },	
  lArr: function(){
      switch($.dialog_status){
         case 0:
 		$.curMenu0--;
 		if($.curMenu0<0)$.curMenu0=0;
           break;
         case 1:
 	        if($.curMenuPl > 0)
		{		
	 	  $.curMenuPl--;
 		}	
           break;
         case 2:
	  	var state = $.player.getPlayerState();
        	if(state==1){
		   var nt=$.player.getCurrentTime()-10;
		   $.player.seekTo(nt); 
        	}else if(state==2){
	           $.player.previousVideo();
       		}
           break;
      }
      $.show();
  },
  rArr: function (){
      switch($.dialog_status){
         case 0:
 		$.curMenu0++;
		if($.curMenu0>=$.curMenuMax)$.curMenu0=$.curMenuMax-1;
           break;
         case 1:
		   if($.curMenuPl < ($.curMenuPlMax-1))
		   {		
	 		$.curMenuPl++;
                   }
           break;
         case 2:
	  	var state = $.player.getPlayerState();
        	if(state==1){
		   var nt=$.player.getCurrentTime()+30;
		   $.player.seekTo(nt); 
        	}else if(state==2){
	           $.player.nextVideo();
       		}
           break;
      }
      $.show();
  },

  timerToHide : 0,
  tohide: function() {
    clearTimeout($.timerToHide);
    $.timerToHide = setTimeout(function(){$.myhide();}, 5000);
  },

 timerId2: 0,
 showTimePos : function (now){
  clearTimeout($.timerId2);
  var all = $.player.getDuration();
  if(now==-1){
     now = $.player.getCurrentTime();
  }
  if(all>0){
    if(all<now){
     now=all;
    }
    jQuery('#anttimepos').show();
    jQuery('#anttimepos_cur').css('width',''+(100*now/all)+'%');
  }else{
    jQuery('#anttimepos').hide();
  }
  $.timerId2 = setTimeout(function(){ jQuery('#anttimepos').hide();}, 5000);
}


 });

})(AntPlayer)

// ----------------------------------------------------------------
//          current project 
// ----------------------------------------------------------------


AntPlayer.extend(AntPlayer,{
  show: function(){
      jQuery('#btnHome').removeClass('ion-ios-close').removeClass('ion-ios-home').removeClass('ion-navicon-round');
      jQuery("#mymenu div").hide();
      switch(AntPlayer.dialog_status){
         case 0:
	      jQuery('#homemenu').show();
	      jQuery('#homemenu img').eq(AntPlayer.curMenu0).focus();
              jQuery('#btnHome').addClass('ion-ios-close');
              jQuery('#btnPlay').addClass('ion-play').removeClass('ion-pause');
              jQuery('#btnmenu').show();
          break;
         case 1:
              jQuery('#playlist').show();
              var cimg = jQuery('#playlist img').eq(AntPlayer.curMenuPl);
              var w = cimg.width();
              cimg.focus();
              jQuery('#btnHome').addClass('ion-ios-home');
              jQuery('#btnPlay').addClass('ion-play').removeClass('ion-pause');
              jQuery('#btnmenu').show();
           break;
         case 2:
           jQuery('#btnHome').addClass('ion-navicon-round');
           jQuery('#btnmenu').show();
           AntPlayer.showTimePos(-1);
           AntPlayer.tohide();
           break;
      }
  },
  myhide : function(){
    var state = AntPlayer.player.getPlayerState();
    if(AntPlayer.dialog_status==2 && state==1){
      jQuery('#mymenu').css('background-color',''); 
      jQuery('body').removeClass('bigcursor');
      jQuery("#mymenu div").hide();
    }
  },

});
}

// ----------------------------------------------------------------
//          YouTube player
// ----------------------------------------------------------------
      var tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      var firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

      function onYouTubeIframeAPIReady() {
          AntPlayer.player = new YT.Player('player', {
          height: '100%',
          width: '100%',
          playerVars: { 'autoplay': 0, 'controls': 0 ,'modestbranding':1,'rel':0},
          events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange,
            'onError': onPlayerError,
          }
        });
      }
      function onPlayerReady(event) {
         jQuery.get('/data/mainmenu.php',AntPlayer.loadMainMenu);
         AntPlayer.player.setVolume(100);
      }
      function onPlayerError(event) {
         setTimeout(function(){AntPlayer.player.nextVideo()}, 5000);
      }
      function onPlayerStateChange(event) {
         $("#player").show();
         var pl = AntPlayer.player.getPlaylist();
         AntPlayer.curMenuPlMax = pl.length;
    	 AntPlayer.curMenuPl = AntPlayer.player.getPlaylistIndex()
      	 
        if (event.data == YT.PlayerState.PLAYING) {
         $('#btnPlay').addClass('ion-pause').removeClass('ion-play');
        }
        if(event.data == YT.PlayerState.PAUSED){
         $('#btnPlay').addClass('ion-play').removeClass('ion-pause');
        }
        if(event.data == YT.PlayerState.CUED){
          AntPlayer.loadPlayList();
          AntPlayer.show();
        }
      }

    function myPrevVideo(){
      var cur = AntPlayer.player.getPlaylistIndex();
      AntPlayer.player.playVideoAt(cur-1);
      return false;
    }

// -----------------------------------------------------------------
//            GamePad 
// -----------------------------------------------------------------

function buttonPressed(b) {
  if (typeof(b) == "object") {
    return b.pressed;
  }
  return b == 1.0;
}

gpBtnState3=0;
gpBtnState1=0;
gpltime=0;
gprtime=0;
function runGamepad(){
    var gamepads = navigator.getGamepads();
    var pad = gamepads[0];
    if (pad) {
	    if(buttonPressed(pad.buttons[3])){
		if(gpBtnState3==0){
	          AntPlayer.back_action();
		}
		gpBtnState3=1;
	    }else{
		gpBtnState3=0;
	    }
	    if(buttonPressed(pad.buttons[1])){
		if(gpBtnState1==0){
		  AntPlayer.enter_action();
		}
		gpBtnState1=1;
	    }else{
		gpBtnState1=0;
	    }
	ctime=new Date().getTime();
        if(pad.axes[1]>0.2){
		if(ctime-gpltime>500){
		 AntPlayer.lArr();
	 	 gpltime = ctime ;
               }
        }
        if(pad.axes[1]<-0.2){
		if(ctime-gprtime>500){
		 AntPlayer.rArr();
		 gprtime = ctime ;
	       }	
        }
    }
    window.requestAnimationFrame(runGamepad);
}


    if (navigator.getGamepads === undefined) {
    } else {
        window.requestAnimationFrame(runGamepad);
    }



// ----------------------------------------------------------------
//        Init
// ----------------------------------------------------------------
$(document).ready(function(){

	$('body').mousemove(function(){
           $('body').addClass('bigcursor');
           AntPlayer.tohide();
	});

	$('#homemenu,#playlist').mousewheel(function(e, delta) {
        	this.scrollLeft -= (delta * 100);
	        e.preventDefault();
	 });


	$("#btnHome").click(function(){return AntPlayer.back_action();});
	$("#btnPrev").click(function(){return AntPlayer.lArr();});
	$("#btnPlay").click(function(){return AntPlayer.enter_action();});
	$("#btnNext").click(function(){return AntPlayer.rArr();});


	$('#mymenu').click(function(){return AntPlayer.show();});


 	$('body').keyup(function(e){
 		e.preventDefault();
 		return false;
 	});
 	$('body').keypress(function(e){
 		e.preventDefault();
 		return false;
 	});


    $("body").keydown(function(e){
      k = (e.keyCode || e.which);
           console.log(k);
      switch(k){
         case 48:
         case 96:
           AntPlayer.goPercent(0);
	   break;		
         case 49:
         case 97:
           AntPlayer.goPercent(10);
	   break;		
         case 50:
         case 98:
           AntPlayer.goPercent(20);
	   break;		
         case 51:
         case 99:
           AntPlayer.goPercent(30);
	   break;		
         case 52:
         case 100:
           AntPlayer.goPercent(40);
	   break;		
         case 53:
         case 101:
           AntPlayer.goPercent(50);
	   break;		
         case 54:
         case 102:
           AntPlayer.goPercent(60);
	   break;		
         case 48:
         case 103:
           AntPlayer.goPercent(70);
	   break;		
         case 56:
         case 104:
           AntPlayer.goPercent(80);
	   break;		
         case 57:
         case 105:
           AntPlayer.goPercent(90);
	   break;		
         case 13:
         case 32:
         case 40:
         case 179:
           AntPlayer.enter_action();
           break;
         case 27:
         case 38:
         case 46:
         case 106:
         case 178:
           AntPlayer.back_action();
           break;
         case 37:
         case 109:
         case 177:
           AntPlayer.lArr();
           break;
         case 39:
         case 107:
         case 176:
           AntPlayer.rArr();
           break;
      }
    });		
    
});

function goTime(e){
  var all = AntPlayer.player.getDuration();
  var pr = 1.0*all*e.clientX/timeContainer.offsetWidth;
  jQuery('#anttimepos_cur').css('width',e.clientX);
  AntPlayer.player.seekTo(pr); 
  e.preventDefault();
}
var timeContainer=document.getElementById('anttimepos');
timeContainer.addEventListener("click", goTime, false);
