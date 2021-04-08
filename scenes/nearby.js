const { Scenes } = require('telegraf');

const scene = new Scenes.BaseScene('nearby');

scene.sceneText = ctx => {
  ctx.session.shops = 0;
  db.query('UPDATE users SET latitude = ?, longitude = ? WHERE id = ?', [
    ctx.session.latitude = ctx.update.message.location.latitude,
    ctx.session.longitude = ctx.update.message.location.longitude,
    ctx.update.message.chat.id
  ]);
  scene.sceneEnd(ctx);
};

scene.sceneLeave = async ctx => {
  await ctx.reply('You can select the store manually by clicking on [SHOPS]');
  await ctx.scene.leave();
  await commands.home(ctx);
}

scene.sceneEnd = async ctx => {
  const count = db.query('SELECT COUNT(1) AS count FROM shops')[0].count;
  const selection = 1;

  if(ctx.update.message.text == '◀ BACK') ctx.session.shops -= selection;
  if(ctx.update.message.text == '▶ NEXT') ctx.session.shops += selection;
  if((ctx.update.message.text != '◀ BACK' && ctx.update.message.text != '▶ NEXT')
    || ctx.session.shops < 0){
    if(!ctx.update.message.location){
      await ctx.scene.leave();
      await commands.home(ctx);
      return;
    }
  }

  const shops = db.query('SELECT * FROM shops ORDER BY ACOS(SIN(RADIANS(latitude))*SIN(RADIANS(?))+COS(RADIANS(latitude))*COS(RADIANS(?))*COS(RADIANS(?-longitude)))*6371 LIMIT ?,?', [
    ctx.session.latitude,
    ctx.session.latitude,
    ctx.session.longitude,
    ctx.session.shops,
    selection
  ]);

  let keyboard = [{ text : '🏠 HOME' }];
  if(ctx.session.shops - selection >= 0) keyboard.push({ text : '◀ BACK' });
  if(ctx.session.shops + selection < count) keyboard.push({ text : '▶ NEXT' });

  sendShops(ctx, shops, keyboard);
}

scene.action(/shop-edit-(\d+)/, commands.shopEdit);
scene.action(/shop-remove-(\d+)/, commands.shopRemove);
scene.enter(scene.sceneText);
scene.start(scene.sceneLeave);
scene.on('message', scene.sceneEnd);

module.exports = scene;
