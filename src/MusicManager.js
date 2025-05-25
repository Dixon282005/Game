export default class MusicManager {
    constructor(scene) {
        this.scene = scene;
        this.tracks = {
            first: null,
            second: null
        };
        this.currentTrack = null;
        this.volume = 0.7;
        this.isPlaying = false;
    }

    preload() {
        // Carga los soundtracks con manejo de errores
        try {
            this.scene.load.audio('soundtrack1', 'src/assets/audio/soundtrack1.mp3');
            this.scene.load.audio('soundtrack2', 'src/assets/audio/soundtrack2.mp3');
            return true;
        } catch (error) {
            console.error("Error loading audio files:", error);
            return false;
        }
    }

    playInfiniteLoop() {
        // Verifica si los archivos están cargados
        if (!this.scene.sound.get('soundtrack1') || !this.scene.sound.get('soundtrack2')) {
            console.error("Audio files not loaded yet");
            return;
        }

        // Crea las instancias de audio si no existen
        if (!this.tracks.first) {
            this.tracks.first = this.scene.sound.add('soundtrack1', {
                volume: this.volume,
                loop: false
            });
        }

        if (!this.tracks.second) {
            this.tracks.second = this.scene.sound.add('soundtrack2', {
                volume: this.volume,
                loop: false
            });
        }

        // Detener cualquier reproducción actual
        this.stopAll();

        // Comienza con la primera pista
        this.currentTrack = this.tracks.first;
        this.currentTrack.play();
        this.isPlaying = true;

        // Configura el manejador de finalización
        this.currentTrack.on('complete', () => {
            this.playNextInSequence();
        });
    }

    playNextInSequence() {
        if (!this.isPlaying) return;

        // Alterna entre las dos pistas
        this.currentTrack = (this.currentTrack === this.tracks.first) 
            ? this.tracks.second 
            : this.tracks.first;

        // Reproduce la siguiente pista
        this.currentTrack.play();

        // Vuelve a configurar el manejador
        this.currentTrack.on('complete', () => {
            this.playNextInSequence();
        });
    }

    stopAll() {
        this.isPlaying = false;
        
        if (this.currentTrack) {
            this.currentTrack.off('complete');
            this.currentTrack.stop();
        }
        
        if (this.tracks.first) this.tracks.first.stop();
        if (this.tracks.second) this.tracks.second.stop();
        
        this.currentTrack = null;
    }

    setVolume(volume) {
        this.volume = Phaser.Math.Clamp(volume, 0, 1);
        if (this.currentTrack) {
            this.currentTrack.setVolume(this.volume);
        }
    }
}