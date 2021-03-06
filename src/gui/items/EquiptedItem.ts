import Game from '../../Game';
import Hud from '../Hud';
import GuiItem from './GuiItem';

export default class EquiptedItem extends GuiItem {
    frameSprite: Phaser.Sprite;
    itemSprite: Phaser.Sprite;

    frames: Phaser.FrameData;

    constructor(game: Game, parent: Hud, x: number, y: number, value: string = '') {
        super(game, parent, x, y, 'equipted', value);

        this.frames = game.cache.getFrameData('sprite_gui');

        this.frameSprite = game.add.sprite(0, 0, 'sprite_gui', 'hud/item-frame.png', this);
        this.itemSprite = game.add.sprite(6, 0, 'sprite_gui', 'items/lantern.png', this);

        this.itemSprite.visible = false;
        // this.itemSprite.scale.set(2);

        this.setValue(value);
    }

    setValue(val: any) {
        super.setValue(val);

        const tx = this.frames.getFrameByName('items/' + val + '.png');

        if (!tx) {
            this.itemSprite.visible = false;
        }
        else {
            this.itemSprite.visible = true;
            this.itemSprite.setFrame(tx);
        }

        return this;
    }
}
