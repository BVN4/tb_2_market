const { Scenes } = require('telegraf');

const scene = new Scenes.BaseScene('shops');

const levels = ['country', 'region', 'provinces', 'city'];

const whereShops = ctx => {
  let where = [];
  let whereVal = [];

  for(let i in ctx.session.shops){
    where.push(i + ' = ?');
    whereVal.push(ctx.session.shops[i]);
  }

  if(where.length) where = ' WHERE ' + where.join(' AND ');

  return { where : where, whereVal : whereVal };
}


scene.sceneText = ctx => {
  const level = levels[ctx.session.shopsLevel];

  const w = whereShops(ctx);

  const shops = db.query('SELECT DISTINCT ' + level + ' FROM shops' + w.where,
    w.whereVal);

  for(let i = 0; i < shops.length; i++)
    if(shops[i][level] == null) shops.splice(i, 1)

  if(shops.length < 2){
    ++ctx.session.shopsLevel;
    if(ctx.session.shopsLevel > 4) ctx.session.shopsLevel = 0;
    return ctx.session.shopsLevel < 3 ? scene.sceneText(ctx)
      : scene.sceneEnd(ctx);
  }

  let text = 'Select ' + level + ' from the list:';
  let keyboard = [];
  for(let i = 0; i < shops.length; i++)
    keyboard.push([{text : shops[i][level], callback_data : shops[i][level]}]);

  ctx.reply(text, {
    reply_markup : {
      resize_keyboard : true,
      inline_keyboard : keyboard
    }
  });
};


scene.sceneLeave = async ctx => {
  await ctx.scene.leave();
  await commands.home(ctx);
}

scene.sceneEnd = async ctx => {
  const selection = 1;

  if(ctx.update.message){
    if(ctx.update.message.text == '◀ BACK') ctx.session.shopsQty -= selection;
    if(ctx.update.message.text == '▶ NEXT') ctx.session.shopsQty += selection;
    if((ctx.update.message.text != '◀ BACK' && ctx.update.message.text != '▶ NEXT')
      || ctx.session.shopsQty < 0){
      if(!ctx.update.message.location){
        await ctx.scene.leave();
        await commands.home(ctx);
        return;
      }
    }
  }

  const w = whereShops(ctx);

  const count = db.query('SELECT COUNT(1) AS count FROM shops' + w.where,
    w.whereVal)[0].count;

  w.whereVal.push(ctx.session.shopsQty);
  w.whereVal.push(selection);

  const shops = db.query('SELECT * FROM shops' + w.where + ' LIMIT ?,?',
    w.whereVal);

  let keyboard = [{ text : '🏠 HOME' }];
  if(ctx.session.shopsQty - selection >= 0) keyboard.push({ text : '◀ BACK' });
  if(ctx.session.shopsQty + selection < count) keyboard.push({ text : '▶ NEXT' });

  sendShops(ctx, shops, keyboard);
}

scene.action(/shop-edit-(\d+)/, commands.shopEdit);
scene.action(/shop-remove-(\d+)/, commands.shopRemove);
scene.action(/.+/, async ctx => {
  ctx.session.shops[levels[ctx.session.shopsLevel]] = ctx.match[0];
  if(ctx.session.shopsLevel < 3){
    ++ctx.session.shopsLevel;
    return scene.sceneText(ctx);
  }

  scene.sceneEnd(ctx);
});
scene.enter(async ctx => {
  ctx.session.shops = {};
  ctx.session.shopsQty = 0;
  ctx.session.shopsLevel = 0;
  await ctx.reply('Shops', {
    reply_markup : {
      resize_keyboard : true,
      keyboard : [[{ text : '◀ BACK' }]]
    }
  });
  await scene.sceneText(ctx);
});
scene.start(scene.sceneLeave);
scene.on('message', scene.sceneEnd);

module.exports = scene;
