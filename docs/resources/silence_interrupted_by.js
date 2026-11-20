let sounds = [];
//window.min_time = 0;
//window.max_time = 15;
//window.mean_time = 10;
//window.stdv = 1.0;
let clock_timeout = null;
let temp_time = 0;
let time_left = 0;
let paused = false;
let defaultOptions = [];
let clockspeed = 50
defaultOptions.push(["resources/dig.mp3","Diglett Dig"]);

function rand_n_bm() {
  let u = 0, v = 0;
  while(u === 0) u = Math.random(); //Converting [0,1) to (0,1)
  while(v === 0) v = Math.random();
  let num = Math.sqrt( -2.0 * Math.log( u )) * Math.cos( 2.0 * Math.PI * v );
  num = num * window.stdv + window.mean_time; 
  if (num > window.max_time || num < window.min_time) return rand_n_bm() 
  return num
}

function addOption(name, value) {
    let soundsSelector = document.getElementById("sound_selector");
    var opt = document.createElement('option');
    opt.value = value;
    opt.innerHTML = name;
    soundsSelector.appendChild(opt);
    return opt;
}

function pause() {
	let pauseButton = document.getElementById("pause");
	if (paused) {
		pauseButton.value = "Pause";
		paused = false;
		clearTimeout(clock_timeout);
		clock_timeout = setTimeout(tickClock, 1000/clockspeed)
	} else {
		pauseButton.value = "Unpause";
		paused = true;
	}
}

function changeRange(id) {
	let rangetext = document.getElementById(id + " time");
	let range = document.getElementById(id);
	switch (id) {
		case "min":
			window.min_time = Number(range.value)
			break;
		case "max":
			window.max_time = Number(range.value)
			if (range.value < document.getElementById("min").value) {
				window.min_time = Number(range.value)
			}
			document.getElementById("min").max = range.value;
			document.getElementById("min time").innerHTML = document.getElementById("min time").innerHTML.split(":")[0] + ": " + Number(document.getElementById("min").value).toFixed(2)
			break;
		case "mean":
			window.mean_time = Number(range.value)
			break;
		case "stand":
			window.stdv = Number(range.value)
			break;
		default:
	}
	rangetext.innerHTML = rangetext.innerHTML.split(":")[0] + ": " + Number(range.value).toFixed(2);
	time_left = rand_n_bm() * 60 * clockspeed
}


function test() {
	console.log("temp "+temp_time)
	console.log("left "+time_left)
	console.log("mean "+window.mean_time)
	console.log("st "+window.stdv)
	console.log("ct "+clock_timeout)
}

function loadSounds() {
  let soundsSelector = document.getElementById("sound_selector");
  soundsSelector.innerHTML = "";
  let opt = null;
  for(let value of defaultOptions) {
    addOption(value[1], value[0]);
  }
  for(i = 0; i < localStorage.length; i++) {
    let key = localStorage.key(i);
    let data = localStorage.getItem(key);
    opt = addOption(key, data);
  }
  if(opt) {
    soundsSelector.value = opt.value;
  }
  for(i = 0; i < soundsSelector.options.length; i++) {
    let option = soundsSelector.options[i];
    sounds[i] = new Audio(option.value);
  }
}

function playClickedSound(e) {
  let target = e.explicitOriginalTarget;
  if (!e.explicitOriginalTarget.value) {
	  target = target.parentElement;
  }
  new Audio(target.value).play();
}

function playRandomSound() {
    let soundsSelector = document.getElementById("sound_selector");
    let soundToPlay = null;
    if (soundsSelector.selectedOptions.length != 0) {
	    soundToPlay = soundsSelector.selectedOptions[Math.floor(Math.random()*soundsSelector.selectedOptions.length)].value;
    }
    if(sounds.length == 0 || sounds.length < soundsSelector.options.length) {
      loadSounds();
    }
    for(var sound of sounds) {
      if(soundToPlay && sound.src.endsWith(soundToPlay)) {
        sound.play();
      }
    }
}

function tickClock() {
	if (!paused) {
		temp_time++;
		if (temp_time > time_left) {
			playRandomSound()
			setClock()
		}
		clock_timeout = setTimeout(tickClock, 1000/clockspeed)
	}
}

function setClock() {
	temp_time = 0;
	time_left = rand_n_bm() * 60 * clockspeed
}


function uploadSounds() {
  let soundFilePicker = document.getElementById('custom_sound');
  for(file of soundFilePicker.files) {
    let fileName = file.name.replace("-", " ").replace("_", " ");
    fileName = fileName.substring(0, fileName.lastIndexOf('.'));
    if (file.type && !file.type.startsWith('audio/')) {
      console.log('File is not audio.', file.type, file);
      return;
    }

    const reader = new FileReader();
    reader.addEventListener('load', (event) => {
      localStorage.setItem(fileName, event.target.result);
      loadSounds();
    });
    reader.readAsDataURL(file);
  }
}

function clearStorage() {
  localStorage.clear();
  setTimeout(loadSounds, 200);
}

// start initial sound repeater after 5 seconds, to prevent browser from assuming autoplay
window.addEventListener("load", (event) => {
  changeRange("min");
  changeRange("max");
  changeRange("mean");
  changeRange("stand");
  pause();
  loadSounds();
});

