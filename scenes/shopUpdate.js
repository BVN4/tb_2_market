const { Scenes } = require('telegraf');

const scene = new Scenes.BaseScene('shopUpdate');

const getProgress = ctx => {
  let text = '';
  for(let i = 0; i < levels.length; i++)
    text += ctx.session.shopLevel == i ? '>'
      : ( ctx.session.shopLevel > i ? '=' : '-' );
  return '<code>[' + text + ']</code>';
}

const levels = [
  { name : 'name', required : true },
  { name : 'country', options : true, required : true },
  { name : 'region', options : true, required : true },
  { name : 'provinces', options : true, required : true },
  { name : 'city', options : true, required : true },
  { name : 'address' },
  { name : 'postcode' },
  { name : 'latitude', required : true },
  { name : 'longitude', required : true },
  { name : 'language_code' },
  { name : 'phone_number' },
  { name : 'telephone' },
  { name : 'email' },
  { name : 'mon', day : true, required : true },
  { name : 'tue', day : true, required : true },
  { name : 'wed', day : true, required : true },
  { name : 'thu', day : true, required : true },
  { name : 'fri', day : true, required : true },
  { name : 'sat', day : true, required : true },
  { name : 'sun', day : true, required : true },
  { name : 'holiday' }
];

scene.sceneText = async ctx => {
  const level = levels[ctx.session.shopLevel];

  if(!level) return scene.sceneEnd(ctx);

  let text = 'Enter shop <b>' + level.name + '</b>';
  let keyboard = [];

  if(level.options){
    text += ' or select from options';
    const shops = db.query('SELECT DISTINCT ' + level.name + ' FROM shops');

    for(let i = 0; i < shops.length; i++)
      if(shops[i][level.name] != null)
        keyboard.push([{ text : shops[i][level.name] }]);
  }

  if(level.day){
    text = level.name != 'mon' ? ''
      : 'Now you need to specify a work schedule.\nThe data must be specified in the following form:\n<code>0:00-0:00 0:00-0:00</code>\nThe opening time is indicated at the beginning. Next is the closing time. If there is a break on this day, it must be indicated in the same way. Opening time first. Then the closing time.\nHere\'s an example for a shop that opens at 9 am and closes at 6 pm and has a break from 12 am to 1 pm.\n<code>9:00-18:00 12:00-13:00</code>\nIf there is no break, then you do not need to specify anything.\n<code>9:00-18:00</code>\nIf the shop does not work that day, send it "closed".\n\n';
    text += 'Enter the work schedule on <b>' + level.name + '</b>';
  }

  if(ctx.session.shopOld[level.name])
    text += '\nOld field value: "' + ctx.session.shopOld[level.name] +
      '" (skip if you don\'t want to change)';

  if(level.name == 'latitude'){
    text += '\nYou can send your geolocation';
    keyboard.push([{ text : '🌐 SEND LOCATION', request_location : true }]);
  }

  if(level.name == 'holiday')
    text = 'Now you need to send a list of days in which the store operates in a special mode.\nYou need to send in almost the same way as before, in the work schedule.\nBut now you need to send from each line and indicate the date at the beginning in the form - month and day.\nFor example, the store does not work on January 1, and on February 14 it works in a short mode. It will look like this:\n<pre><code>01-01: closed\n02-14: 9:00-13:00</code></pre>\nYou can specify any number of days. Each date should be on a new line. ';

  let inline_keyboard = [[
    { text : 'CANCEL', callback_data : 'cancel' },
    level.required && !ctx.session.shopOld[level.name]
      ? { text : 'CAN\'T BE SKIPPED', callback_data : 'ns' }
      : { text : 'SKIP', callback_data : 'skip' }
  ]];

  await ctx.reply(text, {
    parse_mode : 'html',
    reply_markup : {
      resize_keyboard : true,
      one_time_keyboard : true,
      keyboard : keyboard
    }
  });

  await ctx.reply(getProgress(ctx), {
    parse_mode : 'html',
    reply_markup : {
      resize_keyboard : true,
      one_time_keyboard : true,
      inline_keyboard : inline_keyboard
    }
  });

}

