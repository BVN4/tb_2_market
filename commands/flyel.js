const fs = require('fs');

module.exports = async ctx => {
  await ctx.reply('Please wait for the file to download');
  await ctx.replyWithDocument({
    url : 'http://www.conad.it/content/dam/conad-sicilia/conad-consumer/volantini/istituzionali/2021/promo_06/Volantino-Conad-2100000000021.pdf'
  });
};
