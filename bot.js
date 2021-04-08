const { Telegraf, Scenes, session } = require('telegraf');
const MySql = require('sync-mysql');
const Schedule = require('node-schedule');

const config = require('./config.json');

global.is_admin = ctx => {
  const user = db.query('SELECT * FROM users WHERE id = ?', [ctx.chat.id]);
  if(!user.length) return false;
  return user[0].admin;
}

global.bot = new Telegraf(config.token);
global.db = new MySql(config.mysql);
global.send = require('./send');
global.sendShops = require('./sendShops');
global.commands = {
  help : require('./commands/help'),
  flyel : require('./commands/flyel'),
  setting : require('./commands/setting'),
  about : require('./commands/about'),
  privacy : require('./commands/privacy'),
  home : require('./commands/home'),
  admin : require('./commands/admin'),
  news : require('./commands/news'),
  personal : require('./commands/personal'),
  name : ctx => ctx.scene.enter('name'),
  address : ctx => ctx.scene.enter('city'),
  contact : ctx => ctx.scene.enter('contact'),
  nearby : ctx => ctx.scene.enter('nearby'),
  shops : ctx => ctx.scene.enter('shops'),
  addflyel : ctx => {
    if(is_admin(ctx) != 2) return commands.home(ctx, false);
    ctx.scene.enter('addflyel');
  },
  users : ctx => {
    if(is_admin(ctx) != 2) return commands.home(ctx, false);
    ctx.scene.enter('users');
  },
  shopEdit : ctx => {
    if(is_admin(ctx) != 2) return commands.home(ctx, false);
    ctx.session.shopUpdate = ctx.match[1];
    ctx.scene.enter('shopUpdate');
  },
  shopRemove : ctx => {
    if(is_admin(ctx) != 2) return commands.home(ctx, false);
    ctx.session.shopUpdate = ctx.match[1];
    ctx.scene.enter('shopRemove');
  },
  addshop : ctx => {
    if(!is_admin(ctx)) return commands.home(ctx, false);
    ctx.session.shopUpdate = 'new';
    ctx.scene.enter('shopUpdate');
  }
};

const stage = new Scenes.Stage([
  require('./scenes/addflyel'),
  require('./scenes/users'),
  require('./scenes/name'),
  require('./scenes/confirmName'),
  require('./scenes/city'),
  require('./scenes/address'),
  require('./scenes/confirmAddress'),
  require('./scenes/contact'),
  require('./scenes/nearby'),
  require('./scenes/shops'),
  require('./scenes/shopUpdate'),
  require('./scenes/shopRemove')
]);

bot.use(session());
bot.use(stage.middleware());

bot.hears('❓ HELP', commands.help);
bot.command('help', commands.help);

bot.hears('🔧 SETTING', commands.setting);
bot.command('settings', commands.setting);

bot.hears('⭐ ADMIN', commands.admin);
bot.command('admin', commands.admin);

bot.hears('📖 ABOUT', commands.about);
bot.command('about', commands.about);

bot.hears('🔐 PRIVACY', commands.privacy);
bot.command('privacy', commands.privacy);

bot.hears('✏ ADDRESS', commands.address);
bot.command('address', commands.address);

bot.hears('✏ SEND CONTACT', commands.contact);
bot.command('contact', commands.contact);

bot.hears('✏ NAME', commands.name);
bot.command('name', commands.name);

bot.hears('✏ PERSONAL DATA', commands.personal);
bot.command('personal data', commands.personal);

// bot.hears('SHOP NEARBY', commands.nearby);
// bot.command('shop_nearby', commands.nearby);

bot.hears('📃 SHOPS', commands.shops);
bot.command('shops', commands.shops);

bot.hears('✉ NEWS', commands.news);
bot.command('news', commands.news);

bot.hears('📄 FLYEL', commands.flyel);
bot.command('flyel', commands.flyel);

// bot.hears('📄 ADD FLYEL', commands.addflyel);
// bot.command('addflyel', commands.addflyel);

bot.hears('🏪 ADD SHOP', commands.addshop);
bot.command('addshop', commands.addshop);

bot.hears('👥 USERS', commands.users);
bot.command('users', commands.users);

bot.hears('🏠 HOME', ctx => commands.home(ctx, false));
bot.hears('◀ BACK', ctx => commands.home(ctx, false));

bot.on('message', ctx => {
  if(ctx.update.message.location) return commands.nearby(ctx);
  commands.home(ctx, true);
});

bot.action(/shop-edit-(\d+)/, commands.shopEdit);
bot.action(/shop-remove-(\d+)/, commands.shopRemove);

// const job = Schedule.scheduleJob('* * * * *', function(){
//   console.log('The answer to life, the universe, and everything!');
// });

bot.launch(); // запуск бота
