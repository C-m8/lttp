var rgxNewlines = /\n/g;

module Lttp.Gui {
    export class Dialog extends Phaser.Group {
        openSound: Phaser.Sound;

        frameSprite: Phaser.Sprite;

        font: Fonts.ReturnOfGanon;

        doneCb: () => void;

        text: string = '';
        range: number[] = [0, 1]; //start pos, length

        fastSpeed: number = 15;
        typeSpeed: number = 60;
        speed: number = 60;

        speedCooldown: number = 250;

        padding: number = 5;

        typing: boolean = false;

        buffer: Phaser.RenderTexture;
        bufferSprite: Phaser.Sprite;
        bufferScroll: Phaser.Point;

        constructor(game: Phaser.Game, parent?: any, showFrame: boolean = true) {
            super(game, parent);

            // load sound
            this.openSound = this.game.add.audio('effect_pause_close', Data.Constants.AUDIO_MUSIC_VOLUME);

            // setup visibility
            // this.position.set(102, 438);
            this.visible = false;

            // add background
            this.frameSprite = this.game.add.sprite(0, 0, 'sprite_gui', 'dialog.png', this);
            this.frameSprite.visible = showFrame;

            // add font
            this.font = new Fonts.ReturnOfGanon(game, 8, 8);
            this.font.scale.set(0.5, 0.5);
            this.add(this.font);

            // initialize the render buffer
            this.buffer = game.add.renderTexture(348, 92); // 174, 46
            this.bufferScroll = new Phaser.Point(0, 0);
            this.bufferSprite = game.add.sprite(0, 0, this.buffer, null, this);
            this.bufferSprite.scale.set(0.5, 0.5);
            this.bufferSprite.position.set(this.font.position.x, this.font.position.y);
        }

        show(text: string, speed?: number, insertNewlines: boolean = true, playSound: boolean = true, cb?: () => void) {
            this.visible = true;

            this.range[0] = 0;
            this.range[1] = 1;

            this.text = insertNewlines ? this._insertNewlines(text) : text;
            this.speed = speed || this.typeSpeed;
            this.doneCb = null;
            this.font.text = '';

            if (this.text.charAt(this.text.length - 1) !== '\n') {
                this.text += '\n';
            }

            if (playSound) {
                this.openSound.play();
            }

            var self = this;
            this._type(function() {
                setTimeout(function() {
                    self.doneCb = cb;
                }, self.speedCooldown);
            });

            return this;
        }

        hide() {
            this.visible = false;

            return this;
        }

        append(text: string, insertNewlines: boolean = true) {
            this.text += insertNewlines ? this._insertNewlines(text) : text;

            if (this.text.charAt(this.text.length - 1) !== '\n') {
                this.text += '\n';
            }

            if (!this.typing) {
                this._type();
            }
        }

        advance() {
            // done typing
            if(this.doneCb) {
                this.doneCb();
                this.doneCb = null;
            }
            // speed up typing
            else {
                this.speed = this.fastSpeed;

                var self = this;
                setTimeout(function() {
                    self.speed = self.typeSpeed;
                }, this.speedCooldown);
            }

            return this;
        }

        private _type(cb?: () => void) {
            var newlines = this.font.text.match(rgxNewlines);

            if((this.range[0] + this.range[1]) > this.text.length) {
                this.typing = false;

                this.font.visible = true;
                this.buffer.render(this.font, this.bufferScroll, true);
                this.bufferSprite.visible = true;
                this.font.visible = false;

                if(cb) cb();
            }
            else if (newlines && newlines.length && newlines.length === 3) {
                this.typing = true;

                this.font.visible = true;
                this.buffer.render(this.font, this.bufferScroll, true);
                this.bufferSprite.visible = true;
                this.font.visible = false;

                this.bufferScroll.y -= 1;

                if (this.bufferScroll.y > -32) {
                    setTimeout(this._type.bind(this, cb), this.fastSpeed);
                } else {
                    var newStart = this.text.indexOf('\n', this.range[0]);

                    this.range[1] = this.range[1] - (newStart - this.range[0]) - 1;
                    this.range[0] = newStart + 1;

                    this.font.text = this.text.substr(this.range[0], this.range[1] - 1);

                    this.bufferScroll.y = 0;

                    setTimeout(this._type.bind(this, cb), this.speed);
                }
            }
            else {
                this.typing = true;

                this.font.visible = true;
                this.bufferSprite.visible = false;

                this.font.text = this.text.substr(this.range[0], this.range[1]);

                this.range[1]++;

                setTimeout(this._type.bind(this, cb), this.speed);
            }
        }

        private _getPreviousSpace(str, i) {
            var sub = 0;

            do {
                if(str[i - sub] === ' ') {
                    return i - sub;
                }

                sub++;
            } while((i + sub) < str.length || (i - sub) > 0);
        }

        private _insertNewlines(text: string) {
            var i = 30;
            while(text[i]) {
                var sp = this._getPreviousSpace(text, i);
                text = [text.slice(0, sp), text.slice(sp + 1)].join('\n');
                i += 30;
            }

            return text;
        }
    }
}