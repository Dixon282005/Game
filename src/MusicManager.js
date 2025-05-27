export default class MusicController {
    constructor(scene) {
        this.scene = scene;
        this.tracks = [];
        this.currentTrackIndex = 0;
        this.currentMusic = null;
        this.volume = 0.5;
        this.fadeDuration = 1500;
    }

    preload() {
        // Carga solo 2 pistas como en tu versión original
        for (let i = 1; i <= 2; i++) {
            const trackKey = `soundtrack${i}`;
            this.scene.load.audio(trackKey, [
                `src/assets/audio/soundtrack${i}.mp3`,
                `src/assets/audio/soundtrack${i}.ogg`
            ]);
            this.tracks.push(trackKey);
        }
    }

    init() {
        this.scene.sound.on('complete', (sound) => {
            if (this.tracks.includes(sound.key)) {
                this.playNextTrack();
            }
        });
    }

    startPlaylist() {
        if (this.currentMusic) {
            this.currentMusic.stop();
        }
        this.currentTrackIndex = 0;
        this.playNextTrack();
    }

    playNextTrack() {
        if (this.currentMusic) {
            this.currentMusic.stop();
        }

        const trackKey = this.tracks[this.currentTrackIndex];
        this.currentMusic = this.scene.sound.add(trackKey, {
            volume: this.volume,
            loop: false
        });
        
        this.currentMusic.play();
        this.currentTrackIndex = (this.currentTrackIndex + 1) % this.tracks.length;
    }

    stop() {
        if (this.currentMusic) {
            this.currentMusic.stop();
        }
    }

    destroy() {
        this.stop();
        this.scene.sound.off('complete');
    }
}