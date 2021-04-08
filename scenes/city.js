const { Scenes } = require('telegraf');

const scene = new Scenes.BaseScene('city');

scene.sceneText = ctx => send(ctx, 'Please write your city', {
  reply_markup : {
    resize_keyboard : true,
    keyboard : [ [{text : '◀ CANCEL'}] ]
  }
});
scene.sceneLeave = ctx => {
  ctx.scene.leave();
  commands.setting(ctx);
}
scene.enter(scene.sceneText);
scene.hears('◀ CANCEL', scene.sceneLeave);
scene.start(scene.sceneLeave);
scene.on('text', ctx => {
  ctx.session.city = ctx.message.text;
  ctx.scene.enter('address')
});
scene.on('message', scene.sceneText);

module.exports = scene;
