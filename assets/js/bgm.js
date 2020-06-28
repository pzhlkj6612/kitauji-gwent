var battleList = [
  "daiichigakushou.mp3",
  "kaiheitai.mp3",
  "dream_solister.mp3",
  "winds_of_provence.mp3",
  "samba_de_loves_you.mp3",
];

var finale = [
  "kasanaru_kokoro.mp3",
  "soshite_tsukino_kyoku_ga_hajimaru.mp3",
];

var lobbyList = [
  "shintenchi.mp3",
  "seishun_naru_nichijo.mp3",
  "ketsui_wo_arata_ni.mp3",
];

function Bgm(playList) {
  let self = this;
  this.randomSong = function() {
    return this.playList[(Math.random() * this.playList.length) | 0];
  }
  this.isPlaying = false;
  this.playList = playList;
  this.sound = document.createElement("audio");
  this.sound.src = "/assets/bgm/" + this.randomSong();
  this.sound.setAttribute("preload", "auto");
  this.sound.setAttribute("controls", "none");
  this.sound.muted = true;
  this.sound.style.display = "none";
  document.body.appendChild(this.sound);
  this.play = function(){
    var self = this;
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
    this.isPlaying = true;
    this.sound.play();
    this.sound.muted = false;
    this.sound.addEventListener('ended',function(){
      //play next song
      self.sound.src = "/assets/bgm/" + self.randomSong();
      self.sound.load();
      self.sound.play();
    });
  }
  this.stop = function(){
    this.isPlaying = false;
    this.sound.pause();
  }
  this.setVolume = function(volume) {
    if (this.playList === battleList) {
      // battle bgm seems too loud comparing to others...
      volume *= 0.75;
    }
    this.sound.volume = volume * 1.0 / 100;
  }
  this.getVolume = function() {
    return this.sound.volume * 100 | 0;
  }
  this.fadeOut = function(callback) {
    let vol = this.getVolume();
    let interval = 100; // 200ms interval
    var intervalID = setInterval(function() {
      if (vol > 0) {
        vol -= 5;
        this.setVolume(vol);
      } else {
        // Stop the setInterval when 0 is reached
        clearInterval(intervalID);
        callback && callback();
      }
    }.bind(this), interval);
  }
  this.setMode = function(mode, opt_force) {
    if (!opt_force && this.isPlaying) {
      return;
    }
    var playList;
    switch (mode) {
      case "battle":
        playList = battleList;
        break;
      case "finale":
        playList = finale;
        break;
      case "lobby":
      default:
        playList = lobbyList;
        break;
    }
    if (this.playList === playList && this.isPlaying) return;
    this.playList = playList;
    if (this.isPlaying) {
      let vol = this.getVolume();
      this.fadeOut(function() {
        self.sound.src = "/assets/bgm/" + self.randomSong();
        self.sound.load();
        self.play();
        self.setVolume(vol);
      });
    } else {
      this.sound.src = "/assets/bgm/" + this.randomSong();
      this.sound.load();
      this.play();
    }
  }
}

var bgm = new Bgm(lobbyList);

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
  }, 1000);
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