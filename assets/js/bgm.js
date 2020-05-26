// Start music.
// $(".video-self").tubeplayer({
//   width: 0.001,
//   height: 0.001,
//   initialVideo: "UE9fPWy1_o4",
//   autoPlay: true,
//   onPlayerPlaying: function(id){
//     if(localStorage.getItem('volume') == 'off') {
//       $('.music-icon').removeClass('active');
//       $(".video-self").tubeplayer('mute');
//     }

//     if(localStorage.getItem('volumeValue') != null) {
//       $('.video-self').tubeplayer('volume', localStorage.getItem('volumeValue'));
//       $('.volume').val(localStorage.getItem('volumeValue'));
//     } else {
//       $('.volume').val('75');
//       $('.video-self').tubeplayer('volume', 75);
//     }
//   },
//   onPlayerEnded: function(){
//     $(".video-self").tubeplayer('play');
//   }
// });

function Bgm(src) {
  this.sound = document.createElement("audio");
  this.sound.src = src;
  this.sound.setAttribute("preload", "auto");
  this.sound.setAttribute("controls", "none");
  this.sound.setAttribute("loop", "true");
  this.sound.style.display = "none";
  document.body.appendChild(this.sound);
  this.play = function(){
    if(localStorage.getItem('volume') == 'off') {
      $('.music-icon').removeClass('active');
      return;
    }
    if(localStorage.getItem('volumeValue') != null) {
      this.setVolume(localStorage.getItem('volumeValue'));
      $('.volume').val(localStorage.getItem('volumeValue'));
    } else {
      this.setVolume(75);
      $('.volume').val('75');
    }
    this.sound.play();
  }
  this.stop = function(){
    this.sound.pause();
  }
  this.setVolume = function(volume) {
    this.sound.volume = volume * 1.0 / 100;
  }
}

var bgmList = [
  "第一楽章.mp3",
  "海兵队.mp3",
  "DREAM SOLISTER.mp3",
  "これが私の生きる道.mp3",
  "マーチ・スカイブルー・ドリーム.mp3",
  "プロヴァンスの風.mp3",
  "Samba de Loves You.mp3",
]

var bgm = new Bgm("/assets/bgm/" + bgmList[(Math.random() * bgmList.length) | 0]);

// Set volume.
$('.volume').on('blur', function() {
  var val = $(this).val();

  if(val > 100) val = 100;
  if(val < 0) val = 0;
  if( ! val) val = 75;


  // $('.video-self').tubeplayer('volume', val);
  bgm.setVolume(val);
  localStorage.setItem('volumeValue', val);
});

// Show music options.
var musicHover;
$('.music-icon, .music-options').hover(function() {
  clearTimeout(musicHover);
  $('.music-options').fadeIn();
}, function() {
  musicHover = setTimeout(function() {
    $('.music-options').fadeOut();
  }, 500);
});

// Music options.
$('.music-icon').on('click', function() {
  if($(this).hasClass('active')) {
    localStorage.setItem('volume', 'off');
    $(this).removeClass('active');
    bgm.stop();
  } else {
    localStorage.setItem('volume', 'on');
    $(this).addClass('active');
    bgm.play();
  }
});