scene.sceneEnd = async ctx => {

  const is_new = ctx.session.shopUpdate == 'new';

  let sql = '';
  let sqlValues = [];
  let values = [];
  let sets = [];

  for(let i in ctx.session.shop){
    sets.push(i + (is_new ? '' : '= ?'));
    sqlValues.push('?');
    values.push(ctx.session.shop[i]);
  }

  if(ctx.session.shopUpdate == 'new'){
    sql = 'INSERT INTO shops (' + sets.join(', ') + ') VALUES (' +
      sqlValues.join(', ') + ')';
  }else{
    values.push(ctx.session.shopUpdate);
    sql = 'UPDATE shops SET ' + sets.join(', ') + ' WHERE id = ?';
  }

  let data = db.query(sql, values);
  if(data.insertId) ctx.session.shopUpdate = data.insertId;

  const shops = db.query('SELECT * FROM shops WHERE id = ?',
    [ctx.session.shopUpdate]);

  sendShops(ctx, shops);

  await ctx.scene.leave();
  await commands.home(ctx);
}

scene.sceneLeave = async ctx => {
  await ctx.scene.leave();
  await commands.home(ctx);
}

scene.enter(async ctx => {
  ctx.session.shop = {};
  ctx.session.shopOld = {};
  ctx.session.shopLevel = 0;

  let text = '.\nGo through few steps and fill in the required information.\nYou can skip some of the steps.\nProgress is displayed at each step.';
  const shop = db.query('SELECT * FROM shops WHERE id = ?',
    [ctx.session.shopUpdate]);

  if(ctx.session.shopUpdate != 'new'){
    if(!shop.length) return scene.sceneLeave();
    ctx.session.shopOld = shop[0];
    text = 'Editing the shop' + text
  }else text = 'Shop creation' + text

  await ctx.reply(text);
  await scene.sceneText(ctx);
});

scene.action('skip', ctx => {
  ++ctx.session.shopLevel;
  scene.sceneText(ctx);
});
scene.action('cancel', scene.sceneLeave);
scene.on('message', async ctx => {
  const level = levels[ctx.session.shopLevel];

  if(level.name == 'latitude' && ctx.update.message.location){
    ctx.session.shop.latitude = ctx.update.message.location.latitude;
    ctx.session.shop.longitude = ctx.update.message.location.longitude;
    ctx.session.shopLevel += 2;
  }else if(level.name == 'holiday'){
    const text = ctx.message.text.toLocaleLowerCase().split('\n');
    ctx.session.shop.holiday = {};
    let breaked = false;
    for(let i = 0; i < text.length; i++){
      const m = text[i].match(/(\d{2}-\d{2}):\s+((\d{1,2}:\d{2})-(\d{1,2}:\d{2})(\s+(\d{1,2}:\d{2})-(\d{1,2}:\d{2}))?|closed)/);
      if(m){
        if(m[2] == 'closed')
          ctx.session.shop.holiday[m[1]] = '';
        else
          ctx.session.shop.holiday[m[1]] = {
            open : m[3],
            close : m[4],
            breakStart : m[6] ? m[6] : '',
            breakEnd : m[7] ? m[7] : ''
          };
      }else{
        await ctx.reply('Incorrect data!');
        breaked = true;
        break;
      }
    }
    try{
      ctx.session.shop.holiday = JSON.stringify(ctx.session.shop.holiday);
      if(breaked)
        await ctx.reply('Incorrect data!');
      else
        ++ctx.session.shopLevel;
    }catch(e){
      await ctx.reply('Incorrect data!');
    }
  }else if(level.day){
    const m = ctx.message.text.match(/(\d{1,2}:\d{2})-(\d{1,2}:\d{2})(\s+(\d{1,2}:\d{2})-(\d{1,2}:\d{2}))?/);
    if(ctx.message.text.toLocaleLowerCase() == 'closed'){
      ctx.session.shop[level.name] = '0';
      ++ctx.session.shopLevel;
    }else if(m){
      ctx.session.shop[level.name] = JSON.stringify({
        open : m[1],
        close : m[2],
        breakStart : m[4] ? m[4] : '',
        breakEnd : m[5] ? m[5] : ''
      });
      ++ctx.session.shopLevel;
    }else
      await ctx.reply('Incorrect data!');
  }else if(ctx.update.message.text){
    ctx.session.shop[level.name] = ctx.message.text;
    ++ctx.session.shopLevel;
  }

  scene.sceneText(ctx);
});

module.exports = scene;
